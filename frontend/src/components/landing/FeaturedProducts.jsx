// src/components/landing/FeaturedProducts.jsx
import { useEffect, useState } from "react";
import { productosService } from "../../services/api";


const valoraciones = [
  { nombre: "Sarah M.", texto: "Encontré todos mis libros de cálculo a mitad de precio. ¡Increíble plataforma!", estrellas: 5, avatar: "S" },
  { nombre: "Alex K.", texto: "Vendí mi calculadora en menos de un día. El proceso fue muy sencillo y seguro.", estrellas: 5, avatar: "A" },
  { nombre: "James R.", texto: "La comunidad universitaria es muy activa. Siempre hay productos nuevos disponibles.", estrellas: 4, avatar: "J" },
];

const funcionalidades = [
  {
    titulo: "Compra y vende fácilmente",
    descripcion:
      "Publica productos académicos en pocos segundos y encuentra compradores dentro de la comunidad universitaria.",
    puntos: [
      "Publicaciones rápidas",
      "Carga de imágenes",
      "Categorías organizadas"
    ],
    icono: "🛍️",
    imagen: "./src/assets/publicaciones.jpg"
  },

  {
    titulo: "Comunicación en tiempo real",
    descripcion:
      "Contacta directamente con vendedores mediante el chat integrado.",
    puntos: [
      "Chat privado",
      "Negociación inmediata",
      "Mensajes seguros"
    ],
    icono: "💬",
    imagen: "./src/assets/chat.jpg"
  },

  {
    titulo: "Comunidad Universitaria",
    descripcion:
      "Solo estudiantes de la Escuela Politécnica Nacional pueden acceder a la plataforma.",
    puntos: [
      "Usuarios verificados",
      "Mayor confianza",
      "Ambiente seguro"
    ],
    icono: "🎓",
    imagen: "./src/assets/comunidad.jpeg"
  },

  {
    titulo: "Acceso Seguro",
    descripcion:
      "Protegemos la información mediante autenticación institucional.",
    puntos: [
      "Autenticación con correo institucional",
      "Protección de datos",
      "Control de acceso"
    ],
    icono: "🔐",
    imagen: "./src/assets/seguridad.jpg"
  }
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
  // Guardamos todos los productos de la base de datos sin cortarlos rígidamente
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Controla cuántos productos se muestran (inicia en 4)
  const [limiteVisible, setLimiteVisible] = useState(4);
  const [featureActual, setFeatureActual] = useState(0);

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
        // Guardamos todo el arreglo mapeando los IDs correctamente
        const items = Array.isArray(data)
          ? data.map(p => ({ id: p._id || p.id, ...p }))
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

  useEffect(() => {

    const intervalo = setInterval(() => {

      setFeatureActual((prev) =>
        prev === funcionalidades.length - 1
          ? 0
          : prev + 1
      );

    }, 4500);

    return () => clearInterval(intervalo);

  }, []);

  // Sumar 4 productos adicionales al hacer click
  const cargarMasProductos = () => {
    setLimiteVisible((prev) => prev + 4);
  };

  // Obtenemos dinámicamente el subconjunto de productos usando el límite actual
  const productosVisibles = productos.slice(0, limiteVisible);

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
              {[1, 2, 3, 4].map(i => (
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
              {/* Mapeamos únicamente los productos visibles autorizados */}
              {productosVisibles.map((producto) => (
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

          {/* Solo aparece si quedan más productos ocultos por renderizar */}
          {!cargando && productos.length > limiteVisible && (
            <div className="text-center mt-12">
              <button
                onClick={cargarMasProductos}
                className="border border-white/20 text-gray-300 hover:bg-white/10 px-8 py-3 rounded-2xl transition text-sm font-semibold cursor-pointer"
              >
                Ver más productos
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="py-24 px-6">

        <div className="max-w-7xl mx-auto">

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Imagen */}

            <div className="relative">

              <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5">

                <img
                  src={funcionalidades[featureActual].imagen}
                  alt=""
                  className="w-full h-[450px] object-cover transition-all duration-700"
                />

              </div>

            </div>

            {/* Texto */}

            <div>

              <span className="text-6xl">
                {funcionalidades[featureActual].icono}
              </span>

              <h2 className="text-5xl font-black text-white mt-6">

                {funcionalidades[featureActual].titulo}

              </h2>

              <p className="text-gray-400 mt-6 text-lg leading-relaxed">

                {funcionalidades[featureActual].descripcion}

              </p>

              <div className="mt-8 space-y-4">

                {funcionalidades[featureActual].puntos.map((p) => (

                  <div
                    key={p}
                    className="flex items-center gap-3"
                  >

                    <div className="w-7 h-7 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold">
                      ✓
                    </div>

                    <span className="text-gray-300">
                      {p}
                    </span>

                  </div>

                ))}

              </div>

              {/* Indicadores */}

              <div className="flex gap-3 mt-10">

                {funcionalidades.map((_, index) => (

                  <button
                    key={index}
                    onClick={() => setFeatureActual(index)}
                    className={`h-3 rounded-full transition-all duration-300 ${featureActual === index
                      ? "w-10 bg-yellow-400"
                      : "w-3 bg-gray-600"
                      }`}
                  />

                ))}

              </div>

            </div>

          </div>

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