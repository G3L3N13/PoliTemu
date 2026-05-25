import { useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { AuthCard, PrimaryButton, SuccessMessage, ErrorMessage } from "../components/AuthUI";

function VerifyEmail() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResend = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await sendEmailVerification(auth.currentUser);
      setSuccess("Correo de verificación reenviado.");
    } catch {
      setError("No se pudo reenviar el correo. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Verifica tu correo" subtitle="Casi listo para comenzar">
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">📧</div>
        <p className="text-blue-200 text-sm leading-relaxed">
          Te enviamos un correo de verificación. Revisa tu bandeja de entrada
          y haz clic en el enlace para activar tu cuenta.
        </p>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <PrimaryButton onClick={handleResend} loading={loading} disabled={loading}>
        Reenviar correo
      </PrimaryButton>

      <button
        onClick={() => navigate("/login")}
        className="w-full mt-3 py-3 rounded-xl border border-white/20 text-blue-200 text-sm hover:bg-white/10 transition"
      >
        Ir al inicio de sesión
      </button>
    </AuthCard>
  );
}

export default VerifyEmail;