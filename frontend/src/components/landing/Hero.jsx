import { Link } from "react-router-dom";
import owlHero from "../../assets/buho_hero.png"; 

function Hero() {
  return (
    <section id="inicio" className="min-h-screen flex items-center relative overflow-hidden px-6 pt-20">

      {/* Glows de fondo */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10 w-full">

        {/* Texto izquierdo */}
        <div>
          <span className="inline-block bg-purple-600/20 border border-purple-500/30 text-purple-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            🎓 Marketplace Académico — EPN
          </span>

          <h1 className="text-5xl md:text-7xl font-black leading-tight text-white">
            Poli<span className="text-yellow-400">Temu</span>
          </h1>

          <p className="mt-4 text-gray-300 text-lg leading-relaxed max-w-lg">
            La mejor opción para vender tus artículos dentro de la universidad de manera segura.
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-8 mb-10">
            <div>
              <p className="text-2xl font-black text-white">200+</p>
              <p className="text-gray-400 text-sm">Marcas</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">2,000+</p>
              <p className="text-gray-400 text-sm">Productos</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">30,000+</p>
              <p className="text-gray-400 text-sm">Estudiantes</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/register"
              className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-2xl font-semibold transition hover:scale-105 shadow-lg shadow-purple-600/30"
            >
              Empieza Ahora
            </Link>
          </div>
        </div>

        {/* Imagen del búho derecha */}
        <div className="relative flex justify-center items-center">
          {/* Círculo decorativo detrás */}
          <div className="absolute w-80 h-80 bg-yellow-400/10 rounded-full blur-2xl" />

          {/* Sparkles decorativos */}
          <span className="absolute top-6 right-12 text-yellow-400 text-3xl animate-pulse">✦</span>
          <span className="absolute bottom-10 left-8 text-purple-400 text-2xl animate-pulse delay-300">✦</span>
          <span className="absolute top-1/3 left-4 text-white/30 text-xl">✦</span>

          <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
            <img
              src={owlHero}
              alt="PoliTemu mascota"
              className="w-full max-w-sm mx-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;