import { useState } from "react";
import { auth, db } from "../services/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { AuthCard, AuthInput, PrimaryButton, ErrorMessage } from "../components/AuthUI";

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

    if (!fullName.trim()) {
      setError("Ingresa tu nombre completo.");
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Enviar email de verificación
      await sendEmailVerification(user);

      // Guardar en Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        fullName,
        email: user.email,
        rol: "cliente",
        creadoEn: new Date(),
        emailVerificado: false,
      });

      navigate("/verify-email");
    } catch (err) {
      const mensajes = {
        "auth/email-already-in-use": "Ese correo ya está registrado.",
        "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
        "auth/invalid-email": "El correo no tiene un formato válido.",
      };
      setError(mensajes[err.code] || "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Crear cuenta" subtitle="Únete a la comunidad PoliTemu">
      <ErrorMessage message={error} />

      <AuthInput
        label="Nombre completo"
        placeholder="Tu nombre y apellido"
        value={fullName}
        onChange={(e) => { setFullName(e.target.value); setError(""); }}
      />
      <AuthInput
        label="Correo electrónico"
        type="email"
        placeholder="tu@epn.edu.ec"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError(""); }}
      />
      <AuthInput
        label="Contraseña"
        type="password"
        placeholder="Mínimo 6 caracteres"
        value={password}
        onChange={(e) => { setPassword(e.target.value); setError(""); }}
      />
      <AuthInput
        label="Confirmar contraseña"
        type="password"
        placeholder="Repite tu contraseña"
        value={confirmPassword}
        onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
      />

      <PrimaryButton onClick={handleRegister} loading={loading} disabled={loading}>
        Crear Cuenta
      </PrimaryButton>

      <p className="text-center text-blue-300 text-sm mt-6">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-yellow-400 font-semibold hover:underline">
          Inicia sesión aquí
        </Link>
      </p>
    </AuthCard>
  );
}

export default Register;
