// src/components/landing/NavbarPublic.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import owlLogo from "../../assets/logo_buho.png";
import { useAuth } from "../../context/AuthContext"; // ajusta la ruta si es distinta

function NavbarPublic() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth(); // user es null si no hay sesión

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a1a]/90 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={owlLogo} alt="PoliTemu" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-black text-white tracking-tight">
            POLI<span className="text-yellow-400">TEMU</span>
          </span>
        </Link>

        {/* Links centro */}
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <a href="#inicio" className="hover:text-yellow-400 transition">Home</a>
          <a href="#categorias" className="hover:text-yellow-400 transition">Categorías</a>
          <a href="#productos" className="hover:text-yellow-400 transition">Destacados</a>
          <Link to="#validaciones" className="hover:text-yellow-400 transition">Validaciones</Link>
        </div>

        {/* Buscador + acciones  */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center bg-white/10 border border-white/10 rounded-xl px-4 py-2 gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar productos..."
              className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-40"
            />
          </div>

          {/* Si hay usuario, mostrar enlace a perfil; si no, mostrar Login/Register */}
          {user ? (
            <Link to="/profile" className="text-gray-300 hover:text-yellow-400 transition text-sm">
              Mi Perfil
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-yellow-400 transition text-sm">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Hamburguesa móvil */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a0a1a] border-t border-white/10 px-6 py-4 flex flex-col gap-4 text-sm text-gray-300">
          <a href="#inicio" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#categorias" onClick={() => setMenuOpen(false)}>Categorías</a>
          <a href="#productos" onClick={() => setMenuOpen(false)}>Destacados</a>

          {/* Móvil: mostrar perfil si hay sesión, sino Login/Register */}
          {user ? (
            <Link to="/profile" onClick={() => setMenuOpen(false)}>Mi Perfil</Link>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link
                to="/register"
                className="bg-purple-600 text-white px-4 py-2 rounded-xl text-center font-semibold"
                onClick={() => setMenuOpen(false)}
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
