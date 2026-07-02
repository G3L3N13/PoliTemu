// backend/routes/checkout.js
import express from "express";
import Stripe from "stripe";
import { db, authAdmin } from "../config/firebase.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15"
});

// Helper: resolver body (soporta req.body y req.rawBody si existe)
function resolveBody(req) {
  let bodyData = req.body;
  if ((!bodyData || Object.keys(bodyData).length === 0) && req.rawBody) {
    try {
      bodyData = JSON.parse(req.rawBody.toString());
    } catch (err) {
      console.warn("resolveBody: parse req.rawBody failed:", err);
      bodyData = {};
    }
  }
  return bodyData || {};
}

// POST /api/checkout/create-session
router.post("/create-session", async (req, res) => {
  try {
    const bodyData = resolveBody(req);

    console.log("DEBUG create-session body:", JSON.stringify(bodyData).slice(0, 2000));
    console.log("DEBUG STRIPE_SECRET_KEY present?", !!process.env.STRIPE_SECRET_KEY);

    const { items = [], customer_email, successUrl, cancelUrl } = bodyData || {};
    const currency = process.env.STRIPE_CURRENCY || "usd";

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío o items no es un array" });
    }

    // Normalizar items (precio a number, cantidad a integer)
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
        return res.status(400).json({ error: "Formato de precio inválido en items" });
      }
      if (!Number.isInteger(it.cantidad) || it.cantidad <= 0) {
        return res.status(400).json({ error: "Formato de cantidad inválido en items" });
      }
    }

    // Verificar token Firebase (opcional) para metadata.uid
    let uid = "";
    try {
      const authHeader = req.headers.authorization || req.headers.Authorization || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
      if (token) {
        const decoded = await authAdmin.verifyIdToken(token);
        uid = decoded.uid;
        console.log("DEBUG create-session: token valid, uid=", uid);
      }
    } catch (err) {
      console.warn("DEBUG create-session: token verification failed, continuing without uid:", err?.message || err);
    }

    // Construir line_items para Stripe
    const line_items = normalizedItems.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.nombre,
          metadata: { productId: item.id || "" }
        },
        unit_amount: Math.round(item.precio * 100)
      },
      quantity: item.cantidad
    }));

    // Determinar frontend base URL (fallback desde req)
    const frontendBaseUrl = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.replace(/\/+$/, "")
      : `${req.protocol}://${req.get("host")}`;

    const successUrlFinal = successUrl || `${frontendBaseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrlFinal = cancelUrl || `${frontendBaseUrl}/carrito`;

    console.log("DEBUG create-session: creating Stripe session, successUrl:", successUrlFinal);

    console.time("stripeCreateSession");
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        customer_email: customer_email || undefined,
        success_url: successUrlFinal,
        cancel_url: cancelUrlFinal,
        metadata: {
          integration: "politemu",
          uid: uid || ""
        }
      });
      console.timeEnd("stripeCreateSession");
      console.log("DEBUG stripe session id:", session.id);
    } catch (stripeErr) {
      console.timeEnd("stripeCreateSession");
      console.error("ERROR creating stripe session:", stripeErr && stripeErr.message ? stripeErr.message : stripeErr);
      return res.status(500).json({ error: "Error creando sesión de pago (Stripe). Revisa logs del servidor." });
    }

    return res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Error in create-session:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// GET /api/checkout/session?sessionId=...
// Devuelve la session para mostrar en frontend (expand payment_intent, customer)
router.get("/session", async (req, res) => {
  try {
    const sessionId = req.query.sessionId || req.query.session_id || req.query.id;
    if (!sessionId) return res.status(400).json({ error: "sessionId query param is required" });

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent", "customer"] });
    return res.json(session);
  } catch (err) {
    console.error("Error retrieving Stripe session:", err);
    return res.status(500).json({ error: "Error retrieving session from Stripe" });
  }
});

// Webhook: stripe -> /api/checkout/webhook
// Nota: en backend/index.js se debe usar express.json({ verify: ... }) para capturar req.rawBody
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const rawBody = req.rawBody ? req.rawBody : JSON.stringify(req.body);
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      event = req.body;
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err && err.message ? err.message : err);
    return res.status(400).send(`Webhook Error: ${err && err.message ? err.message : "Invalid signature"}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Webhook: checkout.session.completed:", session.id);

        const pagosQuery = await db.collection("pagos").where("sessionId", "==", session.id).limit(1).get();
        if (!pagosQuery.empty) {
          console.log("Pago ya registrado para session:", session.id);
          break;
        }

        const pagoDoc = {
          sessionId: session.id,
          amount_total: session.amount_total,
          currency: session.currency,
          customer_email: session.customer_email || null,
          metadata: session.metadata || {},
          created_at: new Date()
        };

        await db.collection("pagos").add(pagoDoc);
        console.log("Pago registrado en Firestore:", pagoDoc);
        break;
      }

      case "payment_intent.succeeded": {
        // opcional: manejar
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }
  } catch (err) {
    console.error("Error handling webhook event:", err);
    return res.status(500).send();
  }

  res.json({ received: true });
});

export default router;