// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import DatosPersonalesForm from "../components/dashboard/DatosPersonalesForm.jsx";
import AdminProducts from "./AdminProductos.jsx";

function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("perfil");
  const [profile, setProfile] = useState(null); // guardamos todo el documento

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const ref = doc(db, "usuarios", user.uid);
    // onSnapshot para recibir actualizaciones en tiempo real
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() });
      } else {
        // si no existe, inicializamos con datos básicos
        setProfile({ id: user.uid, nombre: user.displayName || "", email: user.email || "" });
      }
    }, (err) => {
      console.error("Error escuchando perfil:", err);
    });

    return () => unsub();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-10 flex gap-8">
      <aside className="w-64 flex flex-col gap-2">
        <h2 className="text-xl font-bold mb-4 px-4">Mi Cuenta</h2>

        <button onClick={() => setActiveTab("perfil")} className={`p-4 rounded-xl text-left ${activeTab === "perfil" ? "bg-purple-600" : "bg-white/5"}`}>Perfil</button>
        <button onClick={() => setActiveTab("favoritos")} className={`p-4 rounded-xl text-left ${activeTab === "favoritos" ? "bg-purple-600" : "bg-white/5"}`}>Favoritos</button>
        <button onClick={() => setActiveTab("ventas")} className={`p-4 rounded-xl text-left ${activeTab === "ventas" ? "bg-purple-600" : "bg-white/5"}`}>Mis Ventas</button>

        <button onClick={() => setActiveTab("vender")} className={`p-4 rounded-xl text-left ${activeTab === "vender" ? "bg-yellow-500 text-black font-bold" : "bg-white/5"}`}>
          + Vender Producto
        </button>
      </aside>

      <main className="flex-1 max-w-2xl">
        {activeTab === "perfil" && (
          <div>
            <DatosPersonalesForm user={user} profile={profile} />
            {/* Mostrar resumen de los datos (se actualiza en tiempo real) */}
            <div className="mt-6 p-6 bg-white/5 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-2">Resumen</h3>
              <p><strong>Nombre:</strong> {profile?.fullName || profile?.nombre || user?.displayName || "—"}</p>
              <p><strong>Email:</strong> {profile?.email || user?.email || "—"}</p>
              <p><strong>Teléfono:</strong> {profile?.telefono || "—"}</p>
              <p><strong>Dirección:</strong> {profile?.direccion || "—"}</p>
              <p><strong>Bio:</strong> {profile?.bio || "—"}</p>
            </div>
          </div>
        )}

        {activeTab === "favoritos" && <div className="p-8 bg-white/5 rounded-3xl">Aquí irán tus favoritos...</div>}
        {activeTab === "ventas" && <div className="p-8 bg-white/5 rounded-3xl">Aquí irán tus ventas...</div>}
        {activeTab === "vender" && <AdminProducts />}
      </main>
    </div>
  );
}

export default Profile;
