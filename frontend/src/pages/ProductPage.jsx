// src/pages/ProductPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Producto no encontrado");
          throw new Error("Error al cargar el producto");
        }
        const data = await res.json();
        if (mounted) setProduct(data);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchProduct();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="p-6">Cargando producto...</div>;
  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;
  if (!product) return <div className="p-6">Producto no disponible</div>;

  const firstImage = product.imagenUrl ? product.imagenUrl.split(",")[0].trim() : "/placeholder.png";

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Link to="/" className="text-sm text-cyan-400 underline mb-4 inline-block">← Volver</Link>

      <div className="bg-[#0f1724] p-6 rounded-xl shadow">
        <img src={firstImage} alt={product.nombre} className="w-full h-96 object-cover rounded-lg mb-6" />
        <h1 className="text-3xl font-bold text-white mb-2">{product.nombre}</h1>
        <p className="text-cyan-400 font-semibold text-2xl mb-4">${product.precio}</p>
        <p className="text-gray-300 mb-4">{product.descripcion || "Sin descripción"}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-sm text-gray-400">Categoría</h4>
            <p className="text-white">{product.categoria}</p>
          </div>
          <div>
            <h4 className="text-sm text-gray-400">Condición</h4>
            <p className="text-white">{product.condicion || "N/A"}</p>
          </div>
        </div>

        <section className="mb-4">
          <h3 className="text-lg font-semibold text-gray-200">Vendedor</h3>
          <p className="text-gray-300">{product.vendedorNombre || "Vendedor anónimo"}</p>
        </section>

        <div className="flex gap-3">
          <button className="bg-cyan-500 text-black px-4 py-2 rounded">Contactar</button>
          <button className="bg-gray-700 text-white px-4 py-2 rounded">Agregar a favoritos</button>
        </div>
      </div>
    </main>
  );
}
