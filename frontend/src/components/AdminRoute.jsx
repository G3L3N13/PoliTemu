// src/components/AdminRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Usamos onAuthStateChanged para esperar a que Firebase sepa quién es el usuario
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "usuarios", user.uid));
        
        // Verifica si el documento existe y si el rol es admin
        if (snap.exists() && snap.data().rol === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error validando admin:", err);
        setIsAdmin(false);
      } finally {
        // Solo terminamos la carga después de intentar la consulta
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // MIENTRAS ESTÁ CARGANDO, NO REDIRIGAS, SOLO ESPERA
  if (checking) {
    return <div className="p-10 text-center text-white">Verificando permisos de administrador...</div>;
  }

  // SI YA TERMINÓ DE CARGAR Y NO ES ADMIN, AHÍ SÍ REDIRIGE
  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}