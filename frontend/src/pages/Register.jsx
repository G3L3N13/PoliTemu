// src/pages/Register.jsx

import { useState } from "react";
import { auth, db } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import buhoImg from "../assets/Buho_tienda.jpeg";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");

    // Validaciones básicas
    if (!fullName.trim()) {
      setError("Ingresa tu nombre completo.");
      return;
    }
    if (!email.trim()) {
      setError("Ingresa un correo válido.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Guardar datos en Firestore (sin enviar verificación aquí)
      await setDoc(doc(db, "usuarios", user.uid), {
        fullName: fullName.trim(),
        email: user.email,
        rol: "cliente",
        creadoEn: new Date(),
        emailVerificado: false,
        verificationMethod: null,
        phone: null,
      });

      // Mantener sesión activa y redirigir a la pantalla de verificación
      navigate("/verify-email");
    } catch (err) {
      console.error("Error en registro:", err);
      const mensajes = {
        "auth/email-already-in-use": "Ese correo ya está registrado.",
        "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
        "auth/invalid-email": "El correo no tiene un formato válido.",
      };
      setError(mensajes[err.code] || err.message || "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1E63] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-6xl bg-white rounded-[40px] overflow-hidden shadow-2xl grid lg:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="relative hidden lg:block">
          <img src={buhoImg} alt="Imagen Buho" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-700/70 to-blue-900/70"></div>
          <div className="absolute bottom-10 left-10 text-white z-10">
            <h2 className="text-5xl font-bold leading-tight">Únete a PoliTemu</h2>
            <p className="mt-5 text-lg text-gray-200 max-w-md">
              Forma parte del marketplace académico de la Escuela Politécnica Nacional.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
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
              <h2 className="text-4xl font-bold text-gray-800">Crear Cuenta</h2>
              <p className="text-gray-500 mt-3">Únete a la comunidad PoliTemu</p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-100 text-red-600 p-4 rounded-2xl mb-6">{error}</div>
            )}

            {/* FORM */}
            <div className="mb-5">
              <label className="block mb-2 font-medium text-gray-700">Nombre completo</label>
              <input
                type="text"
                placeholder="Tu nombre y apellido"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:border-[#6C4CF1] transition"
              />
            </div>

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

            <div className="mb-5">
              <label className="block mb-2 font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:border-[#6C4CF1] transition"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-medium text-gray-700">Confirmar contraseña</label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:border-[#6C4CF1] transition"
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-[#6C4CF1] hover:bg-[#5b3fe0] text-white py-4 rounded-2xl font-semibold transition shadow-lg"
            >
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </button>

            <p className="text-center text-gray-500 mt-8">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-[#6C4CF1] font-semibold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
