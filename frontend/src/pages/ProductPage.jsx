import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productosService } from "../services/api";
import { useAuth } from "../context/AuthContext";

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [indiceFoto, setIndiceFoto] = useState(0);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        setCargando(true);
        const data = await productosService.getTodos();
        const productoEncontrado = Array.isArray(data)
          ? data.find(p => (p._id || p.id) === id)
          : null;

        if (productoEncontrado) {
          setProducto(productoEncontrado);
          setError(null);
        } else {
          setError("Producto no encontrado");
          setProducto(null);
        }
      } catch (err) {
        console.error("Error al cargar producto:", err);
        setError("Error al cargar el producto. Intenta de nuevo.");
        setProducto(null);
      } finally {
        setCargando(false);
      }
    };

    if (id) cargarProducto();
  }, [id]);

  const obtenerImagenes = () => {
    if (!producto?.imagenUrl) return [];
    if (Array.isArray(producto.imagenUrl)) return producto.imagenUrl;
    if (typeof producto.imagenUrl === "string") {
      return producto.imagenUrl.split(",").map((url) => url.trim()).filter(Boolean);
    }
    return [];
  };

  const imagenes = producto ? obtenerImagenes() : [];
  const imagenActual = imagenes[indiceFoto] || "/placeholder.png";

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-purple-600 border-t-yellow-400 rounded-full mx-auto mb-4"></div>
          <p className="text-xl text-gray-400">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <p className="text-2xl font-bold mb-4">{error || "Producto no encontrado"}</p>
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

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 transition"
        >
          ← Atrás
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Galería de imágenes */}
          <div className="flex flex-col gap-4">
            <div className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden aspect-square">
              <img
                src={imagenActual}
                alt={producto.nombre}
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/placeholder.png")}
              />
              {producto.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-red-400 font-bold text-2xl">Sin Stock</span>
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {imagenes.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {imagenes.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setIndiceFoto(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition ${
                      idx === indiceFoto
                        ? "border-yellow-400"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="flex flex-col justify-between">
            <div>
              {producto.categoria && (
                <span className="bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs px-4 py-2 rounded-full inline-block mb-4">
                  {producto.categoria}
                </span>
              )}
              <h1 className="text-5xl font-black text-white mb-4">{producto.nombre}</h1>
              <p className="text-gray-400 text-lg mb-6">{producto.descripcion}</p>

              <div className="mb-8">
                <p className="text-yellow-400 text-5xl font-black mb-2">${Number(producto.precio || 0).toFixed(2)}</p>
                {producto.stock > 0 ? (
                  <p className="text-green-400 text-lg font-semibold">✓ {producto.stock} unidades disponibles</p>
                ) : (
                  <p className="text-red-400 text-lg font-semibold">❌ Sin stock disponible</p>
                )}
              </div>

              {/* Datos del vendedor */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                <p className="text-gray-400 text-sm mb-3">Vendedor</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-lg font-bold">{producto.vendedorNombre || "Vendedor anónimo"}</p>
                    <p className="text-gray-400 text-sm mt-1">⭐ {(producto.calificacionPromedio || 0).toFixed(1)} (Ver perfil)</p>
                  </div>
                  <button
                    onClick={() => navigate(`/seller/${producto.vendedorId}`)}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl font-semibold transition text-sm"
                  >
                    Ver más
                  </button>
                </div>
              </div>
            </div>

            {/* Controles de cantidad y botones */}
            <div className="space-y-4">
              {producto.stock > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">Cantidad:</span>
                  <div className="flex items-center border border-white/20 rounded-lg">
                    <button
                      onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                      className="px-4 py-2 text-white hover:bg-white/10 transition"
                    >
                      −
                    </button>
                    <span className="px-6 py-2 text-white font-bold">{cantidad}</span>
                    <button
                      onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                      className="px-4 py-2 text-white hover:bg-white/10 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button
                disabled={producto.stock === 0}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition shadow-lg shadow-purple-600/30"
              >
                🛒 Agregar al Carrito ({cantidad})
              </button>

              <button
                onClick={() => {
                  if (user && producto.vendedorId !== user.uid) {
                    navigate(`/chat/${producto.vendedorId}`);
                  } else if (!user) {
                    navigate("/login");
                  } else {
                    alert("No puedes chatear contigo mismo");
                  }
                }}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-4 rounded-2xl font-bold text-lg transition"
              >
                💬 Chat con Vendedor
              </button>

              <button
                onClick={() => {
                  const url = `${window.location.origin}/product/${id}`;
                  navigator.clipboard.writeText(url);
                  alert("Enlace copiado al portapapeles");
                }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-2xl font-semibold transition"
              >
                🔗 Copiar enlace
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
