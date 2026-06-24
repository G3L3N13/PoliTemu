import { useEffect, useState } from "react";
import { productosService, carritoService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function ProductosCatalogo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [indiceFoto, setIndiceFoto] = useState(0);


  useEffect(() => {
    const cargar = async () => {
      try {
        const token = await user.getIdToken(true);
        const data = await productosService.getTodos({
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(data)) {
          setProductos(data);
        } else {
          setProductos([]);
        }
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError("Error al cargar productos");
      } finally {
        setCargando(false);
      }
    };

    if (user) cargar();
  }, [user]);

  const obtenerImagenes = (producto) => {
    if (!producto?.imagenUrl) return [];
    if (Array.isArray(producto.imagenUrl)) return producto.imagenUrl;
    if (typeof producto.imagenUrl === "string") {
      return producto.imagenUrl.split(",").map((url) => url.trim()).filter(Boolean);
    }
    return [];
  };

  const categorias = ["Todos", ...new Set(productos.map((p) => p.categoria).filter(Boolean))];
  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda = p.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaActiva === "Todos" || p.categoria === categoriaActiva;
    return coincideBusqueda && coincideCategoria;
  });

  const handleOpenModal = (producto) => {
    setProductoSeleccionado(producto);
    setIndiceFoto(0);
  };

  const handleNavigateToProduct = () => {
    if (productoSeleccionado) {
      const productId = productoSeleccionado._id || productoSeleccionado.id;
      navigate(`/product/${productId}`);
      setProductoSeleccionado(null);
    }
  };

  const agregarAlCarritoModal = async () => {
    try {
      await carritoService.agregar({
        productoId: productoSeleccionado._id || productoSeleccionado.id,
        cantidad: 1,
      });

      alert("Producto agregado al carrito");
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      alert("No se pudo agregar el producto");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white px-6 py-10">
      <div className="fixed top-20 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="mb-12">
          <span className="inline-block bg-purple-600/20 border border-purple-500/30 text-purple-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            📚 Explorar Catálogo
          </span>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-4">
            Descubre <span className="text-yellow-400">Productos</span>
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Busca y filtra por categoría para encontrar exactamente lo que necesitas</p>
        </div>

        {/* BUSCADOR + FILTROS */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
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
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${categoriaActiva === cat
                    ? "bg-purple-600 text-white"
                    : "bg-white/5 border border-white/10 text-gray-400 hover:border-purple-500/40"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* STATS */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-white">
            Resultados: <span className="text-yellow-400">{productosFiltrados.length}</span>
          </h2>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-2xl mb-8">
            {error}
          </div>
        )}

        {/* SKELETON */}
        {cargando && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white/5 rounded-3xl overflow-hidden animate-pulse">
                <div className="h-48 bg-white/10" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/10 rounded-full w-3/4" />
                  <div className="h-6 bg-white/10 rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GRID PRODUCTOS */}
        {!cargando && !error && (
          <>
            {productosFiltrados.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-4">📦</p>
                <p className="text-lg">No se encontraron productos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {productosFiltrados.map((producto) => {
                  const imagenes = obtenerImagenes(producto);
                  const imagenPrincipal = imagenes[0] || "/placeholder.png";

                  return (
                    <div
                      key={producto._id || producto.id}
                      onClick={() => handleOpenModal(producto)}
                      className="group bg-white/5 border border-white/10 backdrop-blur-lg rounded-3xl overflow-hidden cursor-pointer hover:border-purple-500/40 hover:scale-[1.02] transition-all duration-300"
                    >
                      <div className="h-48 overflow-hidden relative bg-white/5">
                        <img
                          src={imagenPrincipal}
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
                        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">{producto.nombre}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-yellow-400 font-black text-lg">${Number(producto.precio || 0).toFixed(2)}</p>
                          {producto.stock > 0 && (
                            <span className="text-green-400 text-xs">✓ {producto.stock}</span>
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
      </div>

      {/* MODAL */}
      {productoSeleccionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="bg-[#0f0f2a] border border-white/10 rounded-3xl p-8 w-full max-w-2xl relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setProductoSeleccionado(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white text-2xl transition"
            >
              ✕
            </button>

            {/* Carrusel */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setIndiceFoto((p) => Math.max(0, p - 1))}
                className="bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition"
              >
                ◀
              </button>
              <img
                src={obtenerImagenes(productoSeleccionado)[indiceFoto] || "/placeholder.png"}
                alt=""
                className="w-64 h-64 object-cover rounded-3xl border border-white/10 bg-white/5"
              />
              <button
                onClick={() => setIndiceFoto((p) => Math.min(obtenerImagenes(productoSeleccionado).length - 1, p + 1))}
                className="bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition"
              >
                ▶
              </button>
            </div>

            {/* Info */}
            <div>
              {productoSeleccionado.categoria && (
                <span className="bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs px-3 py-1 rounded-full">
                  {productoSeleccionado.categoria}
                </span>
              )}
              <h2 className="text-3xl font-black text-white mt-3">{productoSeleccionado.nombre}</h2>
              <p className="text-yellow-400 text-3xl font-black mt-3">${Number(productoSeleccionado.precio || 0).toFixed(2)}</p>
              <p className="text-gray-400 mt-3 text-sm">
                {productoSeleccionado.stock > 0
                  ? `✓ ${productoSeleccionado.stock} unidades disponibles`
                  : "❌ Sin stock disponible"}
              </p>
              <p className="text-gray-300 mt-4">{productoSeleccionado.descripcion}</p>

              <div className="mt-8 space-y-3">
                <button
                  onClick={handleNavigateToProduct}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-3 rounded-xl font-bold transition"
                >
                  📄 Ver detalles completos
                </button>
                <button
                  onClick={agregarAlCarritoModal}
                  disabled={productoSeleccionado.stock === 0}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition"
                >
                  🛒 Agregar al Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductosCatalogo;
