import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { carritoService } from "../services/api"; // para vaciar carrito opcionalmente

function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id") || searchParams.get("sessionId");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No se encontró session_id en la URL.");
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "/api";
        const resp = await fetch(`${apiUrl}/checkout/session?sessionId=${encodeURIComponent(sessionId)}`, {
          headers: { "Content-Type": "application/json" }
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "error fetching session" }));
          setError(err.error || "No se pudo obtener la información de la sesión.");
          setLoading(false);
          return;
        }

        const data = await resp.json();
        setSession(data);
        setLoading(false);

        // Si la sesión está pagada, vaciamos el carrito para mejorar UX.
        // Nota: la fuente de la verdad es el webhook; esto solo mejora UX local.
        const pagoCompletado = data.payment_status === "paid" || (data.payment_intent && data.payment_intent.status === "succeeded");
        if (pagoCompletado) {
          try {
            await carritoService.vaciar();
          } catch (e) {
            console.warn("No se pudo vaciar carrito automáticamente:", e);
          }
        }
      } catch (e) {
        console.error("Error fetching session:", e);
        setError("Error obteniendo información del pago.");
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Cargando información del pago...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen p-10 bg-[#0a0a1a] text-white">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-gray-300 mb-6">{error}</p>
        <button onClick={() => navigate("/")} className="bg-purple-600 px-4 py-2 rounded">Volver al inicio</button>
      </div>
    );
  }

  // Muestra info relevante de session
  const amount = session.amount_total ?? (session.payment_intent?.amount ?? null);
  const currency = (session.currency || session.payment_intent?.currency || "").toUpperCase();
  const email = session.customer_email || session.customer_details?.email || session.payment_intent?.receipt_email;
  const status = session.payment_status || session.payment_intent?.status;

  return (
    <div className="min-h-screen p-10 bg-[#0a0a1a] text-white">
      <div className="max-w-3xl mx-auto bg-white/5 p-8 rounded-2xl">
        <h1 className="text-4xl font-black mb-4">¡Gracias por tu compra!</h1>

        <p className="text-gray-300 mb-6">Hemos recibido la información del pago. Aquí están los detalles:</p>

        <div className="space-y-3">
          <div><strong>Estado del pago:</strong> <span className={status === "paid" || status === "succeeded" ? "text-green-400" : "text-yellow-300"}>{status}</span></div>
          {amount !== null && (
            <div><strong>Monto:</strong> {(amount / 100).toFixed(2)} {currency}</div>
          )}
          {email && <div><strong>Correo:</strong> {email}</div>}
          <div><strong>Session id:</strong> {session.id}</div>
        </div>

        <div className="mt-8 flex gap-4">
          <button onClick={() => navigate("/")} className="bg-purple-600 px-4 py-2 rounded">Seguir comprando</button>
          <button onClick={() => navigate("/perfil")} className="bg-gray-700 px-4 py-2 rounded">Ver mi perfil / órdenes</button>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          Nota: la confirmación final del pedido se registra vía webhook en el servidor. Si necesitas soporte, contáctanos.
        </p>
      </div>
    </div>
  );
}

export default Success;