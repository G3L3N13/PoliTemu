// src/components/chat/ChatSidebar.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { io } from "socket.io-client";

// Reutilizamos la misma instancia del backend o apuntamos al puerto 3000
const socket = io("http://localhost:3000", { autoConnect: false });

export default function ChatSidebar({ chatActivoId, onSeleccionarChat }) {
  const { user } = useAuth();
  const [conversaciones, setConversaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!user) return;

    // 1. Conectar al WebSocket para escuchar si se actualiza la lista global de canales
    socket.connect();

    // 2. 🔥 CARGA INICIAL: Obtenemos el listado histórico desde tu backend mediante un fetch HTTP normal
    const cargarConversacionesHistoricas = async () => {
      try {
        // Nota: Asegúrate de tener este endpoint creado en backend/routes/usuarios.js o chats.js
        // Si no tienes el endpoint HTTP listo todavía, puedes usar la lógica temporal de abajo.
        const response = await fetch(`http://localhost:3000/api/usuarios/chats/${user.uid}`);
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

    // 3. 🔥 TIEMPO REAL: Escuchar si llega un mensaje que deba mover el chat arriba o actualizar el "ultimoMensaje"
    socket.on("recibir_mensaje", (nuevoMensaje) => {
      setConversaciones((prevConversaciones) => {
        // Mapeamos para actualizar el último texto del chat correspondiente
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
          }).sort((a, b) => new Date(b.ultimaActividad) - new Date(a.ultimaActividad)); // Reordenar arriba
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
            // Identificar el ID de la contraparte de forma segura
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
                    {chat.nombresParticipantes?.[otroParticipanteId] || "Usuario de la EPN"}
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