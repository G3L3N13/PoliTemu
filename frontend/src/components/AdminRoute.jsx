// src/components/AdminRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const user = auth.currentUser;
      if (!user) {
        if (mounted) { setIsAdmin(false); setChecking(false); }
        return;
      }
      try {
        const snap = await getDoc(doc(db, "usuarios", user.uid));
        if (snap.exists() && snap.data().rol === "admin") {
          if (mounted) setIsAdmin(true);
        } else {
          if (mounted) setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error comprobando rol admin:", err);
        if (mounted) setIsAdmin(false);
      } finally {
        if (mounted) setChecking(false);
      }
    };
    check();
    return () => { mounted = false; };
  }, []);

  if (checking) return <div className="p-6 text-center">Comprobando permisos...</div>;
  if (!isAdmin) return <Navigate to="/unauthorized" replace />;
  return children;
}
