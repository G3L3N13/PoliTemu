// frontend/src/pages/Vendedor.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth } from "../services/firebase";

export default function Vendedor() {
  const { uid } = useParams();
  const [vendedor, setVendedor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "/api";
        const sellerResp = await fetch(`${apiUrl}/usuarios/datos/${uid}`);
        if (!sellerResp.ok) throw new Error("No se pudo obtener datos del vendedor");
        setVendedor(await sellerResp.json());

        const revResp = await fetch(`${apiUrl}/usuarios/${uid}/reseñas`);
        const revData = await revResp.json();
        setReviews(revData || []);
      } catch (e) {
        console.error(e);
        setError("Error cargando datos del vendedor.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uid]);

  const handleSubmitReview = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (!auth.currentUser) {
        setError("Debes iniciar sesión para escribir una reseña.");
        setSubmitting(false);
        return;
      }
      const token = await auth.currentUser.getIdToken();
      const apiUrl = import.meta.env.VITE_API_URL || "/api";
      const resp = await fetch(`${apiUrl}/usuarios/${uid}/reseñas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comentario })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Error creando reseña");
      }
      const newReview = await resp.json();
      setReviews(prev => [newReview, ...prev]);
      setComentario("");
      setRating(5);
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al enviar reseña");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Cargando...</div>;
  if (error) return <div className="min-h-screen p-6 text-white">{error}</div>;

  return (
    <div className="min-h-screen p-8 bg-[#0a0a1a] text-white">
      <div className="max-w-4xl mx-auto bg-white/5 p-6 rounded-2xl">
        <div className="flex gap-6 items-center">
          <img src={vendedor.fotoPerfil || "/assets/default-avatar.png"} alt="perfil" className="w-24 h-24 rounded-full object-cover" />
          <div>
            <h2 className="text-2xl font-bold">{vendedor.nombre} {vendedor.apellido}</h2>
            <p className="text-gray-300">{vendedor.descripcion}</p>
            <p className="mt-1 text-yellow-400 font-bold">Calificación: {Number(vendedor.calificacion || 0).toFixed(2)}</p>
          </div>
        </div>

        <hr className="my-6 border-white/10" />

        <div>
          <h3 className="text-xl font-semibold mb-3">Reseñas</h3>

          <div className="mb-6">
            <label className="block mb-2">Tu calificación</label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="p-2 rounded bg-white/5">
              <option value={5}>5 - Excelente</option>
              <option value={4}>4 - Muy bueno</option>
              <option value={3}>3 - Bueno</option>
              <option value={2}>2 - Regular</option>
              <option value={1}>1 - Malo</option>
            </select>
            <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Escribe tu reseña..." className="w-full mt-2 p-3 bg-white/5 rounded" />
            <div className="mt-2 flex gap-2">
              <button disabled={submitting} onClick={handleSubmitReview} className="bg-purple-600 px-4 py-2 rounded">
                {submitting ? "Enviando..." : "Enviar reseña"}
              </button>
            </div>
            {error && <p className="text-red-400 mt-2">{error}</p>}
          </div>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-400">Este vendedor no tiene reseñas aún.</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="p-4 bg-white/3 rounded">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold">{r.authorUid}</div>
                    <div className="text-yellow-400 font-bold">{r.rating}/5</div>
                  </div>
                  <p className="text-gray-200 mt-2">{r.comentario}</p>
                  <div className="text-gray-400 text-sm mt-2">{new Date(r.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}