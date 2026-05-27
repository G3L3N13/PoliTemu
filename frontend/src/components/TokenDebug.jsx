// src/components/TokenDebug.jsx
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth as firebaseAuth } from "../services/firebase"; // ajusta la ruta si tu firebase.js está en otro lugar

export default function TokenDebug() {
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== "development") return null;

  const [token, setToken] = useState("");
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(false);
  const auth = firebaseAuth || getAuth();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUid(null);
        setToken("");
        return;
      }
      setUid(user.uid);
      try {
        setLoading(true);
        const t = await user.getIdToken();
        setToken(t);
      } catch (err) {
        console.error("Error obteniendo token:", err);
        setToken("");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [auth]);

  const refreshToken = async () => {
    const user = auth.currentUser;
    if (!user) return alert("No hay usuario autenticado");
    try {
      setLoading(true);
      const fresh = await user.getIdToken(true); // forzar refresh
      setToken(fresh);
      alert("Token refrescado");
    } catch (err) {
      console.error("Error refrescando token:", err);
      alert("Error refrescando token");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      alert("Token copiado al portapapeles");
    } catch {
      alert("No se pudo copiar. Copia manualmente desde la caja de texto.");
    }
  };

  return (
    <div style={{
      position: "fixed",
      right: 12,
      bottom: 12,
      zIndex: 9999,
      background: "rgba(0,0,0,0.75)",
      color: "#fff",
      padding: 12,
      borderRadius: 8,
      width: 420,
      maxWidth: "calc(100% - 24px)",
      fontSize: 13,
      boxShadow: "0 6px 18px rgba(0,0,0,0.6)"
    }}>
      <div style={{ marginBottom: 8, fontWeight: 700 }}>Token Debug (dev only)</div>
      <div style={{ marginBottom: 6 }}>UID: <span style={{ fontWeight: 600 }}>{uid ?? "—"}</span></div>
      <textarea
        readOnly
        value={token}
        rows={4}
        style={{ width: "100%", resize: "vertical", background: "#0b1220", color: "#e6eef8", border: "1px solid #233044", padding: 8, borderRadius: 6 }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={copyToClipboard} style={{ flex: 1, padding: "8px 10px", borderRadius: 6, background: "#06b6d4", border: "none", cursor: "pointer" }}>
          Copiar token
        </button>
        <button onClick={refreshToken} style={{ padding: "8px 10px", borderRadius: 6, background: "#f59e0b", border: "none", cursor: "pointer" }}>
          Refrescar token
        </button>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: "#cbd5e1" }}>
        No dejes este componente en producción. El token expira; usa Refrescar si cambias claims.
      </div>
    </div>
  );
}
