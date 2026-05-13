// src/pages/Register.jsx
import React, { useState } from "react";
<<<<<<< HEAD
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom"; // 👈 Importa Link
import "../styles.css";
=======
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
>>>>>>> ed83b7c051b9f0111a0fdcb3c9c58b749d9bcd19

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
<<<<<<< HEAD
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar datos básicos en Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        email: user.email,
        rol: "cliente",
        creadoEn: new Date()
      });

      alert("Usuario registrado y guardado en Firestore");

      // Redirige al Dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error en registro:", error.message);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Registro</h2>
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
        <input
          type="password"
          placeholder="Confirmar contraseña"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button onClick={handleRegister}>Registrarse</button>

        {/* 👇 Enlace adicional */}
        <div className="extra-links">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
=======

  const handleRegister = async () => {
  if (password !== confirmPassword) {
    alert("Las contraseñas no coinciden");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Guardar datos básicos en Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      email: user.email,
      rol: "cliente",
      creadoEn: new Date()
    });

    alert("Usuario registrado y guardado en Firestore");
  } catch (error) {
    console.error("Error en registro:", error.message);
    alert("Error: " + error.message);
  }
};

  return (
    <div>
      <h2>Registro</h2>
      <input
        type="email"
        placeholder="Correo electrónico"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Contraseña"
        onChange={(e) => setPassword(e.target.value)}
      /> <br />
      <input
        type="password"
        placeholder="Confirmar contraseña"
        onChange={(e) => setConfirmPassword(e.target.value)}
      /> <br />
      <button onClick={handleRegister}>Registrarse</button>
>>>>>>> ed83b7c051b9f0111a0fdcb3c9c58b749d9bcd19
    </div>
  );
}

export default Register;
