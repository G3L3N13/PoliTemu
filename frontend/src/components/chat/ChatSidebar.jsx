import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { io } from "socket.io-client";

// --- CONFIGURACIÓN DINÁMICA ---
const API_BASE = import.meta.env.VITE_API_URL || "https://politemu-servidor.onrender.com/api";
const SOCKET_URL = API_BASE.replace("/api", "");

const socket = io(SOCKET_URL, { autoConnect: false });
// ------------------------------

export default function ChatSidebar({ chatActivoId, onSeleccionarChat }) {
  const { user } = useAuth();
  const [conversaciones, setConversaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!user) return;

    // 1. Conectar al WebSocket
    socket.connect();

    // 2. CARGA INICIAL
    const cargarConversacionesHistoricas = async () => {
      try {
        // Usamos API_BASE en lugar de localhost
        const response = await fetch(`${API_BASE}/usuarios/chats/${user.uid}`);
        if (response.ok) {
          const datos = await response.json();
          setConversaciones(datos);
        }
      } catch (err) {
        console.error("Error al obtener lista de chats por HTTP:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarConversacionesHistoricas();

    // 3. TIEMPO REAL
    socket.on("recibir_mensaje", (nuevoMensaje) => {
      setConversaciones((prevConversaciones) => {
        const existeChat = prevConversaciones.some((c) => c.id === nuevoMensaje.chatId);

        if (existeChat) {
          return prevConversaciones.map((chat) => {
            if (chat.id === nuevoMensaje.chatId) {
              return {
                ...chat,
                ultimoMensaje: nuevoMensaje.texto,
                ultimaActividad: nuevoMensaje.timestamp,
              };
            }
            return chat;
          }).sort((a, b) => new Date(b.ultimaActividad) - new Date(a.ultimaActividad));
        }
        return prevConversaciones;
      });
    });

    return () => {
      socket.off("recibir_mensaje");
      socket.disconnect();
    };
  }, [user]);

  if (cargando) {
    return <div className="w-80 border-r border-white/10 p-4 text-gray-500 text-sm animate-pulse">Cargando conversaciones...</div>;
  }

  return (
    <div className="w-80 border-r border-white/10 h-full flex flex-col bg-white/[0.02]">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          💬 Mensajes
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {conversaciones.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No tienes mensajes pendientes.</p>
        ) : (
          conversaciones.map((chat) => {
            const otroParticipanteId = chat.otroParticipanteId || chat.participantes?.find((id) => id !== user.uid);
            
            return (
              <button
                key={chat.id}
                onClick={() => onSeleccionarChat(otroParticipanteId)}
                className={`w-full p-4 rounded-2xl flex flex-col text-left transition-all ${
                  chatActivoId === chat.id
                    ? "bg-purple-600 text-white"
                    : "bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
              >
                <div className="flex justify-between items-center w-full mb-1">
                  <span className="font-bold text-sm truncate max-w-[150px]">
                    {chat.nombresParticipantes?.[otroParticipanteId] || "Usuario"}
                  </span>
                </div>
                <p className="text-xs truncate opacity-70 w-full">
                  {chat.ultimoMensaje || "Sin mensajes aún"}
                </p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}