import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import owlLogo from "../assets/logo_buho.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));

        setIsAdmin(
          userDoc.exists() &&
          userDoc.data().rol === "admin"
        );
      } else {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a1a]/90 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">

        {/* LOGO */}
        <Link to="/home" className="flex items-center gap-3">
          <img
            src={owlLogo}
            alt="PoliTemu"
            className="w-10 h-10 object-contain"
          />

          <span className="text-2xl font-black text-white tracking-tight">
            POLI<span className="text-yellow-400">TEMU</span>
          </span>
        </Link>

        {/* MENÚ DESKTOP */}
        <div className="hidden md:flex items-center gap-8 text-sm">

          <Link
            to="/home"
            className="text-gray-300 hover:text-yellow-400 transition"
          >
            Catálogo
          </Link>

          <Link
            to="/profile"
            className="text-gray-300 hover:text-yellow-400 transition"
          >
            Mi Perfil
          </Link>

          {isAdmin && (
            <Link
              to="/dashboard"
              className="text-yellow-400 font-bold"
            >
              Dashboard
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl font-semibold transition"
          >
            Salir
          </button>
        </div>

        {/* BOTÓN MÓVIL */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* MENÚ MÓVIL */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a0a1a] border-t border-white/10 px-6 py-4 flex flex-col gap-4">

          <Link to="/home">Catálogo</Link>

          <Link to="/profile">Mi Perfil</Link>

          {isAdmin && (
            <Link to="/dashboard">
              Dashboard
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="bg-purple-600 text-white py-2 rounded-xl"
          >
            Salir
          </button>

        </div>
      )}
    </nav>
  );
}

export default Navbar;