// src/pages/Login.jsx

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

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
        // NO cerrar sesión aquí. Mantener la sesión para que VerifyEmail pueda reenviar.
        // Redirigir a verify-email y pasar el email en state para mostrar contexto.
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
      <div className="w-full max-w-md bg-white rounded-[24px] p-8 shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-[#0B1E63]">Bienvenido</h1>
          <p className="text-gray-500 mt-2">Inicia sesión para continuar en PoliTemu</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-2xl mb-4">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@epn.edu.ec"
          className="w-full mb-4 p-3 border border-gray-300 rounded-2xl outline-none focus:border-[#6C4CF1] transition"
          type="email"
        />

        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tu contraseña"
          type="password"
          className="w-full mb-6 p-3 border border-gray-300 rounded-2xl outline-none focus:border-[#6C4CF1] transition"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#6C4CF1] hover:bg-[#5b3fe0] text-white py-3 rounded-2xl font-semibold transition shadow-lg"
        >
          {loading ? "Iniciando..." : "Iniciar sesión"}
        </button>
      </div>
    </div>
  );
}
