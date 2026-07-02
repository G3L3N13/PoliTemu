// src/pages/SellerProfile.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { productosService } from "../services/api";
import { auth } from "../services/firebase";

function SellerProfile() {
  const { vendedorId } = useParams();
  const navigate = useNavigate();
  const [vendedor, setVendedor] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // reseñas
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comentario, setComentario] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const cargarDatos = async () => {
      setCargando(true);
      setError(null);

      try {
        // Determinar apiBase de forma segura
        const envApi = import.meta.env.VITE_API_URL;
        const apiBase = envApi ? envApi.replace(/\/$/, "") : "/api";

        // Cargar datos del vendedor (ruta pública)
        const { data } = await axios.get(`${apiBase}/usuarios/${vendedorId}`);
        if (!mounted) return;
        setVendedor(data);

        // Cargar productos del vendedor (usa tu servicio centralizado)
        const todosProductos = await productosService.getTodos();
        const productosVendedor = Array.isArray(todosProductos)
          ? todosProductos.filter(p => String(p.vendedorId) === String(vendedorId) && p.estado === "activo")
          : [];
        if (!mounted) return;
        setProductos(productosVendedor);

        // Cargar reseñas
        await fetchReviews(apiBase, mounted, data);
      } catch (err) {
        console.error("Error al cargar datos del vendedor:", err);
        if (!mounted) return;
        setError("Error al cargar el perfil del vendedor");
      } finally {
        if (!mounted) return;
        setCargando(false);
      }
    };

    if (vendedorId) cargarDatos();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendedorId]);

  // Helper: primera imagen
  const obtenerPrimeraImagen = (imagenUrl) => {
    if (!imagenUrl) return "/placeholder.png";
    if (Array.isArray(imagenUrl) && imagenUrl.length > 0) return imagenUrl[0];
    const urls = String(imagenUrl).split(",").map(u => u.trim()).filter(Boolean);
    return urls[0] || "/placeholder.png";
  };

  // Cargar reseñas (se separa para poder reusar)
  const fetchReviews = async (apiBaseParam, mounted = true, sellerData = null) => {
    setReviewsLoading(true);
    try {
      const envApi = import.meta.env.VITE_API_URL;
      const apiBase = apiBaseParam || (envApi ? envApi.replace(/\/$/, "") : "/api");
      const resp = await axios.get(`${apiBase}/usuarios/${vendedorId}/reseñas`);
      if (!mounted) return;
      const list = Array.isArray(resp.data) ? resp.data : [];
      setReviews(list);

      // comprobar si el usuario actual ya reseñó
      const currentUid = auth.currentUser?.uid;
      if (currentUid) {
        setUserHasReviewed(Boolean(list.find(r => r.authorUid === currentUid)));
      } else {
        setUserHasReviewed(false);
      }

      // si nos pasaron sellerData y no tiene calificacion, intentar mapear
      if (sellerData && !sellerData.calificacion && list.length > 0) {
        // calcular promedio local (solo UI)
        const avg = list.reduce((s, r) => s + (r.rating || 0), 0) / list.length;
        setVendedor(prev => ({ ...prev, calificacion: avg }));
      }
    } catch (err) {
      console.error("Error cargando reseñas:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Envío de reseña
  const handleSubmitReview = async () => {
    setReviewError(null);

    // Validaciones cliente
    if (!auth.currentUser) {
      setReviewError("Debes iniciar sesión para escribir una reseña.");
      return;
    }
    if (auth.currentUser.uid === String(vendedorId)) {
      setReviewError("No puedes reseñarte a ti mismo.");
      return;
    }
    if (userHasReviewed) {
      setReviewError("Ya has reseñado a este vendedor.");
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      setReviewError("Rating inválido.");
      return;
    }

    setSubmittingReview(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const envApi = import.meta.env.VITE_API_URL;
      const apiBase = envApi ? envApi.replace(/\/$/, "") : "/api";

      const resp = await axios.post(
        `${apiBase}/usuarios/${vendedorId}/reseñas`,
        { rating, comentario },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // añadir reseña a UI
      const created = resp.data;
      setReviews(prev => [created, ...prev]);
      setUserHasReviewed(true);
      setComentario("");
      setRating(5);

      // refrescar vendedor (para actualizar calificacion)
      try {
        const sellerResp = await axios.get(`${apiBase}/usuarios/${vendedorId}`);
        setVendedor(sellerResp.data);
      } catch (e) {
        console.warn("No se pudo refrescar vendedor tras reseña:", e);
      }
    } catch (err) {
      console.error("Error creando reseña:", err);
      const msg = err?.response?.data?.error || err.message || "Error al enviar reseña";
      setReviewError(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-purple-600 border-t-yellow-400 rounded-full mx-auto mb-4"></div>
          <p className="text-xl text-gray-400">Cargando perfil del vendedor...</p>
        </div>
      </div>
    );
  }

  if (error || !vendedor) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <p className="text-2xl font-bold mb-4">{error || "Vendedor no encontrado"}</p>
          <button
            onClick={() => navigate("/home")}
            className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-2xl font-semibold transition"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  // Mostrar calificación guardando compatibilidad con calificacionPromedio
  const calificacionMostrar = Number(vendedor.calificacion ?? vendedor.calificacionPromedio ?? 0).toFixed(1);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 transition"
        >
          ← Atrás
        </button>

        <div className="bg-gradient-to-br from-purple-600/20 to-blue-900/20 border border-white/10 rounded-3xl p-8 mb-12">
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-5xl font-bold text-white flex-shrink-0 overflow-hidden">
              {vendedor.fotoPerfil ? (
                <img src={vendedor.fotoPerfil} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                ((vendedor.fullName || vendedor.nombre || "V")[0] || "V").toUpperCase()
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-5xl font-black text-white mb-2">
                {vendedor.fullName || vendedor.nombre}
              </h1>
              <p className="text-gray-400 text-lg mb-4">{vendedor.descripcion || "Sin descripción"}</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-3xl font-black text-yellow-400">{productos.length}</p>
                  <p className="text-gray-400">Productos</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-green-400">{vendedor.totalVentas ?? 0}</p>
                  <p className="text-gray-400">Ventas</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-cyan-400">⭐ {calificacionMostrar}</p>
                  <p className="text-gray-400">Calificación</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => alert("Chat pronto disponible")}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-2xl font-bold transition"
                >
                  💬 Contactar
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-gray-400 mb-2">📍 <strong>{vendedor.ciudad || "No especificado"}</strong></p>
            <p className="text-gray-400 mb-2">📞 <strong>{vendedor.telefono || "No disponible"}</strong></p>
            <p className="text-gray-400">🏠 <strong>{vendedor.direccion || "No disponible"}</strong></p>
          </div>
        </div>

        {/* Productos */}
        <div>
          <h2 className="text-4xl font-black text-white mb-8">
            Productos de <span className="text-yellow-400">{vendedor.fullName || vendedor.nombre}</span>
          </h2>

          {productos.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">📦</p>
              <p className="text-lg">Este vendedor aún no tiene productos publicados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {productos.map((producto) => (
                <div
                  key={producto._id || producto.id}
                  onClick={() => navigate(`/product/${producto._id || producto.id}`)}
                  className="group bg-white/5 border border-white/10 backdrop-blur-lg rounded-3xl overflow-hidden cursor-pointer hover:border-purple-500/40 hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="h-48 overflow-hidden relative bg-white/5">
                    <img
                      src={obtenerPrimeraImagen(producto.imagenUrl)}
                      alt={producto.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      onError={(e) => (e.target.src = "/placeholder.png")}
                    />
                    {producto.categoria && (
                      <span className="absolute top-3 left-3 bg-purple-600/80 backdrop-blur text-white text-xs px-3 py-1 rounded-full">
                        {producto.categoria}
                      </span>
                    )}
                    {producto.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-red-400 font-bold text-sm">Sin stock</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-2">{producto.nombre}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-yellow-400 font-black text-lg">${Number(producto.precio || 0).toFixed(2)}</p>
                      {producto.stock > 0 && (
                        <span className="text-green-400 text-xs">✓ {producto.stock}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección de reseñas integradas */}
        <div className="max-w-4xl mx-auto bg-white/5 p-6 rounded-2xl">
          <h3 className="text-2xl font-semibold mb-4">Reseñas</h3>

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
              <button disabled={submittingReview || userHasReviewed} onClick={handleSubmitReview} className="bg-purple-600 px-4 py-2 rounded">
                {submittingReview ? "Enviando..." : userHasReviewed ? "Ya reseñaste" : "Enviar reseña"}
              </button>
            </div>
            {reviewError && <p className="text-red-400 mt-2">{reviewError}</p>}
          </div>

          <div className="space-y-4">
            {reviewsLoading ? (
              <p className="text-gray-300">Cargando reseñas...</p>
            ) : reviews.length === 0 ? (
              <p className="text-gray-400">Este vendedor no tiene reseñas aún.</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="p-4 bg-white/3 rounded">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-sm">{r.authorUid}</div>
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

export default SellerProfile;