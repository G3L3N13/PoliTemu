import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ChatProvider } from "./context/ChatContext";

// Componentes
import FloatingCart from "./components/common/FloatingCart";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

// Pages
import Home from "./pages/Home";
import HomePrivado from "./pages/HomePrivado";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminProductos from "./pages/AdminProductos";
import ProductPage from "./pages/ProductPage";
import SellerProfile from "./pages/SellerProfile";
import ChatPage from "./pages/ChatPage";
import Profile from "./pages/Profile";
import ProductosCatalogo from "./pages/ProductosCatalogo";
import VerifyEmail from "./pages/VerifyEmail";
import Carrito from "./pages/Carrito";
import Ofertas from "./pages/Ofertas";
import ForgotPassword from "./pages/ForgotPassword";
import EditarProducto from "./pages/EditarProducto";
import AdminProductosLista from "./pages/AdminProductosLista";
import AdminUsuarios from "./pages/AdminUsuarios";
import AdminOfertas from "./pages/AdminOfertas";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/success" element={<Success />} />
      {/* Rutas Privadas */}
      <Route path="/home" element={<PrivateRoute><Layout><HomePrivado /></Layout></PrivateRoute>} />
      <Route path="/productos" element={<PrivateRoute><Layout><ProductosCatalogo /></Layout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
      <Route path="/vender" element={<PrivateRoute><Layout><AdminProductos /></Layout></PrivateRoute>}/>
      <Route path="/product/:id" element={<PrivateRoute><Layout><ProductPage /></Layout></PrivateRoute>} />
      <Route path="/seller/:vendedorId" element={<PrivateRoute><Layout><SellerProfile /></Layout></PrivateRoute>} />
      <Route path="/carrito" element={<PrivateRoute><Layout><Carrito /></Layout></PrivateRoute>} />
      <Route path="/ofertas" element={<PrivateRoute><Layout><Ofertas /></Layout></PrivateRoute>} />
      <Route path="/editar-producto/:id" element={<PrivateRoute><Layout><EditarProducto /></Layout></PrivateRoute>} />
      <Route path="/cancel" element={<Cancel />} />
      {/* Chat unificado */}
      <Route path="/chat" element={<PrivateRoute><Layout><ChatPage /></Layout></PrivateRoute>} />
      <Route path="/chat/:vendedorId" element={<PrivateRoute><Layout><ChatPage /></Layout></PrivateRoute>} />

      {/* Rutas Admin */}
      <Route path="/dashboard" element={<AdminRoute><Layout><Dashboard /></Layout></AdminRoute>} />
      <Route path="/admin" element={<AdminRoute><Layout><AdminProductos /></Layout></AdminRoute>} />
      <Route path="/admin-productos" element={<AdminProductosLista />}/>
      <Route path="/dashboard/usuarios" element={<AdminUsuarios />}/>
      <Route path="/dashboard/ofertas" element={<AdminOfertas />}/>

      <Route path="/unauthorized" element={<div className="p-10 text-white">Acceso denegado</div>} />
      <Route path="*" element={<div className="p-10 text-white">Página no encontrada</div>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <CartProvider>
          <Router>
            <AppRoutes />
            <FloatingCart />
          </Router>
        </CartProvider>
      </ChatProvider>
    </AuthProvider>
  );
}