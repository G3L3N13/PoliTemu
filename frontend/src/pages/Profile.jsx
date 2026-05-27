import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import DatosPersonalesForm from "../components/dashboard/DatosPersonalesForm.jsx";
import AdminProducts from "./AdminProductos.jsx";

function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("perfil");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "usuarios", user.uid));
      if (snap.exists()) {
        setFullName(snap.data().fullName || "");
      }
    };
    fetchProfile();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-10 flex gap-8">
      {/* Sidebar de Navegación */}
      <aside className="w-64 flex flex-col gap-2">
        <h2 className="text-xl font-bold mb-4 px-4">Mi Cuenta</h2>
        
        <button onClick={() => setActiveTab("perfil")} className={`p-4 rounded-xl text-left ${activeTab === "perfil" ? "bg-purple-600" : "bg-white/5"}`}>Perfil</button>
        <button onClick={() => setActiveTab("favoritos")} className={`p-4 rounded-xl text-left ${activeTab === "favoritos" ? "bg-purple-600" : "bg-white/5"}`}>Favoritos</button>
        <button onClick={() => setActiveTab("ventas")} className={`p-4 rounded-xl text-left ${activeTab === "ventas" ? "bg-purple-600" : "bg-white/5"}`}>Mis Ventas</button>
        
        {/* Atajo para publicar productos */}
        <button onClick={() => setActiveTab("vender")} className={`p-4 rounded-xl text-left ${activeTab === "vender" ? "bg-yellow-500 text-black font-bold" : "bg-white/5"}`}>
          + Vender Producto
        </button>
      </aside>

      {/* Área de Contenido */}
      <main className="flex-1 max-w-2xl">
        {activeTab === "perfil" && (
          <DatosPersonalesForm 
            user={user} 
            fullName={fullName} 
            setFullName={setFullName} 
          />
        )}
        {activeTab === "favoritos" && <div className="p-8 bg-white/5 rounded-3xl">Aquí irán tus favoritos...</div>}
        {activeTab === "ventas" && <div className="p-8 bg-white/5 rounded-3xl">Aquí irán tus ventas...</div>}
        
        {/* Renderizado de AdminProducts */}
        {activeTab === "vender" && <AdminProducts />}
      </main>
    </div>
  );
}

export default Profile;