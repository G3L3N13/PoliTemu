// src/pages/Register.jsx
import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    </div>
  );
}

export default Register;
