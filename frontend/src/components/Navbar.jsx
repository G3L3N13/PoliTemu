import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import owlLogo from "../assets/logo_buho.png";

// Componentes
import CartIcon from "./common/CartIcon";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));

        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().rol === "admin");
        }
      } catch (error) {
        console.error("Error verificando rol:", error);
      }
    };

    checkAdmin();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#071425]/75 backdrop-blur-2xl border-b border-white/5 shadow-xl">
      <div className="w-full px-8 lg:px-12 xl:px-16 py-5 flex items-center justify-between">

        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <img
            src={owlLogo}
            alt="PoliTemu"
            className="w-15 h-15 object-contain"
          />

          <div>
            <h1 className="text-4xl font-black text-white">
              Poli<span className="text-yellow-400">Temu</span>
            </h1>

            <p className="text-s text-blue-200">
              Marketplace Académico
            </p>
          </div>
        </Link>

        {/* MENÚ DESKTOP */}
        <ul className="hidden lg:flex items-center gap-10">

          <li>
            <Link
              to="/"
              className="text-2xl text-gray-100 hover:text-yellow-400 transition-colors duration-300"
            >
              Inicio
            </Link>
          </li>

          {user ? (
            <>  
              <li>
                <Link
                  to="/home"
                  className="text-2xl text-gray-100 hover:text-yellow-400 transition-colors duration-300"
                >
                  Catálogo
                </Link>
              </li>

              <li>
                <Link
                  to="/chat"
                  className="text-2xl text-gray-100 hover:text-yellow-400 transition-colors duration-300 flex items-center gap-2"
                >
                  💬 Chat
                </Link>
              </li>

              {isAdmin && (
                <li>
                  <Link
                    to="/dashboard"
                    className="text-2xl bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl font-semibold transition"
                  >
                    Dashboard
                  </Link>
                </li>
              )}

              <li>
                <Link
                  to="/profile"
                  className="text-2xl text-gray-100 hover:text-yellow-400 transition-colors duration-300"
                >
                  Perfil
                </Link>
              </li>

              <li>
                <CartIcon />
              </li>

              <li>
                <button
                  onClick={handleLogout}
                  className="text-2xl bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-semibold transition"
                >
                  Cerrar sesión
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className="text-2xl text-gray-300 hover:text-white transition"
                >
                  Iniciar sesión
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="text-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-5 py-2 rounded-xl transition"
                >
                  Registrarse
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* BOTÓN MENÚ MÓVIL */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden text-white text-3xl"
        >
          ☰
        </button>
      </div>

      {/* MENÚ MÓVIL */}
      {menuOpen && (
        <div className="lg:hidden bg-[#0F172A] border-t border-white/10 px-6 py-4">
          <ul className="flex flex-col gap-4">

            <li>
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="text-gray-300 hover:text-yellow-400 transition-colors duration-300"
              >
                Inicio
              </Link>
            </li>

            {user ? (
              <>
                <li>
                  <Link
                    to="/home"
                    onClick={() => setMenuOpen(false)}
                    className="text-gray-300 hover:text-yellow-400 transition-colors duration-300"
                  >
                    Catálogo
                  </Link>
                </li>

                <li>
                  <Link
                    to="/chat"
                    onClick={() => setMenuOpen(false)}
                    className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 flex items-center gap-2"
                  >
                    💬 Chat
                  </Link>
                </li>

                {isAdmin && (
                  <li>
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="bg-purple-700 hover:bg-purple-600 text-white px-5 py-2 rounded-xl font-semibold shadow-lg shadow-purple-700/30 transition"
                    >
                      Dashboard
                    </Link>
                  </li>
                )}

                <li>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="text-gray-300 hover:text-yellow-400 transition-colors duration-300"
                  >
                    Perfil
                  </Link>
                </li>

                <li className="pt-2">
                  <CartIcon />
                </li>

                <li>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-semibold transition"
                  >
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-gray-300 hover:text-white"
                  >
                    Iniciar sesión
                  </Link>
                </li>

                <li>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="block text-center bg-yellow-400 hover:bg-yellow-300 text-black py-3 rounded-xl font-bold"
                  >
                    Registrarse
                  </Link>
                </li>
              </>
            )}

          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;