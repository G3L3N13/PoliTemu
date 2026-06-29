import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {ShoppingBag, ShoppingCart, Tag, User, Plus} from "lucide-react";
import { productosService } from "../services/api";
import { useAuth } from "../context/AuthContext";

function HomePrivado() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [indiceFotoActual, setIndiceFotoActual] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  
  const opciones = [
    { titulo: "Productos",      descripcion: "Explora el catálogo",     ruta: "/productos", icon: <ShoppingBag size={28} />, color: "from-purple-600/20 to-purple-800/10", border: "hover:border-purple-500/50" },
    { titulo: "Carrito",        descripcion: "Revisa tus compras",      ruta: "/carrito",   icon: <ShoppingCart size={28} />, color: "from-yellow-500/20 to-yellow-700/10", border: "hover:border-yellow-500/50" },
    { titulo: "Ofertas",        descripcion: "Promociones especiales",  ruta: "/ofertas",   icon: <Tag size={28} />, color: "from-green-600/20 to-green-800/10", border: "hover:border-green-500/50" },
    { titulo: "Mi Perfil",      descripcion: "Gestiona tu cuenta",      ruta: "/profile",   icon: <User size={28} />, color: "from-blue-600/20 to-blue-800/10", border: "hover:border-blue-500/50" },
    { titulo: "Vender",         descripcion: "Publica un artículo",     ruta: "/admin",     icon: <Plus size={28} />, color: "from-pink-600/20 to-pink-800/10", border: "hover:border-pink-500/50" },
  ];

  //FUNCIÓN  OBTENER IMÁGENES
  const obtenerListaImagenes = (producto) => {
    if (!producto?.imagenUrl) return [];
    
    // Si es array, devolvemos directamente
    if (Array.isArray(producto.imagenUrl)) {
      return producto.imagenUrl.filter(url => url && url.trim());
    }
    
    // Si es string, dividimos por coma y limpiamos espacios
    if (typeof producto.imagenUrl === "string" && producto.imagenUrl.trim()) {
      return producto.imagenUrl
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);
    }
    
    return [];
  };

  const categorias = ["Todos", ...new Set(productos.map((p) => p.categoria).filter(Boolean))];
  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda = p.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaActiva === "Todos" || p.categoria === categoriaActiva;
    return coincideBusqueda && coincideCategoria;
  });

  
  const SVG_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3ESin imagen%3C/text%3E%3C/svg%3E";

  useEffect(() => {
    const cargar = async () => {
      if (!user) { 
        setCargando(false); 
        return; 
      }
      try {
        const token = await user.getIdToken(true);
        const data = await productosService.getTodos({
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Validar que sea array
        if (Array.isArray(data)) {
          setProductos(data);
          console.log("✅ Productos cargados:", data);
        } else {
          console.error("❌ Respuesta no es array:", data);
          setProductos([]);
          setError("Error: Formato de respuesta inválido");
        }
      } catch (err) {
        console.error("❌ Error al cargar productos:", err);
        setError("Error al cargar productos.");
        setProductos([]);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [user]);

  return (
    <div className="bg-[#0a0a1a] text-white min-h-screen">

      <div className="max-w-[1900px] mx-auto px-8 lg:px-12 py-10">

        {/* Glows decorativos */}
        <div className="fixed top-20 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-10 right-10 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* ── HEADER ── */}
        <div className="mb-12 relative z-10">
          <span className="inline-block bg-purple-600/20 border border-purple-500/30 text-purple-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            🎓 Marketplace Académico — EPN
          </span>
          <h1 className="text-5xl md:text-6xl font-black leading-tight">
            Bienvenido,{" "}
            <span className="text-yellow-400">
              {user?.displayName?.split(" ")[0] || "Estudiante"}
            </span>{" "}
            👋
          </h1>
          <p className="text-gray-400 mt-4 text-lg max-w-2xl">
            Compra y vende artículos universitarios dentro de tu comunidad estudiantil.
          </p>
        </div>

        {/* ── ACCIONES RÁPIDAS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-16 relative z-10">
          {opciones.map((op) => (
            <div
              key={op.titulo}
              onClick={() => navigate(op.ruta)}
              className={`bg-gradient-to-br ${op.color} border border-white/10 ${op.border} backdrop-blur-lg rounded-3xl p-6 cursor-pointer hover:scale-105 transition-all duration-300`}
            >
              <div className="text-white mb-4">{op.icon}</div>
              <h3 className="text-lg font-bold text-white">{op.titulo}</h3>
              <p className="text-gray-400 text-sm mt-1">{op.descripcion}</p>
            </div>
          ))}
        </div>

        {/* ── BUSCADOR + FILTROS ── */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 relative z-10">
          {/* Buscador */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-3 gap-3 flex-1">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 text-sm"
            />
          </div>

          {/* Filtros de categoría */}
          <div className="flex gap-2 flex-wrap">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  categoriaActiva === cat
                    ? "bg-purple-600 text-white"
                    : "bg-white/5 border border-white/10 text-gray-400 hover:border-purple-500/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── TITULO CATÁLOGO ── */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h2 className="text-3xl font-black text-white">
            Catálogo de <span className="text-yellow-400">Productos</span>
          </h2>
          <span className="text-gray-400 text-sm">
            {productosFiltrados.length} productos
          </span>
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-2xl mb-8">
            {error}
          </div>
        )}

        {/* ── SKELETON ── */}
        {cargando && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/5 rounded-3xl overflow-hidden animate-pulse">
                <div className="h-64 bg-white/10" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/10 rounded-full w-3/4" />
                  <div className="h-6 bg-white/10 rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── GRID PRODUCTOS ── */}
        {!cargando && !error && (
          <>
            {productosFiltrados.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-4">📦</p>
                <p className="text-lg">No se encontraron productos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {productosFiltrados.map((producto) => {
                  const imagenes = obtenerListaImagenes(producto);
                  const imagenPrincipal = imagenes[0] || SVG_PLACEHOLDER;
                  
                  return (
                    <div
                      key={producto._id || producto.id}
                      onClick={() => { setIndiceFotoActual(0); setProductoSeleccionado(producto); }}
                      className="group bg-white/5 border border-white/10 backdrop-blur-lg rounded-3xl overflow-hidden cursor-pointer hover:border-purple-500/40 hover:scale-[1.02] transition-all duration-300"
                    >
                      <div className="h-64 overflow-hidden relative bg-white/5">
                        <img
                          src={imagenPrincipal}
                          alt={producto.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                          onError={(e) => { 
                            e.target.src = SVG_PLACEHOLDER;
                            console.warn(`⚠️ Error cargando imagen de ${producto.nombre}`);
                          }}
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
                      <div className="p-5">
                        <h3 className="text-white font-semibold text-lg leading-tight">{producto.nombre}</h3>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-yellow-400 font-black text-2xl">
                            ${Number(producto.precio || 0).toFixed(2)}
                          </p>
                          {producto.stock > 0 && (
                            <span className="text-green-400 text-xs">✓ {producto.stock} disponibles</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── MODAL ── */}
        {productoSeleccionado && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-6">
            <div className="bg-[#0f0f2a] border border-white/10 rounded-3xl p-8 w-full max-w-2xl relative shadow-2xl">

              {/* Cerrar */}
              <button
                onClick={() => setProductoSeleccionado(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white text-2xl transition"
              >
                ✕
              </button>

              {/* Carrusel */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setIndiceFotoActual((p) => Math.max(0, p - 1))}
                  className="bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition"
                >
                  ◀
                </button>
                <img
                  src={obtenerListaImagenes(productoSeleccionado)[indiceFotoActual] || SVG_PLACEHOLDER}
                  alt=""
                  className="w-72 h-72 object-cover rounded-3xl border border-white/10 bg-white/5"
                  onError={(e) => { e.target.src = SVG_PLACEHOLDER; }}
                />
                <button
                  onClick={() => setIndiceFotoActual((p) => Math.min(obtenerListaImagenes(productoSeleccionado).length - 1, p + 1))}
                  className="bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition"
                >
                  ▶
                </button>
              </div>

              {/* Indicadores de fotos */}
              {obtenerListaImagenes(productoSeleccionado).length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {obtenerListaImagenes(productoSeleccionado).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndiceFotoActual(i)}
                      className={`w-2 h-2 rounded-full transition ${i === indiceFotoActual ? "bg-yellow-400" : "bg-white/20"}`}
                    />
                  ))}
                </div>
              )}

              {/* Info */}
              <div className="mt-8">
                {productoSeleccionado.categoria && (
                  <span className="bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs px-3 py-1 rounded-full">
                    {productoSeleccionado.categoria}
                  </span>
                )}
                <h2 className="text-3xl font-black text-white mt-3">
                  {productoSeleccionado.nombre}
                </h2>
                <p className="text-yellow-400 text-3xl font-black mt-3">
                  ${Number(productoSeleccionado.precio || 0).toFixed(2)}
                </p>
                <p className="text-gray-400 mt-3 text-sm">
                  {productoSeleccionado.stock > 0
                    ? `✓ ${productoSeleccionado.stock} unidades disponibles`
                    : "❌ Sin stock disponible"}
                </p>
                <p className="text-gray-400 mt-2 text-sm">
                  Producto disponible dentro de la comunidad estudiantil de la EPN.
                </p>
                <button
                  disabled={productoSeleccionado.stock === 0}
                  className="w-full mt-8 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition shadow-lg shadow-purple-600/20"
                >
                  🛒 Agregar al Carrito
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default HomePrivado;

