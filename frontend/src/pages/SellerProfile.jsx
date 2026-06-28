// src/pages/SellerProfile.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { productosService } from "../services/api";

function SellerProfile() {
  const { vendedorId } = useParams();
  const navigate = useNavigate();
  const [vendedor, setVendedor] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const cargarDatos = async () => {
      setCargando(true);
      setError(null);

      try {
        // Cargar datos del vendedor desde backend público
       // Cambia esto en SellerProfile.jsx
// Si VITE_API_URL termina en /api, esto lo limpia
        const baseURL = import.meta.env.VITE_API_URL.replace(/\/api$/, ""); 
        const { data } = await axios.get(`${baseURL}/api/usuarios/${vendedorId}`);
        if (!mounted) return;
        setVendedor(data);

        // Cargar productos del vendedor (usa tu servicio centralizado)
        const todosProductos = await productosService.getTodos();
        const productosVendedor = Array.isArray(todosProductos)
          ? todosProductos.filter(p => String(p.vendedorId) === String(vendedorId) && p.estado === "activo")
          : [];
        if (!mounted) return;
        setProductos(productosVendedor);
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
  }, [vendedorId]);

  const obtenerPrimeraImagen = (imagenUrl) => {
    if (!imagenUrl) return "/placeholder.png";
    if (Array.isArray(imagenUrl) && imagenUrl.length > 0) return imagenUrl[0];
    const urls = String(imagenUrl).split(",").map(u => u.trim()).filter(Boolean);
    return urls[0] || "/placeholder.png";
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
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-5xl font-bold text-white flex-shrink-0">
              {((vendedor.fullName || vendedor.nombre || "V")[0] || "V").toUpperCase()}
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
                  <p className="text-3xl font-black text-cyan-400">⭐ {Number(vendedor.calificacionPromedio ?? 0).toFixed(1)}</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>
    </div>
  );
}

export default SellerProfile;