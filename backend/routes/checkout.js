// backend/routes/checkout.js
import express from "express";
import Stripe from "stripe";
import { db } from "../config/firebase.js"; // usa tu Firestore admin exportado

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/checkout/create-session
// Body esperado: { items: [{ id, nombre, precio, cantidad }], customer_email?: string, successUrl?: string, cancelUrl?: string }
router.post("/create-session", async (req, res) => {
  try {
    const { items = [], customer_email, successUrl, cancelUrl } = req.body;
    const currency = process.env.STRIPE_CURRENCY || "usd";

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    const line_items = items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.nombre || item.title || `Producto ${item.id || ""}`,
          metadata: {
            productId: item.id || ""
          }
        },
        unit_amount: Math.round((item.precio || 0) * 100) // en centavos
      },
      quantity: item.cantidad || 1
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer_email: customer_email || undefined,
      success_url: successUrl || `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/carrito`,
      metadata: {
        integration: "politemu"
        // puedes añadir orderId u otra referencia aquí
      }
    });

    return res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Error creando session Stripe:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Webhook: stripe envía eventos (p. ej. checkout.session.completed)
// ESTA RUTA USA express.raw para verificar la firma
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    // Si tenemos req.rawBody (se estableció en el middleware), úsalo para verificar la firma
    const rawBody = req.rawBody ? req.rawBody : JSON.stringify(req.body);
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // En dev sin webhook signing secreto, parseamos el body (NO recomendado en prod)
      event = req.body;
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Checkout completed - session id:", session.id);

        // --- IDempotencia: evitar crear duplicados ---
        const pagosQuery = await db.collection("pagos")
          .where("sessionId", "==", session.id)
          .limit(1)
          .get();

        if (!pagosQuery.empty) {
          console.log("Pago ya registrado para session:", session.id);
          break; // ya existe, no continuar
        }

        // --- Guardar pago en Firestore ---
        const pagoDoc = {
          sessionId: session.id,
          amount_total: session.amount_total, // en centavos
          currency: session.currency,
          customer_email: session.customer_email || null,
          // cualquier metadata adicional que quieras guardar:
          metadata: session.metadata || {},
          created_at: new Date()
        };

        await db.collection("pagos").add(pagoDoc);
        console.log("Pago registrado en Firestore:", pagoDoc);

        // --- Opcional: actualizar pedido/orden en tu colección si usas orders ---
        // if (session.metadata && session.metadata.orderId) {
        //   await db.collection("orders").doc(session.metadata.orderId).update({
        //     status: "paid",
        //     paid_at: new Date(),
        //     payment_session_id: session.id
        //   });
        // }

        break;
      }

      case "payment_intent.succeeded": {
        // opcional: manejar payment intent si te interesa
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (e) {
    console.error("Error handling webhook event:", e);
    // si hay un error interno, responde 500 para que Stripe reintente
    return res.status(500).send();
  }

  // Responder 200 OK a Stripe
  res.json({ received: true });
});

export default router;