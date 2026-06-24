import React from "react";
import { useNavigate } from "react-router-dom";
import { productosService } from "../../services/api";

export default function ProductModal({ 
  isOpen, 
  onClose, 
  producto, 
  onAgregarAlCarrito, 
  currentUser, 
  onUpdateList,
  cargando = false 
}) {
  const navigate = useNavigate();

  if (!isOpen || !producto) return null;

  const isOwner = currentUser && (producto.vendedorId === currentUser.uid);
  const productId = producto.id || producto._id || null;
  const productUrl = productId ? `/product/${productId}` : null;

  const firstImage = producto.imagenUrl 
    ? (Array.isArray(producto.imagenUrl) ? producto.imagenUrl[0] : producto.imagenUrl.split(",")[0].trim()) 
    : "/placeholder.png";

  // Funciones de acción
  const handleEditar = () => {
    onClose();
    navigate(`/editar-producto/${productId}`);
  };

  const handleEliminar = async () => {
    if (window.confirm("¿Seguro que quieres borrar este producto?")) {
      await productosService.eliminar(productId);
      if (onUpdateList) onUpdateList();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-6" onClick={onClose}>
      <div className="bg-[#1a1a2e] border border-white/10 p-6 rounded-3xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        
        {/* Imagen sin evento de clic para evitar redirecciones accidentales */}
        <div className="relative">
          <img src={firstImage} alt={producto.nombre} className="w-full h-64 object-cover rounded-2xl mb-4" />
          <button onClick={onClose} className="absolute top-3 right-3 bg-black/40 text-white rounded-full w-9 h-9 flex items-center justify-center">×</button>
        </div>

        <h2 className="text-2xl font-black text-white">{producto.nombre}</h2>
        <div className="flex justify-between items-center my-2">
          <p className="text-cyan-400 font-bold text-xl">${producto.precio}</p>
          <span className={`text-xs px-2.5 py-1 rounded-full ${producto.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {producto.stock > 0 ? `✓ ${producto.stock} disponibles` : 'Sin stock'}
          </span>
        </div>
        <p className="text-gray-400 mb-4">{producto.categoria}</p>
        <p className="text-gray-300 mb-6">{producto.descripcion}</p>

        {/* --- BOTONES HÍBRIDOS --- */}
        <div className="space-y-3">
          
          {/* SI ERES EL DUEÑO, MUESTRA EL CRUD */}
          {isOwner && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button onClick={handleEditar} className="bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl font-bold">Editar</button>
              <button onClick={handleEliminar} className="bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl font-bold">Eliminar</button>
            </div>
          )}

          {/* SIEMPRE MUESTRA OPCIONES DE COMPRA/NAVEGACIÓN */}
          {onAgregarAlCarrito && (
            <button
              disabled={producto.stock === 0 || cargando}
              onClick={() => onAgregarAlCarrito(producto)}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white py-3 rounded-xl font-bold transition"
            >
              🛒 Agregar al Carrito
            </button>
          )}

          <div className="flex gap-3">
             <button onClick={() => { onClose(); navigate(productUrl); }} className="flex-1 bg-cyan-500 py-3 rounded-xl text-black font-bold hover:bg-cyan-400">Ver Detalles</button>
             <a href={productUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-700 py-3 rounded-xl text-white font-bold text-center hover:bg-gray-600">Nueva pestaña</a>
          </div>
        </div>
      </div>
    </div>
  );
}