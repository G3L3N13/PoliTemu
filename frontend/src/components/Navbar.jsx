import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
// 1. IMPORTA AQUÍ TU COMPONENTE
import CartIcon from "./common/CartIcon"; 

function Navbar() {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        setIsAdmin(userDoc.exists() && userDoc.data().rol === "admin");
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
      <Link to="/" className="text-xl font-black text-white tracking-tight">
        Poli<span className="text-yellow-400">Temu</span>
      </Link>

      <button className="md:hidden text-white text-2xl" onClick={() => setOpen(!open)}>☰</button>

      <ul className="hidden md:flex items-center gap-6 text-sm">
        <li><Link to="/" className="text-blue-200 hover:text-yellow-400">Inicio</Link></li>
        
        {user ? (
          <>
            <li><Link to="/home" className="text-blue-200 hover:text-yellow-400">Catálogo</Link></li>
            {isAdmin && <li><Link to="/dashboard" className="text-yellow-400 font-bold">Dashboard</Link></li>}
            <li><Link to="/profile" className="text-blue-200 hover:text-yellow-400">Perfil</Link></li>
            
            {/* 2. AQUÍ ESTÁ LA INTEGRACIÓN */}
            <li className="flex items-center">
                <CartIcon />
            </li>

            <li><button onClick={handleLogout} className="bg-yellow-400 text-blue-900 font-bold px-4 py-1.5 rounded-lg">Salir</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login" className="text-blue-200">Login</Link></li>
            <li><Link to="/register" className="bg-yellow-400 text-blue-900 font-bold px-4 py-1.5 rounded-lg">Registro</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;