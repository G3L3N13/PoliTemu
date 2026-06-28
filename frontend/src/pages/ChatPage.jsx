import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import ChatSidebar from "../components/chat/ChatSidebar";
import { io } from "socket.io-client";

// --- CONFIGURACIÓN DINÁMICA ---
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
// Si la URL es https://.../api, el socket debe ir a https://...
const SOCKET_URL = API_BASE.replace("/api", ""); 

const socket = io(SOCKET_URL, { autoConnect: false });
// ------------------------------

function ChatPage() {
  const { vendedorId } = useParams();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [vendedor, setVendedor] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  
  const contenedorMensajesRef = useRef(null);

  const generarChatId = (uid1, uid2) => {
    if (!uid1 || !uid2) return null;
    return [uid1, uid2].sort().join("_");
  };

  const chatId = user && vendedorId ? generarChatId(user.uid, vendedorId) : null;

  // Auto-scroll
  useEffect(() => {
    if (contenedorMensajesRef.current) {
      contenedorMensajesRef.current.scrollTop = contenedorMensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  // 1. Conexión WebSocket
  useEffect(() => {
    if (loading) return;
    if (user) {
      socket.connect(); 
    }
    return () => {
      socket.disconnect(); 
    };
  }, [user, loading]);

  // 2. CARGA SEGURA DEL HISTORIAL
  useEffect(() => {
    const cargarHistorialMensajes = async () => {
      if (loading) return;
      if (!user || !chatId) {
        setMensajes([]);
        return;
      }
      
      try {
        setCargando(true);
        const token = await user.getIdToken();
        
        // Usamos API_BASE en lugar de la url hardcoded
        const response = await fetch(`${API_BASE}/chats/${chatId}/mensajes`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const historial = await response.json();
          setMensajes(historial);
        }
      } catch (err) {
        console.error("Error cargando historial:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarHistorialMensajes();
  }, [chatId, loading, user]);

  // 3. Unirse a la sala
  useEffect(() => {
    if (!chatId || loading) return;

    socket.emit("join_room", chatId);

    socket.on("recibir_mensaje", (nuevoMensaje) => {
      if (nuevoMensaje.chatId === chatId) {
        setMensajes((prev) => [...prev, nuevoMensaje]);
      }
    });

    return () => {
      socket.off("recibir_mensaje");
    };
  }, [chatId, loading]);

  // 4. Cargar Vendedor
  useEffect(() => {
    const cargarVendedor = async () => {
      if (loading || !vendedorId) return;
      try {
        const docRef = doc(db, "usuarios", vendedorId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVendedor({ id: docSnap.id, ...docSnap.data() });
        } else {
          setVendedor({ id: vendedorId, fullName: "Usuario EPN" });
        }
      } catch (err) {
        console.error("Error al cargar vendedor:", err);
      }
    };
    cargarVendedor();
  }, [vendedorId, loading]);

  const handleEnviarMensaje = () => {
    if (!mensaje.trim() || !chatId || !user || !vendedorId) return;

    const miNombre = profile?.nombre && profile?.apellido 
      ? `${profile.nombre} ${profile.apellido}` 
      : (user.displayName || "Estudiante EPN");

    const suNombre = vendedor?.nombre && vendedor?.apellido 
      ? `${vendedor.nombre} ${vendedor.apellido}` 
      : (vendedor?.fullName || vendedor?.nombre || "Usuario EPN");

    const payloadMensaje = {
      chatId: chatId,
      texto: mensaje.trim(),
      remitenteId: user.uid,
      destinatarioId: vendedorId,
      nombreRemitente: miNombre,
      nombreDestinatario: suNombre,
      timestamp: new Date().toISOString(),
    };

    socket.emit("enviar_mensaje", payloadMensaje);
    setMensaje(""); 
  };

  return (
    // ... resto de tu JSX se mantiene exactamente igual
    <div className="min-h-screen bg-[#0a0a1a] text-white flex h-screen overflow-hidden">
        {/* Tu código JSX permanece intacto aquí */}
        <ChatSidebar 
        chatActivoId={chatId} 
        onSeleccionarChat={(otroId) => navigate(`/chat/${otroId}`)} 
        />

        <div className="flex-1 flex flex-col h-full bg-black/10">
        {vendedorId ? (
            <>
            <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition text-2xl md:hidden">←</button>
                <div>
                    <p className="text-white font-bold text-base">
                    {vendedor?.nombre ? `${vendedor.nombre} ${vendedor.apellido}` : (vendedor?.fullName || "Cargando...")}
                    </p>
                    <p className="text-green-400 text-xs flex items-center gap-1">● WebSocket Conectado</p>
                </div>
                </div>
            </div>

            <div ref={contenedorMensajesRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                {cargando ? (
                <div className="text-center text-gray-500 py-12 animate-pulse">Cargando conversación segura...</div>
                ) : mensajes.map((m, index) => (
                <div key={m.id || index} className={`flex ${m.remitenteId === user?.uid ? "justify-end" : "justify-start"}`}>
                    <div className={`px-4 py-2.5 rounded-2xl max-w-xs text-sm ${m.remitenteId === user?.uid ? "bg-purple-600 text-white rounded-tr-none" : "bg-white/10 text-white rounded-tl-none"}`}>
                    {m.texto}
                    </div>
                </div>
                ))}
            </div>

            <div className="border-t border-white/10 bg-white/5 px-6 py-4">
                <div className="flex gap-3">
                <input
                    type="text"
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEnviarMensaje()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-purple-500 transition text-sm"
                    placeholder="Escribe un mensaje..."
                />
                <button onClick={handleEnviarMensaje} className="bg-purple-600 text-white px-6 py-3.5 rounded-2xl font-bold transition text-sm">
                    Enviar
                </button>
                </div>
            </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <p className="text-6xl mb-4">📥</p>
                <p className="font-bold text-lg text-white">Bandeja de Entrada</p>
            </div>
        )}
        </div>
    </div>
  );
}

export default ChatPage;