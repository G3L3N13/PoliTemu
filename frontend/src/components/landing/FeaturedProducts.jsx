// src/components/landing/FeaturedProducts.jsx
import { useEffect, useState } from "react";
import { productosService } from "../../services/api";

const valoraciones = [
  { nombre: "Sarah M.", texto: "Encontré todos mis libros de cálculo a mitad de precio. ¡Increíble plataforma!", estrellas: 5, avatar: "S" },
  { nombre: "Alex K.", texto: "Vendí mi calculadora en menos de un día. El proceso fue muy sencillo y seguro.", estrellas: 5, avatar: "A" },
  { nombre: "James R.", texto: "La comunidad universitaria es muy activa. Siempre hay productos nuevos disponibles.", estrellas: 4, avatar: "J" },
];

function Estrellas({ cantidad }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= cantidad ? "text-yellow-400" : "text-gray-600"}>★</span>
      ))}
    </div>
  );
}

function FeaturedProducts({ onOpenModal }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const obtenerPrimeraImagen = (imagenUrl) => {
    if (!imagenUrl) return "https://via.placeholder.com/400x300?text=Sin+imagen";
    if (Array.isArray(imagenUrl)) return imagenUrl[0];
    const urls = imagenUrl.split(",").map((u) => u.trim()).filter(Boolean);
    return urls[0] || "https://via.placeholder.com/400x300?text=Sin+imagen";
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await productosService.getTodos();
        const items = Array.isArray(data)
          ? data.slice(0, 4).map(p => ({ id: p._id || p.id, ...p }))
          : [];
        setProductos(items);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError("No se pudieron cargar los productos.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  return (
    <>
      <section id="productos" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white">
              PRODUCTOS <span className="text-yellow-400">DESTACADOS</span>
            </h2>
            <p className="text-gray-400 mt-4">Los artículos más recientes de la comunidad</p>
          </div>

          {cargando && (
            <div className="grid md:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white/5 rounded-3xl overflow-hidden animate-pulse">
                  <div className="h-56 bg-white/10" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-white/10 rounded-full w-3/4" />
                    <div className="h-4 bg-white/10 rounded-full w-1/3" />
                    <div className="h-10 bg-white/10 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-center text-red-400">{error}</p>}

          {!cargando && !error && productos.length === 0 && (
            <p className="text-center text-gray-400">Aún no hay productos registrados.</p>
          )}

          {!cargando && !error && productos.length > 0 && (
            <div className="grid md:grid-cols-4 gap-6">
              {productos.map((producto) => (
                <div
                  key={producto.id}
                  className="group bg-white/5 border border-white/10 backdrop-blur-lg rounded-3xl overflow-hidden hover:border-purple-500/40 hover:scale-[1.02] transition-all duration-300 shadow-lg"
                >
                  <div className="relative overflow-hidden h-56">
                    <img
                      src={obtenerPrimeraImagen(producto.imagenUrl)}
                      alt={producto.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=Sin+imagen"; }}
                      onClick={() => onOpenModal && onOpenModal(producto)}
                      data-testid={`card-image-${producto.id}`}
                    />
                    {producto.categoria && (
                      <span className="absolute top-3 left-3 bg-purple-600/80 backdrop-blur text-white text-xs px-3 py-1 rounded-full">
                        {producto.categoria}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-white font-semibold text-lg leading-tight">{producto.nombre}</h3>

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-yellow-400 font-black text-xl">${Number(producto.precio || 0).toFixed(2)}</p>
                      {producto.stock > 0 ? (
                        <span className="text-green-400 text-xs">✓ Disponible</span>
                      ) : (
                        <span className="text-red-400 text-xs">Sin stock</span>
                      )}
                    </div>

                    <button
                      className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-2xl text-sm font-semibold transition cursor-pointer"
                      onClick={() => onOpenModal && onOpenModal(producto)}
                      data-testid={`card-btn-${producto.id}`}
                    >
                      Ver Producto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!cargando && productos.length > 0 && (
            <div className="text-center mt-12">
              <button className="border border-white/20 text-gray-300 hover:bg-white/10 px-8 py-3 rounded-2xl transition text-sm font-semibold">
                Ver más productos
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          {[
            { icon: "🛍️", titulo: "Compra y vende", desc: "Publica tus artículos en segundos" },
            { icon: "💬", titulo: "Comunicación Directa", desc: "Conecta con vendedores fácilmente" },
            { icon: "🎓", titulo: "Comunidad Universitaria", desc: "Solo para estudiantes de la EPN" },
            { icon: "🔐", titulo: "Autenticación", desc: "Acceso seguro con cuenta institucional" },
          ].map((f) => (
            <div key={f.titulo} className="p-6">
              <span className="text-4xl">{f.icon}</span>
              <h3 className="text-white font-bold text-lg mt-4">{f.titulo}</h3>
              <p className="text-gray-400 text-sm mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white">VALORACIONES</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {valoraciones.map((v) => (
              <div key={v.nombre} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-purple-500/30 transition">
                <Estrellas cantidad={v.estrellas} />
                <p className="text-gray-300 mt-4 leading-relaxed text-sm">"{v.texto}"</p>
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">{v.avatar}</div>
                  <div>
                    <p className="text-white font-semibold text-sm">{v.nombre}</p>
                    <p className="text-green-400 text-xs">✓ Compra verificada</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default FeaturedProducts;
