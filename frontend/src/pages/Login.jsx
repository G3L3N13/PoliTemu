import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      alert("Inicio de sesión exitoso: " + user.email);
    } catch (error) {
      console.error("Error en login:", error.message);
      alert("Error: " + error.message);
    }
  };

  return (
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
    </div>
  );
}

export default Login;
