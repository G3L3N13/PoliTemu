import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="bg-blue-950 border-b border-white/10 px-6 py-3 flex items-center justify-between relative">
      {/* Logo */}
      <Link to="/home" className="text-xl font-black text-white tracking-tight">
        Poli<span className="text-yellow-400">Temu</span>
      </Link>

      {/* Botón hamburguesa móvil */}
      <button
        className="md:hidden text-white text-2xl"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>

      {/* Links desktop */}
      <ul className="hidden md:flex items-center gap-6 text-sm">
        <li>
          <Link to="/home" className="text-blue-200 hover:text-yellow-400 transition">
            Inicio
          </Link>
        </li>

        {user ? (
          <>
            {/* 🔥 Dashboard solo para administradores */}
            {isAdmin && (
              <li>
                <Link to="/dashboard" className="text-blue-200 hover:text-yellow-400 transition">
                  Dashboard
                </Link>
              </li>
            )}
            <li>
              <Link to="/profile" className="text-blue-200 hover:text-yellow-400 transition">
                Mi Perfil
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-4 py-1.5 rounded-lg text-sm transition"
              >
                Cerrar sesión
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="text-blue-200 hover:text-yellow-400 transition">
                Iniciar sesión
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-4 py-1.5 rounded-lg transition"
              >
                Registrarse
              </Link>
            </li>
          </>
        )}
      </ul>

      {/* Menú móvil */}
      {open && (
        <ul className="absolute top-full left-0 right-0 bg-blue-950 border-t border-white/10 flex flex-col gap-1 p-4 md:hidden z-50">
          <li><Link to="/home" className="block text-blue-200 py-2" onClick={() => setOpen(false)}>Inicio</Link></li>
          {user ? (
            <>
              {/* 🔥 Dashboard solo para administradores */}
              {isAdmin && (
                <li><Link to="/dashboard" className="block text-blue-200 py-2" onClick={() => setOpen(false)}>Dashboard</Link></li>
              )}
              <li><Link to="/profile" className="block text-blue-200 py-2" onClick={() => setOpen(false)}>Mi Perfil</Link></li>
              <li>
                <button onClick={handleLogout} className="text-yellow-400 py-2 font-bold">
                  Cerrar sesión
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="block text-blue-200 py-2" onClick={() => setOpen(false)}>Iniciar sesión</Link></li>
              <li><Link to="/register" className="block text-yellow-400 py-2 font-bold" onClick={() => setOpen(false)}>Registrarse</Link></li>
            </>
          )}
        </ul>
      )}
    </nav>
  );
}

export default Navbar;