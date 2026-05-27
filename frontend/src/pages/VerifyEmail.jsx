// src/pages/VerifyEmail.jsx

import { useState, useEffect } from "react";
import {
  sendEmailVerification,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  onAuthStateChanged,
  applyActionCode,
} from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  AuthCard,
  PrimaryButton,
  SuccessMessage,
  ErrorMessage,
} from "../components/AuthUI";

export default function VerifyEmail() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();

  // Si la URL contiene oobCode (enlace de verificación), aplicarlo y redirigir a login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oobCode = params.get("oobCode");
    if (oobCode) {
      (async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
          // Aplica el código de acción (verifica el email en el backend)
          await applyActionCode(auth, oobCode);
          setSuccess("Correo verificado correctamente. Serás redirigido al inicio de sesión.");
          // Redirigir al login para que el usuario inicie sesión
          setTimeout(() => navigate("/login"), 1200);
        } catch (err) {
          console.error("Error aplicando oobCode:", err);
          setError("No se pudo verificar el correo desde el enlace. Intenta reenviar el correo o inicia sesión y comprueba manualmente.");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [navigate]);

  // Listener para detectar si el usuario ya está autenticado y verificado (ej. quedó en sesión)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        // Forzar recarga para obtener estado actualizado desde servidor
        await user.reload();
      } catch (e) {
        // ignore reload errors
      }
      if (user.emailVerified) {
        try {
          // Intentar actualizar Firestore si el usuario está autenticado
          await updateDoc(doc(db, "usuarios", user.uid), { emailVerificado: true });
        } catch (err) {
          console.warn("No se pudo actualizar emailVerificado en Firestore:", err);
        }
        // Si ya está verificado, redirigir al inicio de sesión (o home según prefieras)
        navigate("/login");
      }
    });
    return () => unsub();
  }, [navigate]);

  // Reenvío de correo (sin reCAPTCHA)
  const handleResendEmail = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("No hay usuario autenticado. Inicia sesión o regístrate primero.");
        setLoading(false);
        return;
      }

      // actionCodeSettings para que el enlace vuelva a /verify-email con oobCode
      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: false,
      };

      await sendEmailVerification(user, actionCodeSettings);
      setSuccess("Correo de verificación reenviado. Revisa tu bandeja.");
    } catch (err) {
      console.error("Error reenviando correo:", err);
      if (err.code === "auth/too-many-requests") {
        setError("Demasiadas solicitudes. Intenta más tarde.");
      } else {
        setError(err.message || "No se pudo reenviar el correo.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Inicializar reCAPTCHA solo cuando se necesite (lazy init) y limpiar si existe
  const ensureRecaptcha = () => {
    try {
      if (typeof window === "undefined") return null;
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          // ignore
        }
        window.recaptchaVerifier = null;
      }
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "invisible", callback: () => console.log("reCAPTCHA verificado") },
        auth
      );
      return window.recaptchaVerifier;
    } catch (err) {
      console.error("Error inicializando reCAPTCHA:", err);
      setError("Error al inicializar reCAPTCHA. Revisa la consola.");
      return null;
    }
  };

  // Enviar SMS (usa reCAPTCHA)
  const handleSendSMS = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!phone || phone.trim() === "") {
        setError("Ingresa un número de teléfono.");
        setLoading(false);
        return;
      }
      const formattedPhone = phone.startsWith("+") ? phone : "+593" + phone.replace(/\D/g, "");
      const appVerifier = ensureRecaptcha();
      if (!appVerifier) {
        setLoading(false);
        return;
      }
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setSuccess("Código enviado por SMS. Revisa tu teléfono.");
    } catch (err) {
      console.error("Error al enviar SMS:", err);
      if (err.code === "auth/invalid-phone-number") {
        setError("Número inválido. Usa formato internacional, por ejemplo +593987111776.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Demasiadas solicitudes. Espera un momento o usa un número de prueba.");
      } else {
        setError(err.message || "No se pudo enviar el SMS.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Confirmar código SMS y actualizar Firestore
  const handleConfirmCode = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!confirmationResult) {
        setError("No hay un código pendiente. Envía el SMS primero.");
        setLoading(false);
        return;
      }
      await confirmationResult.confirm(code);
      setSuccess("Teléfono verificado correctamente.");
      const user = auth.currentUser;
      if (user) {
        try {
          await updateDoc(doc(db, "usuarios", user.uid), {
            phoneVerified: true,
            emailVerificado: user.emailVerified || false,
          });
        } catch (err) {
          console.warn("No se pudo actualizar verificación en Firestore:", err);
        }
      }
      navigate("/login");
    } catch (err) {
      console.error("Error confirmando código:", err);
      setError(err.message || "Código inválido o expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Verifica tu cuenta" subtitle="Elige un método de verificación">
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">🔐</div>
        <p className="text-blue-200 text-sm leading-relaxed">
          Puedes verificar tu cuenta por correo electrónico o por SMS.
        </p>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <PrimaryButton onClick={handleResendEmail} loading={loading} disabled={loading}>
        Reenviar correo de verificación
      </PrimaryButton>

      {/* Nota: se eliminó el botón "Comprobar verificación" por petición */}
      <div className="mt-4">
        <input
          type="tel"
          placeholder="+593987111776"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border px-3 py-2 rounded-md"
        />
        <PrimaryButton onClick={handleSendSMS} loading={loading} disabled={loading}>
          Enviar código SMS
        </PrimaryButton>
      </div>

      {confirmationResult && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Código recibido"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
          />
          <PrimaryButton onClick={handleConfirmCode} loading={loading} disabled={loading}>
            Confirmar código
          </PrimaryButton>
        </div>
      )}

      <div id="recaptcha-container"></div>

      <button
        onClick={() => navigate("/login")}
        className="w-full mt-3 py-3 rounded-xl border border-white/20 text-blue-200 text-sm hover:bg-white/10 transition"
      >
        Ir al inicio de sesión
      </button>
    </AuthCard>
  );
}
