// src/components/ProductModal.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProductModal({ isOpen, onClose, producto }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) console.log("Modal abierto. producto:", producto);
  }, [isOpen, producto]);

  if (!isOpen || !producto) return null;

  const productId = producto.id || producto._id || producto.docId || null;
  const productUrl = productId ? `/product/${productId}` : null;
  const firstImage = producto.imagenUrl ? producto.imagenUrl.split(",")[0].trim() : "/placeholder.png";

  const handleNavigate = () => {
    if (!productUrl) {
      alert("ID del producto no disponible");
      return;
    }
    onClose();
    navigate(productUrl);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{ pointerEvents: "auto" }}
    >
      <div
        className="bg-[#1a1a2e] border border-white/10 p-6 rounded-3xl w-full max-w-lg shadow-2xl overflow-visible"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 10000, pointerEvents: "auto" }}
      >
        <div className="relative">
          <img
            src={firstImage}
            alt={producto.nombre}
            className="w-full h-64 object-cover rounded-2xl mb-4 cursor-pointer"
            onClick={handleNavigate}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") handleNavigate(); }}
            data-testid="product-image"
            style={{ pointerEvents: "auto" }}
          />
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute top-3 right-3 bg-black/40 text-white rounded-full w-9 h-9 flex items-center justify-center"
            style={{ zIndex: 10001 }}
          >
            ×
          </button>
        </div>

        <h2 className="text-2xl font-black text-white">{producto.nombre}</h2>
        <p className="text-cyan-400 font-bold text-xl my-2">${producto.precio}</p>
        <p className="text-gray-400 mb-4">{producto.categoria}</p>
        <p className="text-gray-300 mb-6">{producto.descripcion}</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <button
            type="button"
            onClick={handleNavigate}
            className="flex-1 bg-cyan-500 py-3 rounded-xl text-black font-bold text-center hover:bg-cyan-400 transition"
            data-testid="btn-ver-detalles"
            style={{ pointerEvents: "auto" }}
          >
            Ver más detalles
          </button>

          <a
            href={productUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-700 py-3 rounded-xl text-white font-bold flex items-center justify-center text-center hover:bg-gray-600 transition"
            onClick={(e) => { if (!productUrl) { e.preventDefault(); alert("ID no disponible"); } }}
            style={{ pointerEvents: "auto" }}
          >
            Abrir en nueva pestaña
          </a>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${productUrl || ""}` : productUrl || "";
              navigator.clipboard?.writeText(fullUrl).then(()=>console.log("Enlace copiado:", fullUrl)).catch(()=>{});
            }}
            className="flex-1 bg-gray-600 py-3 rounded-xl text-white font-medium hover:bg-gray-500 transition"
            style={{ pointerEvents: "auto" }}
          >
            Copiar enlace
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 py-3 rounded-xl text-white font-bold hover:bg-gray-600 transition"
            style={{ pointerEvents: "auto" }}
          >
            Cerrar
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          <div><strong className="text-white">Vendedor:</strong> {producto.vendedorNombre || "Vendedor anónimo"}</div>
          <div><strong className="text-white">Estado:</strong> {producto.estado || "activo"}</div>
        </div>
      </div>
    </div>
  );
}
