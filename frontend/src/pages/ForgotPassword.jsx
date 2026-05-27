import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";
import { Link } from "react-router-dom";
import buhoImg from "../assets/Buho_tienda.jpeg";
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const handleReset = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(
        auth,
        email
      );
      setSuccess(
        "Te enviamos un enlace a tu correo para restablecer tu contraseña."
      );
    } catch (err) {
      const mensajes = {
        "auth/user-not-found":
          "No existe una cuenta con ese correo.",
        "auth/invalid-email":
          "El correo no tiene un formato válido.",
      };
      setError(
        mensajes[err.code] ||
        "Ocurrió un error. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0B1E63] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-6xl bg-white rounded-[40px] overflow-hidden shadow-2xl grid lg:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="relative hidden lg:block">
          <img
            src={buhoImg}
            alt="Imagen Buho"
            className="w-full h-full object-cover"
          />
          {/* OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-700/70 to-blue-900/70"></div>
          {/* TEXT */}
          <div className="absolute bottom-10 left-10 text-white z-10">

            <h2 className="text-5xl font-bold leading-tight">
              Recupera tu cuenta
            </h2>
            <p className="mt-5 text-lg text-gray-200 max-w-md">
              Ingresa tu correo institucional y te enviaremos
              un enlace para restablecer tu contraseña.
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
              <p className="text-gray-500 mt-3">
                Escuela Politécnica Nacional
              </p>
            </div>
            {/* TITLE */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-800">
                Recuperar contraseña
              </h2>
              <p className="text-gray-500 mt-3">
                Te enviaremos un enlace a tu correo
              </p>
            </div>
            {/* ERROR */}
            {error && (
              <div className="bg-red-100 text-red-600 p-4 rounded-2xl mb-6">
                {error}
              </div>
            )}
            {/* SUCCESS */}
            {success && (
              <div className="bg-green-100 text-green-700 p-4 rounded-2xl mb-6">
                {success}
              </div>
            )}
            {/* EMAIL */}
            <div className="mb-8">
              <label className="block mb-2 font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="tu@epn.edu.ec"
                value={email}
                onChange={(e) => {

                  setEmail(e.target.value);

                  setError("");
                  setSuccess("");
                }}
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:border-[#6C4CF1] transition"
              />
            </div>
            {/* BUTTON */}
            <button
              onClick={handleReset}
              disabled={loading || !!success}
              className="w-full bg-[#6C4CF1] hover:bg-[#5b3fe0] text-white py-4 rounded-2xl font-semibold transition shadow-lg disabled:opacity-50"
            >
              {loading
                ? "Enviando..."
                : "Enviar enlace"}
            </button>
            {/* BACK */}
            <p className="text-center text-gray-500 mt-8">
              <Link
                to="/login"
                className="text-[#6C4CF1] font-semibold hover:underline">
                ← Volver al inicio de sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;