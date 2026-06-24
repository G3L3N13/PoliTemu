import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ShoppingCart, Tag, User, Plus } from "lucide-react";
import { productosService } from "../services/api"; // Asegúrate de que esta ruta sea correcta
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
  const [agregandoAlCarrito, setAgregandoAlCarrito] = useState(false);

  // --- LÓGICA DE PROPIEDAD ---
  const isOwner = user && productoSeleccionado && (productoSeleccionado.vendedorId === user.uid);

  useEffect(() => {
    cargarProductos();
  }, [user]);

  const cargarProductos = async () => {
    try {
      const data = await productosService.getTodos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error al cargar productos.");
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async () => {
    if (window.confirm("¿Seguro que quieres eliminar este producto?")) {
      await productosService.eliminar(productoSeleccionado.id || productoSeleccionado._id);
      setProductoSeleccionado(null);
      cargarProductos();
    }
  };

  // ... (tus funciones previas como obtenerListaImagenes y handleAgregarAlCarrito se mantienen igual)
  const obtenerListaImagenes = (producto) => {
    if (!producto?.imagenUrl) return [];
    if (Array.isArray(producto.imagenUrl)) return producto.imagenUrl.filter(Boolean);
    return typeof producto.imagenUrl === "string" ? producto.imagenUrl.split(",").map(u => u.trim()).filter(Boolean) : [];
  };

  const SVG_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3ESin imagen%3C/text%3E%3C/svg%3E";

  // --- RENDERIZADO DEL MODAL (AQUÍ ESTÁ LA MAGIA) ---
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white px-6 py-10">
      {/* ... (Todo tu código de Header, Opciones, Buscador y Grid se queda igual) ... */}
      
      {/* ── MODAL ACTUALIZADO ── */}
      {productoSeleccionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] px-6" onClick={() => setProductoSeleccionado(null)}>
          <div className="bg-[#0f0f2a] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            
            <button onClick={() => setProductoSeleccionado(null)} className="absolute top-5 right-5 text-gray-400 hover:text-white">✕</button>

            {/* Imagen Carrusel */}
            <img 
              src={obtenerListaImagenes(productoSeleccionado)[indiceFotoActual] || SVG_PLACEHOLDER} 
              className="w-full h-64 object-cover rounded-2xl mb-4" 
            />

            <h2 className="text-2xl font-black">{productoSeleccionado.nombre}</h2>
            <p className="text-cyan-400 font-bold text-xl">${productoSeleccionado.precio}</p>

            {/* --- ACCIONES --- */}
            <div className="space-y-3 mt-6">
              
              {/* Si es dueño: Botones de Edición */}
              {isOwner ? (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => navigate(`/editar-producto/${productoSeleccionado.id || productoSeleccionado._id}`)} className="bg-blue-600 py-3 rounded-xl font-bold">Editar</button>
                  <button onClick={handleEliminar} className="bg-red-600 py-3 rounded-xl font-bold">Eliminar</button>
                </div>
              ) : (
                /* Si no es dueño: Botón de carrito */
                <button 
                  onClick={() => {/* Lógica agregar carrito */}} 
                  className="w-full bg-purple-600 py-3 rounded-xl font-bold"
                >
                  🛒 Agregar al Carrito
                </button>
              )}

              {/* Botones de navegación siempre visibles */}
              <div className="flex gap-2">
                 <button onClick={() => navigate(`/product/${productoSeleccionado.id}`)} className="flex-1 bg-white/10 py-3 rounded-xl">Ver Detalles</button>
                 <a href={`/product/${productoSeleccionado.id}`} target="_blank" className="flex-1 bg-white/5 py-3 rounded-xl text-center">Nueva pestaña</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePrivado;