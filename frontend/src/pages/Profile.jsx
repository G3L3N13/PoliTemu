// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { productosService, usuariosService, carritoService } from "../services/api";
import DatosPersonalesForm from "../components/dashboard/DatosPersonalesForm.jsx";
import AdminProductos from "./AdminProductos.jsx";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("perfil");

  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [misProductos, setMisProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [cantidadCarrito, setCantidadCarrito] = useState(0);

  // --- FUNCIÓN PARA ELIMINAR ---
  const handleEliminar = async (e, id) => {
    e.stopPropagation(); // Evita que se dispare la navegación al hacer clic
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await productosService.eliminar(id);
        setMisProductos(misProductos.filter(p => (p._id || p.id) !== id));
        alert("Producto eliminado correctamente.");
      } catch (err) {
        console.error("Error al eliminar:", err);
        alert("No se pudo eliminar el producto.");
      }
    }
  };

  useEffect(() => {
    const cargarEstadoCarrito = async () => {
      if (!user) return;
      try {
        const datosCarrito = await carritoService.obtener();
        const totalItems = datosCarrito.productos?.reduce((acc, p) => acc + p.cantidad, 0) || 0;
        setCantidadCarrito(totalItems);
      } catch (err) {
        console.error("Error al obtener estado del carrito en perfil:", err);
      }
    };

    if (user) cargarEstadoCarrito();
  }, [user, activeTab]);

  useEffect(() => {
    const cargarMisProductos = async () => {
      if (!user) return;
      try {
        setCargandoProductos(true);
        const todosProductos = await productosService.getTodos();
        const productos = Array.isArray(todosProductos)
          ? todosProductos.filter(p => p.vendedorId === user.uid)
          : [];
        setMisProductos(productos);
      } catch (err) {
        console.error("Error al cargar productos:", err);
      } finally {
        setCargandoProductos(false);
      }
    };

    if (user) cargarMisProductos();
  }, [user, activeTab]);

  const obtenerPrimeraImagen = (imagenUrl) => {
    if (!imagenUrl) return "/placeholder.png";
    if (Array.isArray(imagenUrl)) return imagenUrl[0];
    const urls = imagenUrl.split(",").map(u => u.trim()).filter(Boolean);
    return urls[0] || "/placeholder.png";
  };


  const manejarIrAlChatGlobal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTimeout(() => {
      navigate("/chat", { replace: true });
    }, 5);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-10 flex gap-8">
      <aside className="w-64 flex flex-col gap-2">
        <h2 className="text-xl font-bold mb-4 px-4">Mi Cuenta</h2>

        <button
          onClick={() => setActiveTab("perfil")}
          className={`p-4 rounded-xl text-left transition ${activeTab === "perfil" ? "bg-purple-600" : "bg-white/5 hover:bg-white/10"}`}
        >
          👤 Perfil
        </button>

        <button
          onClick={manejarIrAlChatGlobal}
          className="p-4 rounded-xl text-left transition bg-white/5 hover:bg-white/10 hover:border-purple-500/50 border border-transparent cursor-pointer"
        >
          💬 Mis Mensajes
        </button>

        <button
          onClick={() => setActiveTab("productos")}
          className={`p-4 rounded-xl text-left transition ${activeTab === "productos" ? "bg-purple-600" : "bg-white/5 hover:bg-white/10"}`}
        >
          📦 Mis Productos
        </button>
        <button
          onClick={() => setActiveTab("favoritos")}
          className={`p-4 rounded-xl text-left transition ${activeTab === "favoritos" ? "bg-purple-600" : "bg-white/5 hover:bg-white/10"}`}
        >
          ❤️ Favoritos
        </button>
        <button
          onClick={() => setActiveTab("ventas")}
          className={`p-4 rounded-xl text-left transition ${activeTab === "ventas" ? "bg-purple-600" : "bg-white/5 hover:bg-white/10"}`}
        >
          💳 Mis Ventas
        </button>
        <button
          onClick={() => setActiveTab("vender")}
          className={`p-4 rounded-xl text-left font-bold transition ${activeTab === "vender" ? "bg-yellow-500 text-black" : "bg-white/5 hover:bg-white/10"}`}
        >
          ➕ Vender Producto
        </button>
      </aside>

      <main className="flex-1 max-w-4xl">
        {activeTab === "perfil" && (
          <div>
            {!profile ? (
              <div className="text-center py-10 text-gray-400">
                <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-yellow-400 rounded-full mx-auto mb-4"></div>
                <p>Cargando datos personales...</p>
              </div>
            ) : (
              <DatosPersonalesForm user={user} profile={profile} />
            )}

            <div className="mt-6 p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Resumen de Actividad</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-3xl font-black text-purple-400 mb-2">{cantidadCarrito}</p>
                  <p className="text-gray-400 text-sm">En el Carrito 🛒</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-yellow-400 mb-2">{misProductos.length}</p>
                  <p className="text-gray-400 text-sm">Publicados 📦</p>
                </div>
                <div onClick={manejarIrAlChatGlobal} className="cursor-pointer group hover:bg-white/5 p-1 rounded-xl transition duration-200">
                  <p className="text-3xl font-black text-cyan-400 mb-2 group-hover:scale-105 transition-transform">💬</p>
                  <p className="text-gray-400 text-sm group-hover:text-cyan-300 transition-colors">Bandeja de Entrada</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-green-400 mb-2">{profile?.totalVentas || 0}</p>
                  <p className="text-gray-400 text-sm">Ventas Totales 💳</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "productos" && (
          <div>
            <h2 className="text-3xl font-black text-white mb-8">
              Mis <span className="text-yellow-400">Productos</span>
            </h2>

            {cargandoProductos ? (
              <div className="text-center py-20 text-gray-400">
                <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-yellow-400 rounded-full mx-auto mb-4"></div>
                <p>Cargando tus productos...</p>
              </div>
            ) : misProductos.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-4">📦</p>
                <p className="text-lg mb-4">Aún no tienes productos publicados</p>
                <button
                  onClick={() => setActiveTab("vender")}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-2xl font-bold transition"
                >
                  Publicar tu primer producto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {misProductos.map((producto) => (
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
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-2">{producto.nombre}</h3>
                      <p className="text-yellow-400 font-black text-lg mb-4">${Number(producto.precio || 0).toFixed(2)}</p>
                      
                      {/* --- BOTONES CRUD CON PROPAGATION --- */}
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/editar-producto/${producto._id || producto.id}`)}
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-sm font-bold transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={(e) => handleEliminar(e, producto._id || producto.id)}
                          className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl text-sm font-bold transition"
                        >
                          Eliminar
                        </button>

                      </div>
                      {/* CRUD VENDEDOR */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editarProducto(producto);
                          }}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 rounded-lg"
                        >
                          Editar
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarProducto(producto._id || producto.id);
                          }}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-2 rounded-lg"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "favoritos" && (
          <div className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
            <p className="text-5xl mb-4">❤️</p>
            <p className="text-gray-400">Aquí irán tus productos favoritos (próximamente)</p>
          </div>
        )}

        {activeTab === "ventas" && (
          <div className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
            <p className="text-5xl mb-4">💳</p>
            <p className="text-gray-400">Aquí irán tus ventas (próximamente)</p>
          </div>
        )}

        {activeTab === "vender" && <AdminProductos />}
      </main>
    </div>
  );
}

export default Profile;