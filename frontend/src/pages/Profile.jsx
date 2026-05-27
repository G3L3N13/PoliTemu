// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { productosService } from "../services/api";
import DatosPersonalesForm from "../components/dashboard/DatosPersonalesForm.jsx";
import AdminProducts from "./AdminProductos.jsx";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("perfil");
  const [profile, setProfile] = useState(null);
  const [misProductos, setMisProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const ref = doc(db, "usuarios", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() });
      } else {
        setProfile({ id: user.uid, nombre: user.displayName || "", email: user.email || "" });
      }
    }, (err) => {
      console.error("Error escuchando perfil:", err);
    });

    return () => unsub();
  }, [user]);

  // Cargar productos del usuario
  useEffect(() => {
    const cargarMisProductos = async () => {
      if (!user) return;
      
      try {
        setCargandoProductos(true);
        const token = await user.getIdToken(true);
        const todosProductos = await productosService.getTodos({
          headers: { Authorization: `Bearer ${token}` }
        });
        
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

    if (activeTab === "productos") {
      cargarMisProductos();
    }
  }, [user, activeTab]);

  const obtenerPrimeraImagen = (imagenUrl) => {
    if (!imagenUrl) return "/placeholder.png";
    if (Array.isArray(imagenUrl)) return imagenUrl[0];
    const urls = imagenUrl.split(",").map(u => u.trim()).filter(Boolean);
    return urls[0] || "/placeholder.png";
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-10 flex gap-8">
      <aside className="w-64 flex flex-col gap-2">
        <h2 className="text-xl font-bold mb-4 px-4">Mi Cuenta</h2>

        <button
          onClick={() => setActiveTab("perfil")}
          className={`p-4 rounded-xl text-left transition ${
            activeTab === "perfil" ? "bg-purple-600" : "bg-white/5 hover:bg-white/10"
          }`}
        >
          👤 Perfil
        </button>
        <button
          onClick={() => setActiveTab("productos")}
          className={`p-4 rounded-xl text-left transition ${
            activeTab === "productos" ? "bg-purple-600" : "bg-white/5 hover:bg-white/10"
          }`}
        >
          📦 Mis Productos
        </button>
        <button
          onClick={() => setActiveTab("favoritos")}
          className={`p-4 rounded-xl text-left transition ${
            activeTab === "favoritos" ? "bg-purple-600" : "bg-white/5 hover:bg-white/10"
          }`}
        >
          ❤️ Favoritos
        </button>
        <button
          onClick={() => setActiveTab("ventas")}
          className={`p-4 rounded-xl text-left transition ${
            activeTab === "ventas" ? "bg-purple-600" : "bg-white/5 hover:bg-white/10"
          }`}
        >
          💳 Mis Ventas
        </button>
        <button
          onClick={() => setActiveTab("vender")}
          className={`p-4 rounded-xl text-left font-bold transition ${
            activeTab === "vender" ? "bg-yellow-500 text-black" : "bg-white/5 hover:bg-white/10"
          }`}
        >
          ➕ Vender Producto
        </button>
      </aside>

      <main className="flex-1 max-w-4xl">
        {/* PERFIL */}
        {activeTab === "perfil" && (
          <div>
            <DatosPersonalesForm user={user} profile={profile} />
            <div className="mt-6 p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Resumen de Vendedor</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-3xl font-black text-yellow-400 mb-2">{misProductos.length}</p>
                  <p className="text-gray-400">Productos Publicados</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-green-400 mb-2">{profile?.totalVentas || 0}</p>
                  <p className="text-gray-400">Ventas Totales</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-cyan-400 mb-2">⭐ {(profile?.calificacionPromedio || 0).toFixed(1)}</p>
                  <p className="text-gray-400">Calificación</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MIS PRODUCTOS */}
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
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          producto.stock > 0
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {producto.stock > 0 ? `${producto.stock} disponibles` : "Sin stock"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAVORITOS */}
        {activeTab === "favoritos" && (
          <div className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
            <p className="text-5xl mb-4">❤️</p>
            <p className="text-gray-400">Aquí irán tus productos favoritos (próximamente)</p>
          </div>
        )}

        {/* MIS VENTAS */}
        {activeTab === "ventas" && (
          <div className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
            <p className="text-5xl mb-4">💳</p>
            <p className="text-gray-400">Aquí irán tus ventas (próximamente)</p>
          </div>
        )}

        {/* VENDER PRODUCTO */}
        {activeTab === "vender" && <AdminProducts />}
      </main>
    </div>
  );
}

export default Profile;
