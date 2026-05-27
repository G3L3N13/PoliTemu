export default function ProductModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-[#1a1a2e] border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl">
        <h2 className="text-2xl font-black text-white mb-6">Nueva Publicación</h2>
        {/* Aquí irían tus inputs de formulario: Título, Precio, Imagen, etc. */}
        <button 
          onClick={onClose} 
          className="w-full bg-gray-700 py-3 rounded-xl mt-4 text-white"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}