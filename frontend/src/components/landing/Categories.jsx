import imgTecnologia from "../../assets/ICONOS1.png"
import imgRopa from "../../assets/ICONOS2.png"
import imgLibros from "../../assets/ICONOS3.png"
import imgHogar from "../../assets/ICONOS4.png"
import imgDeportes from "../../assets/ICONOS5.png"
import imgServicios from "../../assets/ICONOS6.png"

const categorias = [
  {
    nombre: "Tecnología",
    descripcion: "Laptops, calculadoras y más",
    imagen: imgTecnologia
  },
  {
    nombre: "Ropa",
    descripcion: "Uniformes y ropa universitaria",
    imagen: imgRopa
  },
  {
    nombre: "Libros",
    descripcion: "Textos académicos y más",
    imagen: imgLibros
  },
  {
    nombre: "Hogar",
    descripcion: "Artículos para tu cuarto",
    imagen: imgHogar
  },
  {
    nombre: "Deportes",
    descripcion: "Equipamiento deportivo",
    imagen: imgDeportes
  },
  {
    nombre: "Servicios",
    descripcion: "Tutorías y servicios estudiantiles",
    imagen: imgServicios
  },
];

function Categories() {
  return (
    <section id="categorias" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white">
            EXPLORA POR{" "}
            <span className="text-yellow-400">CATEGORÍAS</span>
          </h2>
          <p className="text-gray-400 mt-4 text-lg">
            Encuentra exactamente lo que necesitas para tus estudios
          </p>
        </div>

        {/* Grid de categorías */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categorias.map((cat) => (
            <div
              key={cat.nombre}
              className="group relative rounded-3xl overflow-hidden cursor-pointer hover:scale-[1.03] transition-all duration-300 shadow-lg"
            >
              {/* Imagen de fondo */}
              <img
                src={cat.imagen}
                alt={cat.nombre}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Overlay oscuro */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Overlay morado al hover */}
              <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/20 transition-all duration-300" />

              {/* Texto */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-xl font-bold text-white">{cat.nombre}</h3>
                <p className="text-gray-300 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {cat.descripcion}
                </p>
              </div>

              {/* Borde amarillo al hover */}
              <div className="absolute inset-0 border-2 border-yellow-400/0 group-hover:border-yellow-400/50 rounded-3xl transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;