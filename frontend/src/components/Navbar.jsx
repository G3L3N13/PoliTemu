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
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "usuarios", user.uid));
          setIsAdmin(userDoc.exists() && userDoc.data().rol === "admin");
        } catch (error) {
          console.error("Error verificando rol:", error);
        }
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
    <nav className="bg-blue-950 border-b border-white/10 px-6 py-3 flex items-center justify-between relative">
      {/* Logo */}
      <Link to="/" className="text-xl font-black text-white tracking-tight">
        Poli<span className="text-yellow-400">Temu</span>
      </Link>

      {/* Botón menú hamburguesa (Mobile) */}
      <button className="md:hidden text-white text-2xl" onClick={() => setOpen(!open)}>
        ☰
      </button>

      {/* Menú de navegación (Desktop) */}
      <ul className="hidden md:flex items-center gap-6 text-sm">
        <li>
          <Link to="/" className="text-blue-200 hover:text-yellow-400">Inicio</Link>
        </li>
        
        {user ? (
          <>
            <li>
              <Link to="/home" className="text-blue-200 hover:text-yellow-400">Catálogo</Link>
            </li>
            
            {/* NUEVO: Enlace directo al Chat */}
            <li>
              <Link to="/chat" className="text-blue-200 hover:text-yellow-400 flex items-center gap-1">
                <span>💬</span> Chat
              </Link>
            </li>

            {isAdmin && (
              <li>
                <Link to="/dashboard" className="text-yellow-400 font-bold">Dashboard</Link>
              </li>
            )}
            
            <li>
              <Link to="/profile" className="text-blue-200 hover:text-yellow-400">Perfil</Link>
            </li>
            
            {/* Ícono de carrito */}
            <li className="flex items-center">
              <CartIcon />
            </li>

            <li>
              <button 
                onClick={handleLogout} 
                className="bg-yellow-400 text-blue-900 font-bold px-4 py-1.5 rounded-lg hover:bg-yellow-300 transition-colors"
              >
                Salir
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login" className="text-blue-200 hover:text-white">Login</Link></li>
            <li>
              <Link to="/register" className="bg-yellow-400 text-blue-900 font-bold px-4 py-1.5 rounded-lg hover:bg-yellow-300 transition-colors">
                Registro
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;