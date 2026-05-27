import { useState } from "react";
import { db } from "../../services/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function DatosPersonalesForm({ user, fullName, setFullName }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleUpdate = async () => {
    if (!fullName.trim()) return setMsg({ type: "error", text: "El nombre no puede estar vacío." });
    
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      await updateDoc(doc(db, "usuarios", user.uid), { fullName });
      setMsg({ type: "success", text: "Perfil actualizado correctamente." });
    } catch (error) {
      setMsg({ type: "error", text: "Error al actualizar el perfil." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl">
      <h2 className="text-2xl font-black text-white mb-6">Datos Personales</h2>
      
      <div className="mb-5">
        <label className="block text-sm text-gray-300 mb-2 font-medium">Nombre completo</label>
        <input 
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition"
          value={fullName} 
          onChange={(e) => setFullName(e.target.value)} 
          placeholder="Tu nombre completo"
        />
      </div>

      <button 
        onClick={handleUpdate} 
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-2xl font-bold transition disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>

      {msg.text && (
        <div className={`mt-5 p-4 rounded-2xl text-sm border ${msg.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          {msg.text}
        </div>
      )}
    </div>
  );
}