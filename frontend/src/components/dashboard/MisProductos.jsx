import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productosService } from "../../services/api"; // <-- IMPORTANTE: 2 niveles arriba
import { useAuth } from "../../context/AuthContext"; // Asegúrate que la ruta sea correcta

export default function MisProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    cargarMisProductos();
  }, [user]);

  const cargarMisProductos = async () => {
    try {
      setLoading(true);
      // Aquí filtramos manualmente si tu API no tiene un endpoint específico de "mis productos"
      const data = await productosService.getTodos();
      if (user) {
        const misProductos = data.filter(p => p.vendedorId === user.uid || p.ownerId === user.uid);
        setProductos(misProductos);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const manejarEliminar = async (e, id) => {
    e.stopPropagation(); // EVITA QUE SE DISPARE NAVEGACIÓN
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await productosService.eliminar(id);
        setProductos(productos.filter(p => p.id !== id && p._id !== id));
      } catch (error) {
        alert("Error al eliminar");
      }
    }
  };

  if (loading) return <div className="text-white p-10">Cargando...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Administrar mis productos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
          <div 
            key={producto.id || producto._id} 
            className="bg-[#1a1a2e] p-4 rounded-xl border border-white/10"
          >
            <img src={producto.imagenUrl?.split(",")[0]} className="w-full h-40 object-cover rounded-lg mb-3" />
            <h3 className="text-white font-bold">{producto.nombre}</h3>
            
            {/* CONTENEDOR DE ACCIONES (Sin clics en el padre) */}
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => navigate(`/editar-producto/${producto.id || producto._id}`)}
                className="bg-blue-600 px-4 py-2 rounded-lg text-white font-bold w-full"
              >
                Editar
              </button>
              <button 
                onClick={(e) => manejarEliminar(e, producto.id || producto._id)}
                className="bg-red-600 px-4 py-2 rounded-lg text-white font-bold w-full"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}