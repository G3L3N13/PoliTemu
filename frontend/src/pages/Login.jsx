<<<<<<< HEAD
// src/pages/Login.jsx
import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom"; // 👈 Importa Link
import "../styles.css";
=======
import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
>>>>>>> ed83b7c051b9f0111a0fdcb3c9c58b749d9bcd19

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
<<<<<<< HEAD
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home"); // 👈 Redirige al Home después de login
    } catch (error) {
=======

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      alert("Inicio de sesión exitoso: " + user.email);
    } catch (error) {
      console.error("Error en login:", error.message);
>>>>>>> ed83b7c051b9f0111a0fdcb3c9c58b749d9bcd19
      alert("Error: " + error.message);
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <div>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Correo electrónico"
        onChange={(e) => setEmail(e.target.value)}
      /> <br />
      <input
        type="password"
        placeholder="Contraseña"
        onChange={(e) => setPassword(e.target.value)}
      /> <br />
      <button onClick={handleLogin}>Iniciar Sesión</button>
>>>>>>> ed83b7c051b9f0111a0fdcb3c9c58b749d9bcd19
    </div>
  );
}

export default Login;
