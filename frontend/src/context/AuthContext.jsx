import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { usuariosService } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Función para volver a cargar el perfil de manera manual desde cualquier componente
  const recargarPerfil = async () => {
    if (!auth.currentUser) return null;
    try {
      const perfil = await usuariosService.obtenerMiPerfil();
      setProfile(perfil);
      return perfil;
    } catch (error) {
      console.error("Error al recargar perfil:", error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!mounted) return;

      setUser(u || null);

      if (u) {
        try {
          // 🔥 SOLUCIÓN: Forzar la espera de que el token esté disponible en el cliente Firebase 
          // antes de disparar la petición al backend. Esto evita el AxiosError aleatorio.
          await u.getIdToken(true); 

          const perfil = await usuariosService.obtenerMiPerfil();
          if (mounted) {
            console.log("PERFIL BACKEND SINCRONIZADO:", perfil);
            setProfile(perfil);
          }
        } catch (error) {
          console.error("Error cargando perfil inicial:", error);
          if (mounted) setProfile(null);
        }
      } else {
        setProfile(null);
      }

      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  return (
    // 🔥 Añadimos 'recargarPerfil' al Provider para que puedas usarlo al actualizar datos o registrarse
    <AuthContext.Provider value={{ user, profile, loading, recargarPerfil, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}