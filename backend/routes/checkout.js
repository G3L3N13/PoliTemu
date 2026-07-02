// backend/routes/checkout.js
import express from "express";
import Stripe from "stripe";
import { db, authAdmin } from "../config/firebase.js"; // db y authAdmin exportados por tu config

const router = express.Router();

// Inicializar Stripe con la clave del entorno
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15"
});

// Helper: parsear body de forma segura
function resolveBody(req) {
  let bodyData = req.body;
  if ((!bodyData || Object.keys(bodyData).length === 0) && req.rawBody) {
    try {
      bodyData = JSON.parse(req.rawBody.toString());
    } catch (parseErr) {
      console.warn("DEBUG create-session: falló parsear req.rawBody:", parseErr);
      bodyData = {};
    }
  }
  return bodyData || {};
}

// POST /api/checkout/create-session
// Body esperado: { items: [{ id, nombre, precio, cantidad }], customer_email?: string, successUrl?: string, cancelUrl?: string }
router.post("/create-session", async (req, res) => {
  try {
    const bodyData = resolveBody(req);

    console.log('DEBUG create-session: body recibido (resuelto):', JSON.stringify(bodyData).slice(0,2000));
    console.log('DEBUG create-session: STRIPE_SECRET_KEY presente?', !!process.env.STRIPE_SECRET_KEY);
    console.log('DEBUG create-session: FRONTEND_URL =>', process.env.FRONTEND_URL || '(no definida)');

    const { items = [], customer_email, successUrl, cancelUrl } = bodyData || {};

    const currency = process.env.STRIPE_CURRENCY || "usd";

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío o items no es un array" });
    }

    // Validación y normalización: asegurar precios numéricos
    const normalizedItems = items.map((it) => {
      const precioNum = typeof it.precio === "number" ? it.precio : Number(it.precio);
      return {
        id: it.id || "",
        nombre: it.nombre || it.title || `Producto ${it.id || ""}`,
        precio: precioNum,
        cantidad: Number(it.cantidad || 1)
      };
    });

    for (const it of normalizedItems) {
      if (typeof it.precio !== "number" || Number.isNaN(it.precio)) {
        console.error('DEBUG create-session: item con precio inválido', it);
        return res.status(400).json({ error: "Formato de precio inválido en items (precio debe ser number)" });
      }
      if (!Number.isInteger(it.cantidad) || it.cantidad <= 0) {
        console.error('DEBUG create-session: item con cantidad inválida', it);
        return res.status(400).json({ error: "Formato de cantidad inválido en items (cantidad debe ser entero > 0)" });
      }
    }

    // Intentar verificar token Firebase (opcional) para asociar uid en metadata
    let uid = null;
    try {
      const authHeader = req.headers.authorization || req.headers.Authorization || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
      if (token) {
        const decoded = await authAdmin.verifyIdToken(token);
        uid = decoded.uid;
        console.log("DEBUG create-session: token verificado, uid =", uid);
      }
    } catch (verifyErr) {
      console.warn("DEBUG create-session: no se pudo verificar token (continuando sin uid):", verifyErr?.message || verifyErr);
    }

    // Construir line_items para Stripe
    const line_items = normalizedItems.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.nombre,
          metadata: {
            productId: item.id || ""
          }
        },
        unit_amount: Math.round(item.precio * 100) // convertir a centavos
      },
      quantity: item.cantidad
    }));

    // Llamada a Stripe para crear la session
    console.log('DEBUG create-session: Llamando a Stripe para crear session con', line_items.length, 'line_items...');
    console.time('stripeCreateSession');

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        customer_email: customer_email || undefined,
        success_url: successUrl || `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/carrito`,
        metadata: {
          integration: "politemu",
          uid: uid || ""
        }
      });
      console.timeEnd('stripeCreateSession');
      console.log('DEBUG create-session: Stripe respondió con session.id=', session.id, ' session.url=', !!session.url);
    } catch (stripeErr) {
      console.timeEnd('stripeCreateSession');
      console.error('ERROR create-session: fallo creando session en Stripe:', stripeErr && stripeErr.message ? stripeErr.message : stripeErr);
      console.error('ERROR create-session: stack:', stripeErr && stripeErr.stack ? stripeErr.stack : 'sin stack');
      return res.status(500).json({ error: 'Error creando sesión de pago (Stripe). Revisa logs del servidor.' });
    }

    // Responder con session id y url (url existe en la mayoría de los casos)
    return res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Error creando session Stripe:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Webhook: stripe envía eventos (p. ej. checkout.session.completed)
// Esta ruta asume que en index.js se capturó el raw body para /api/checkout/webhook en express.json verify
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const rawBody = req.rawBody ? req.rawBody : JSON.stringify(req.body);
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // En desarrollo sin webhook signing secreto, usar req.body (NO recomendado en prod)
      event = req.body;
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err && err.message ? err.message : err);
    return res.status(400).send(`Webhook Error: ${err && err.message ? err.message : 'Invalid signature'}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Checkout completed - session id:", session.id);

        // Idempotencia: evitar duplicados
        const pagosQuery = await db.collection("pagos")
          .where("sessionId", "==", session.id)
          .limit(1)
          .get();

        if (!pagosQuery.empty) {
          console.log("Pago ya registrado para session:", session.id);
          break;
        }

        // Guardar pago en Firestore
        const pagoDoc = {
          sessionId: session.id,
          amount_total: session.amount_total, // en centavos
          currency: session.currency,
          customer_email: session.customer_email || null,
          metadata: session.metadata || {},
          created_at: new Date()
        };

        await db.collection("pagos").add(pagoDoc);
        console.log("Pago registrado en Firestore:", pagoDoc);

        // Si usas orders y pasas orderId en metadata, podrías actualizar la orden aquí
        // if (session.metadata && session.metadata.orderId) { ... }

        break;
      }

      case "payment_intent.succeeded": {
        // opcional: manejo adicional si necesitas
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (e) {
    console.error("Error handling webhook event:", e);
    return res.status(500).send();
  }

  res.json({ received: true });
});

export default router;