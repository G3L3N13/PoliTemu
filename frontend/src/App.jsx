import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
// Importa el componente
import ForgotPassword from "./pages/ForgotPassword";

// Dentro de tu <Routes>:

// Pages
import Home from "./pages/Home";
import HomePrivado from "./pages/HomePrivado";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminProductos from "./pages/AdminProductos";
import ProductPage from "./pages/ProductPage";
import SellerProfile from "./pages/SellerProfile";
import ChatPage from "./pages/ChatPage"; // Asegúrate de tener este import si existe
import Profile from "./pages/Profile";
import ProductosCatalogo from "./pages/ProductosCatalogo";

function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Layout><Home /></Layout>} />

<Route path="/forgot-password" element={<ForgotPassword />} />
      {/* Rutas Privadas (Requieren estar logueado) */}
      <Route path="/home" element={<PrivateRoute><Layout><HomePrivado /></Layout></PrivateRoute>} />
      <Route path="/productos" element={<PrivateRoute><Layout><ProductosCatalogo /></Layout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
      
      {/* Rutas de Producto y Vendedor */}
      <Route path="/product/:id" element={<PrivateRoute><Layout><ProductPage /></Layout></PrivateRoute>} />
      <Route path="/seller/:vendedorId" element={<PrivateRoute><Layout><SellerProfile /></Layout></PrivateRoute>} />
      <Route path="/chat/:vendedorId" element={<PrivateRoute><Layout><ChatPage /></Layout></PrivateRoute>} />
      
      {/* Rutas Admin (Requieren ser admin) */}
      <Route path="/dashboard" element={<AdminRoute><Layout><Dashboard /></Layout></AdminRoute>} />
      <Route path="/admin" element={<AdminRoute><Layout><AdminProductos /></Layout></AdminRoute>} />
      
      {/* Sistema */}
      <Route path="/unauthorized" element={<div className="p-10 text-white">Acceso denegado: Solo administradores.</div>} />
      <Route path="*" element={<div className="p-10 text-white">Página no encontrada</div>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}