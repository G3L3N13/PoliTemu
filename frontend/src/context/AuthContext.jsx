import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const token = await u.getIdToken();
          console.log("%c🔑 TOKEN PARA TUS PRUEBAS EN POSTMAN:", "color: #00ff00; font-weight: bold; font-size: 14px;");
          console.log(token);
          console.log("%c========================================", "color: #00ff00;");
          
          // 🔥 NUEVO: Obtener el rol del usuario desde tu backend
          const response = await fetch("http://localhost:3000/api/user/role", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          setIsAdmin(data.isAdmin || false);
        } catch (error) {
          console.error("Error al obtener el rol del usuario:", error);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        console.log("No hay ningún usuario autenticado en el navegador.");
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-epn-dark flex items-center justify-center">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}