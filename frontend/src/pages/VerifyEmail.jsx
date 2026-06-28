import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { sendEmailVerification, onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { AuthCard, PrimaryButton, SuccessMessage, ErrorMessage } from "../components/AuthUI";

export default function VerifyEmail() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Escuchar si el usuario ya verificó su correo
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      // Actualizar estado del usuario desde el servidor de Firebase
      await user.reload();

      if (user.emailVerified) {
        try {
          await updateDoc(doc(db, "usuarios", user.uid), { emailVerificado: true });
          navigate("/login"); // Ir a login una vez verificado
        } catch (err) {
          console.error("Error al actualizar Firestore:", err);
        }
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleResendEmail = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No hay usuario autenticado.");

      await sendEmailVerification(user);
      setSuccess("Correo de verificación enviado. Revisa tu bandeja de entrada.");
    } catch (err) {
      setError(err.message || "No se pudo enviar el correo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Verifica tu cuenta" subtitle="Confirma tu correo electrónico">
      <div className="text-center mb-6">
        <p className="text-blue-200 text-sm">
          Te hemos enviado un enlace de confirmación a tu correo. Por favor, revísalo para activar tu cuenta.
        </p>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <PrimaryButton onClick={handleResendEmail} loading={loading}>
        {loading ? "Enviando..." : "Reenviar correo de verificación"}
      </PrimaryButton>

      <button
        onClick={() => navigate("/login")}
        className="w-full mt-4 py-3 text-blue-200 text-sm hover:underline"
      >
        Volver al inicio de sesión
      </button>
    </AuthCard>
  );
}