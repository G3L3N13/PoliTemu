// backend/routes/checkout.js
import express from "express";
import Stripe from "stripe";

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

    // Mapear items al formato de Stripe (price_data)
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
      // Puedes pasar metadata si necesitas relacionar con tu DB
      metadata: {
        integration: "politemu"
      }
    });

    // devolver url y id
    return res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Error creando session Stripe:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Webhook: stripe envía eventos (p. ej. checkout.session.completed)
// IMPORTANTE: esta ruta debe recibir raw body para verificar la firma (usa express.raw)
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Si no hay webhook secret (no recomendado en prod), confiar en el body (solo para dev, con cuidado)
      event = req.body;
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar eventos
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("Checkout completed:", session.id, "amount_total:", session.amount_total);

      // TODO: aquí marca pedido como pagado en tu DB:
      // - recuperar metadata si guardaste order id
      // - crear registro de pago / pedido
      // Ejemplo pseudo-código:
      // await ordersService.markAsPaid({ sessionId: session.id, amount: session.amount_total, customer_email: session.customer_email });

      break;
    }

    case "payment_intent.succeeded": {
      // opcional
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export default router;