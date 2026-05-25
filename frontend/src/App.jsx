import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
 
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
 
// Rutas donde NO se muestra el Navbar
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/verify-email"];
 
function Layout() {
  const location = useLocation();
  const hideNavbar = AUTH_ROUTES.includes(location.pathname);
 
  return (
    <>
      {!hideNavbar && <Navbar />}
      <main>
        <Routes>
          {/* Ruta raíz → redirige a login */}
          <Route path="/" element={<Navigate to="/login" />} />
 
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
 
          {/* Rutas privadas — requieren sesión */}
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
 
          {/* Cualquier ruta desconocida → login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </main>
    </>
  );
}
 
function App() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}
 
export default App;

