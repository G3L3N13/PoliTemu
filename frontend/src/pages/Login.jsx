import { useState } from "react";
import { auth } from "../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { AuthCard, AuthInput, PrimaryButton, ErrorMessage } from "../components/AuthUI";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      const mensajes = {
        "auth/user-not-found": "No existe una cuenta con ese correo.",
        "auth/wrong-password": "Contraseña incorrecta.",
        "auth/invalid-email": "El correo no tiene un formato válido.",
        "auth/invalid-credential": "Correo o contraseña incorrectos.",
        "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
      };
      setError(mensajes[err.code] || "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Iniciar Sesión" subtitle="Bienvenido de vuelta a PoliTemu">
      <ErrorMessage message={error} />

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
        placeholder="Ingresa tu contraseña"
        value={password}
        onChange={(e) => { setPassword(e.target.value); setError(""); }}
      />

      <div className="text-right mb-2">
        <Link to="/forgot-password" className="text-yellow-400 text-xs hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <PrimaryButton onClick={handleLogin} loading={loading} disabled={loading}>
        Iniciar Sesión
      </PrimaryButton>

      <p className="text-center text-blue-300 text-sm mt-6">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="text-yellow-400 font-semibold hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </AuthCard>
  );
}

export default Login;
