import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";
import { Link } from "react-router-dom";
import { AuthCard, AuthInput, PrimaryButton, ErrorMessage, SuccessMessage } from "../components/AuthUI";

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
      await sendPasswordResetEmail(auth, email);
      setSuccess("Te enviamos un enlace a tu correo para restablecer tu contraseña.");
    } catch (err) {
      const mensajes = {
        "auth/user-not-found": "No existe una cuenta con ese correo.",
        "auth/invalid-email": "El correo no tiene un formato válido.",
      };
      setError(mensajes[err.code] || "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Recuperar contraseña" subtitle="Te enviaremos un enlace a tu correo">
      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <AuthInput
        label="Correo electrónico"
        type="email"
        placeholder="tu@epn.edu.ec"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError(""); setSuccess(""); }}
      />

      <PrimaryButton onClick={handleReset} loading={loading} disabled={loading || !!success}>
        Enviar enlace
      </PrimaryButton>

      <p className="text-center text-blue-300 text-sm mt-6">
        <Link to="/login" className="text-yellow-400 hover:underline">
          ← Volver al inicio de sesión
        </Link>
      </p>
    </AuthCard>
  );
}

export default ForgotPassword;