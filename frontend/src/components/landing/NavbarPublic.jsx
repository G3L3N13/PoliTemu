import { useState } from "react";
import { Link } from "react-router-dom";
import owlLogo from "../../assets/logo_buho.png";
import { useAuth } from "../../context/AuthContext";

function NavbarPublic() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#071425]/75 backdrop-blur-2xl border-b border-white/5 shadow-xl">
      <div className="w-full px-8 lg:px-16 py-5 flex items-center justify-between">

        {/* Logo  */}
        <Link to="/" className="flex items-center gap-3">

          <img
            src={owlLogo}
            alt="PoliTemu"
            className="w-15 h-15 object-contain"
          />

          <div className="flex flex-col leading-none">

            <span className="text-4xl font-black text-white">
              Poli<span className="text-yellow-400">Temu</span>
            </span>

            <span className="text-xs text-slate-300">
              Marketplace Académico
            </span>

          </div>

        </Link>

        {/* Menú Desktop */}
        <div className="hidden lg:flex items-center gap-10 text-[15px] font-medium">

          <a
            href="#inicio"
            className="text-lg text-gray-100 hover:text-yellow-400 transition-colors duration-300"
          >
            Inicio
          </a>

          <a
            href="#categorias"
            className="text-lg text-gray-100 hover:text-yellow-400 transition-colors duration-300"
          >
            Categorías
          </a>

          <a
            href="#productos"
            className="text-lg text-gray-100 hover:text-yellow-400 transition-colors duration-300"
          >
            Productos
          </a>

          <a
            href="#valoraciones"
            className="text-lg text-gray-100 hover:text-yellow-400 transition-colors duration-300"
          >
            Valoraciones
          </a>

        </div>

        {/* Buscador + Acciones */}
        <div className="hidden lg:flex items-center gap-5">

          {/* Buscador */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 w-72 xl:w-80 backdrop-blur-xl hover:border-cyan-400/40 focus-within:border-cyan-400 transition-all duration-300">

            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              type="text"
              placeholder="Buscar productos..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
            />

          </div>

          {/* Usuario autenticado */}
          {user ? (

            <Link
              to="/profile"
              className="text-gray-100 hover:text-yellow-400 transition-colors duration-300 font-medium"
            >
              Mi Perfil
            </Link>

          ) : (

            <>

              <Link
                to="/login"
                className="text-lg border border-white/10 hover:border-cyan-400 hover:bg-white/5 text-gray-100 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium"
              >
                Iniciar Sesión
              </Link>

              <Link
                to="/register"
                className="text-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-[#071425] font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-yellow-500/20 hover:scale-105 transition-all duration-300"
              >
                Registrarse
              </Link>

            </>

          )}

        </div>

        {/* Botón menú móvil */}
        <button
          className="lg:hidden text-white text-3xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

      </div>

      {/* Menú móvil */}
      {menuOpen && (

        <div className="lg:hidden bg-[#071425]/95 backdrop-blur-xl border-t border-white/10 px-6 py-6 flex flex-col gap-5 text-white">

          <a
            href="#inicio"
            onClick={() => setMenuOpen(false)}
            className="hover:text-yellow-400 transition"
          >
            Inicio
          </a>

          <a
            href="#categorias"
            onClick={() => setMenuOpen(false)}
            className="hover:text-yellow-400 transition"
          >
            Categorías
          </a>

          <a
            href="#productos"
            onClick={() => setMenuOpen(false)}
            className="hover:text-yellow-400 transition"
          >
            Productos
          </a>

          <a
            href="#valoraciones"
            onClick={() => setMenuOpen(false)}
            className="hover:text-yellow-400 transition"
          >
            Valoraciones
          </a>

          {/* Acciones */}
          {user ? (

            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="bg-cyan-600 hover:bg-cyan-500 py-3 rounded-xl text-center font-semibold transition"
            >
              Mi Perfil
            </Link>

          ) : (

            <>

              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-center border border-white/20 rounded-xl py-3 hover:bg-white/5 transition"
              >
                Iniciar Sesión
              </Link>

              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#071425] py-3 rounded-xl text-center font-bold"
              >
                Registrarse
              </Link>

            </>

          )}

        </div>

      )}

    </nav>
  );
}

export default NavbarPublic;