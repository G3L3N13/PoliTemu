// frontend/src/components/CheckoutButton.jsx
import React from "react";
import stripePromise from "../services/stripeClient"; // si lo creaste
// si no creaste stripeClient: import { loadStripe } from '@stripe/stripe-js';

export default function CheckoutButton({ items, customerEmail }) {
  const handleCheckout = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "/api";
      const resp = await fetch(`${apiUrl}/checkout/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customer_email: customerEmail })
      });

      if (!resp.ok) {
        const err = await resp.json();
        console.error("Error creating session:", err);
        alert("No se pudo iniciar el pago. Intenta de nuevo.");
        return;
      }

      const data = await resp.json();

      // data.url es la URL completa de Stripe Checkout (recomendado)
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      // alternativa: usar redirectToCheckout con sessionId
      const stripe = await stripePromise;
      const result = await stripe.redirectToCheckout({ sessionId: data.id });
      if (result.error) {
        console.error(result.error);
        alert(result.error.message || "Error redirigiendo a Stripe");
      }
    } catch (err) {
      console.error("Error en handleCheckout:", err);
      alert("Error al iniciar el pago");
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
    >
      Pagar ahora
    </button>
  );
}