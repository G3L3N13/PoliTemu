import { useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";

export default function ChatBox({ user }) {
  const { mensajes, enviarMensaje, chats, chatActivoId, setChatActivoId } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    // Esto hace que el chat baje automáticamente al último mensaje
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  // Función auxiliar para formatear la fecha
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const input = e.target.elements.mensaje;
    if (input.value.trim()) {
      await enviarMensaje(input.value);
      input.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Selector de Chats */}
      <div className="p-2 bg-blue-50 border-b">
        <select 
          className="w-full p-2 text-sm border rounded-lg focus:outline-none"
          value={chatActivoId || ""}
          onChange={(e) => setChatActivoId(e.target.value)}
        >
          {chats.map(chat => (
            <option key={chat.id} value={chat.id}>
              Chat con: {chat.nombresParticipantes ? Object.values(chat.nombresParticipantes).find(n => n !== "Tu Nombre") : "Cargando..."}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {mensajes.map((m) => {
          const esMio = m.remitenteId === user.uid;
          return (
            <div key={m.id} className={`flex flex-col ${esMio ? "items-end" : "items-start"}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                esMio ? "bg-blue-600 text-white" : "bg-white border text-gray-800"
              }`}>
                {m.texto}
              </div>
              {/* Aquí mostramos la hora */}
              <span className="text-[10px] text-gray-400 mt-1 px-1">
                {formatTime(m.timestamp)}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
        <input name="mensaje" autoComplete="off" className="flex-1 border rounded-full px-4 py-2 text-sm" placeholder="Mensaje..." />
        <button type="submit" className="bg-blue-600 text-white px-4 rounded-full">➤</button>
      </form>
    </div>
  );
}