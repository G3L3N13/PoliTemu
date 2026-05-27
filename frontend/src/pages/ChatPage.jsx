// src/pages/ChatPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

function ChatPage() {
  const { vendedorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendedor, setVendedor] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mensajes, setMensajes] = useState([]);

  useEffect(() => {
    const cargarVendedor = async () => {
      try {
        const docRef = doc(db, "usuarios", vendedorId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVendedor({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Error al cargar vendedor:", err);
      } finally {
        setCargando(false);
      }
    };

    if (vendedorId) cargarVendedor();
  }, [vendedorId]);

  const handleEnviarMensaje = () => {
    if (mensaje.trim()) {
      // TODO: Guardar mensaje en Firestore
      console.log("Mensaje:", mensaje);
      setMensaje("");
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
        <p className="text-gray-400">Cargando chat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition text-2xl"
          >
            ←
          </button>
          <div>
            <p className="text-white font-bold">{vendedor?.fullName || "Vendedor"}</p>
            <p className="text-gray-400 text-sm">En línea</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/seller/${vendedorId}`)}
          className="text-cyan-400 hover:text-cyan-300 transition text-sm font-semibold"
        >
          Ver perfil →
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        <div className="text-center text-gray-400 py-12">
          <p className="text-5xl mb-4">💬</p>
          <p>Inicia una conversación con {vendedor?.fullName || "el vendedor"}</p>
          <p className="text-sm mt-2 text-gray-500">Los mensajes se guardarán próximamente</p>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-white/5 px-6 py-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleEnviarMensaje()}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-cyan-400 transition"
          />
          <button
            onClick={handleEnviarMensaje}
            className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-2xl font-bold transition"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
