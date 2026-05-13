<<<<<<< HEAD
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  const location = useLocation();

  // 👇 Oculta el Navbar en Login y Register
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </>
=======
import { useState } from 'react'
import './App.css'
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <main>
      <h1>PoliTemu</h1>
      <h2>PRUEBA PARA FIREBASE</h2>
      <p>Login</p>
      <Login />
      <Register />
    </main>
>>>>>>> ed83b7c051b9f0111a0fdcb3c9c58b749d9bcd19
  );
}

export default App;
<<<<<<< HEAD
=======


>>>>>>> ed83b7c051b9f0111a0fdcb3c9c58b749d9bcd19
