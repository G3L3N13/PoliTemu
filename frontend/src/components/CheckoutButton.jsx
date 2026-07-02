// frontend/src/components/CheckoutButton.jsx
import React from "react";
import stripePromise from "../services/stripeClient";
import { auth } from "../services/firebase"; // asegúrate que existe este export y está inicializado

export default function CheckoutButton({ items, customerEmail }) {
  const handleCheckout = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "/api";

      // Obtener token Firebase (si hay usuario logueado)
      let token = null;
      try {
        if (auth && auth.currentUser) {
          // fuerza refrescar token por si acaso
          token = await auth.currentUser.getIdToken(true);
          console.log("DEBUG CheckoutButton: token obtenido");
        }
      } catch (tErr) {
        console.warn("No se pudo obtener token firebase:", tErr);
      }

      const resp = await fetch(`${apiUrl}/checkout/create-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ items, customer_email: customerEmail })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "response not json" }));
        console.error("Error creating session:", err);
        alert("No se pudo iniciar el pago. Revisa la consola del servidor.");
        return;
      }

      const data = await resp.json();

      // data.url es la URL completa de Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
        return;
      }

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