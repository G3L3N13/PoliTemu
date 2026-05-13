// src/pages/Login.jsx
import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom"; // 👈 Importa Link
import "../styles.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home"); // 👈 Redirige al Home después de login
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Correo electrónico"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Iniciar Sesión</button>

        {/* 👇 Opciones adicionales */}
        <div className="extra-links">
          <p>
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
          </p>
          <p>
            <Link to="/">¿Olvidaste tu contraseña?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
