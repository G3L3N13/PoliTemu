import { Link } from "react-router-dom";

function CTA() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto relative overflow-hidden bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-purple-500/20 rounded-[40px] p-16 text-center backdrop-blur-xl">

        {/* Decoración */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            INTERCAMBIA TUS ARTÍCULOS{" "}
            <span className="text-yellow-400">DESDE HOY!</span>
          </h2>

          <p className="mt-4 text-gray-300 text-lg">
            Únete a la comunidad universitaria de PoliTemu
          </p>

          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <Link
              to="/register"
              className="bg-yellow-400 hover:bg-yellow-300 text-black px-10 py-4 rounded-2xl font-bold transition hover:scale-105 shadow-lg shadow-yellow-400/20"
            >
              Registrarse
            </Link>
            <Link
              to="/login"
              className="border border-white/30 text-white hover:bg-white/10 px-10 py-4 rounded-2xl font-semibold transition"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTA;