// src/pages/Login.jsx

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import buhoImg from "../assets/Buho_tienda.jpeg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = cred.user;

      // Forzar recarga para obtener emailVerified actualizado
      try { await user.reload(); } catch (reloadErr) { console.warn("reload:", reloadErr); }

      // Leer documento en Firestore (opcional)
      let userDoc = null;
      try {
        const userDocSnap = await getDoc(doc(db, "usuarios", user.uid));
        userDoc = userDocSnap.exists() ? userDocSnap.data() : null;
      } catch (dbErr) {
        console.warn("Error leyendo Firestore:", dbErr);
      }

      const emailVerified = !!user.emailVerified || !!(userDoc && userDoc.emailVerificado);

      if (!emailVerified) {
        navigate("/verify-email", { state: { message: "Verifica tu correo antes de iniciar sesión.", email: email.trim() } });
        return;
      }

      // Si está verificado, continuar
      navigate("/home");
    } catch (err) {
      console.error("Error login:", err);
      const mensajes = {
        "auth/user-not-found": "Usuario no encontrado.",
        "auth/wrong-password": "Contraseña incorrecta.",
        "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
        "auth/invalid-email": "Correo inválido.",
      };
      setError(mensajes[err.code] || err.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1E63] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-6xl bg-white rounded-[40px] overflow-hidden shadow-2xl grid lg:grid-cols-2">
        
        {/* LEFT SIDE - IMAGEN */}
        <div className="relative hidden lg:block">
          <img src={buhoImg} alt="Imagen Buho" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-700/70 to-blue-900/70"></div>
          <div className="absolute bottom-10 left-10 text-white z-10">
            <h2 className="text-5xl font-bold leading-tight">Bienvenido a PoliTemu</h2>
            <p className="mt-5 text-lg text-gray-200 max-w-md">
              El marketplace académico de la Escuela Politécnica Nacional.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE - FORMULARIO */}
        <div className="flex items-center justify-center p-10 md:p-16">
          <div className="w-full max-w-md">
            
            {/* LOGO */}
            <div className="mb-10 text-center">
              <h1 className="text-5xl font-bold text-[#0B1E63]">
                Poli<span className="text-yellow-400">Temu</span>
              </h1>
              <p className="text-gray-500 mt-3">Escuela Politécnica Nacional</p>
            </div>

            {/* TITLE */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-800">Iniciar Sesión</h2>
              <p className="text-gray-500 mt-3">Accede a tu cuenta PoliTemu</p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-100 text-red-600 p-4 rounded-2xl mb-6">
                {error}
              </div>
            )}

            {/* FORM */}
            <div className="mb-5">
              <label className="block mb-2 font-medium text-gray-700">Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@epn.edu.ec"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:border-[#6C4CF1] transition"
              />
            </div>

            <div className="mb-2">
              <label className="block mb-2 font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:border-[#6C4CF1] transition"
              />
            </div>

            {/* OLVIDÉ CONTRASEÑA */}
            <div className="mb-6 text-right">
              <Link 
                to="/forgot-password" 
                className="text-sm text-[#6C4CF1] hover:underline font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* BOTÓN LOGIN */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#6C4CF1] hover:bg-[#5b3fe0] text-white py-4 rounded-2xl font-semibold transition shadow-lg disabled:opacity-50"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>

            {/* REGISTRO */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                ¿No tienes cuenta?{" "}
                <Link 
                  to="/register" 
                  className="text-[#6C4CF1] font-semibold hover:underline"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>

            {/* SEPARADOR */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-gray-500 text-sm">O</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* VOLVER AL HOME */}
            <Link 
              to="/" 
              className="w-full block text-center bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-2xl font-semibold transition"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}