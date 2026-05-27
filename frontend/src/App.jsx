// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";

import Home from "./pages/Home";
import HomePrivado from "./pages/HomePrivado";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminProductos from "./pages/AdminProductos";

import ProductPage from "./pages/ProductPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Privadas */}
      <Route path="/home" element={<PrivateRoute><HomePrivado /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute><AdminProductos /></PrivateRoute>} />
      <Route path="/product/:id" element={<ProductPage />} />

      {/* Temporal 404 para depuración */}
      <Route path="*" element={<div style={{ padding: 40 }}>Página no encontrada (404)</div>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <main>
          <AppRoutes />
        </main>
      </Layout>
    </AuthProvider>
  );
}