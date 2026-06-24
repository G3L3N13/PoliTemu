import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productosService } from "../services/api";

export default function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Asegúrate de que este servicio traiga los productos que le pertenecen al usuario
        const misProductos = await productosService.getMisProductos();
        // Buscamos comparando tanto id como _id por seguridad
        const p = misProductos.find(item => (item.id || item._id) === id);
        
        if (p) setProducto(p);
        else alert("Producto no encontrado");
      } catch (err) {
        console.error("Error al cargar:", err);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await productosService.actualizar(id, producto);
      alert("Producto actualizado con éxito");
      
      // REDIRECCIÓN CORRECTA:
      // Navegamos al perfil y le enviamos un "estado" para que abra la pestaña "productos"
      navigate("/profile", { state: { tab: "productos" } });
      
    } catch (err) {
      console.error(err);
      alert("Error al actualizar");
    }
  };

  if (cargando) return <div className="text-white text-center p-10">Cargando...</div>;
  if (!producto) return <div className="text-white text-center p-10">No se pudo cargar el producto.</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-[#1a1a2e] rounded-3xl mt-10 text-white">
      <h1 className="text-2xl font-black mb-6">Editar Producto</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 text-gray-400">Nombre</label>
          <input 
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
            value={producto.nombre || ""}
            onChange={(e) => setProducto({...producto, nombre: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-400">Precio</label>
          <input 
            type="number"
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
            value={producto.precio || ""}
            onChange={(e) => setProducto({...producto, precio: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-400">Stock</label>
          <input 
            type="number"
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
            value={producto.stock || ""}
            onChange={(e) => setProducto({...producto, stock: e.target.value})}
          />
        </div>
        
        <div className="flex gap-3 mt-6">
          <button 
            type="button" 
            onClick={() => navigate("/profile", { state: { tab: "productos" } })}
            className="flex-1 bg-white/10 py-3 rounded-xl font-bold hover:bg-white/20"
          >
            Cancelar
          </button>
          <button type="submit" className="flex-1 bg-purple-600 py-3 rounded-xl font-bold hover:bg-purple-500">
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}