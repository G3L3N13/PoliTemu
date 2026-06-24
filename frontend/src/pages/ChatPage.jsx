import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import ChatSidebar from "../components/chat/ChatSidebar";
import { io } from "socket.io-client"; 

// Inicializamos el socket apuntando al backend
const socket = io("http://localhost:3000", { autoConnect: false });

function ChatPage() {
  const { vendedorId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [vendedor, setVendedor] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  
  const contenedorMensajesRef = useRef(null);

  // Generación limpia del ID de la sala de chat
  const generarChatId = (uid1, uid2) => {
    if (!uid1 || !uid2) return null;
    return [uid1, uid2].sort().join("_");
  };

  const chatId = user && vendedorId ? generarChatId(user.uid, vendedorId) : null;

  // Auto-scroll al recibir un nuevo mensaje o cambiar de chat
  useEffect(() => {
    if (contenedorMensajesRef.current) {
      contenedorMensajesRef.current.scrollTop = contenedorMensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  // 1. 🔥 CONEXIÓN GLOBAL DEL WEBSOCKET
  useEffect(() => {
    if (user) {
      socket.connect(); 
      console.log("🔌 Intentando conectar al servidor de WebSockets...");
    }

    return () => {
      socket.disconnect(); 
    };
  }, [user]);

  // 2. 🔥 CARGAR HISTORIAL DE MENSAJES DESDE EL BACKEND (Soluciona el problema de perder mensajes al recargar)
  useEffect(() => {
    const cargarHistorialMensajes = async () => {
      if (!chatId) {
        setMensajes([]);
        return;
      }
      
      try {
        setCargando(true);
        const response = await fetch(`http://localhost:3000/api/chats/${chatId}/mensajes`);
        
        if (response.ok) {
          const historial = await response.json();
          setMensajes(historial); // Setea todos los mensajes guardados en Firestore
        }
      } catch (err) {
        console.error("Error cargando historial de mensajes por HTTP:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarHistorialMensajes();
  }, [chatId]);

  // 3. 🔥 UNIRSE A LA SALA Y ESCUCHAR NUEVOS MENSAJES EN VIVO
  useEffect(() => {
    if (!chatId) return;

    // Enviamos el evento al backend para meternos en la sala privada
    socket.emit("join_room", chatId);

    // Escuchar el canal de retransmisión del backend
    socket.on("recibir_mensaje", (nuevoMensaje) => {
      if (nuevoMensaje.chatId === chatId) {
        // Añade el mensaje nuevo al final del historial existente
        setMensajes((prev) => [...prev, nuevoMensaje]);
      }
    });

    return () => {
      socket.off("recibir_mensaje");
    };
  }, [chatId]);

  // 4. Cargar información del vendedor (Contraparte)
  useEffect(() => {
    const cargarVendedor = async () => {
      if (!vendedorId) {
        setVendedor(null);
        return;
      }
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
  }, [vendedorId]);

  // 5. 🔥 ENVIAR MENSAJE A TRAVÉS DEL SOCKET (Envia la estructura limpia)
  const handleEnviarMensaje = () => {
    if (!mensaje.trim() || !chatId || !user || !vendedorId) return;

    // Estructuramos los nombres dinámicamente para que el backend los guarde en la raíz del chat
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

    // Emitir por WebSocket directo al Servidor Express
    socket.emit("enviar_mensaje", payloadMensaje);

    setMensaje(""); 
  };

  const handleSeleccionarChatDesdeSidebar = (otroId) => {
    navigate(`/chat/${otroId}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex h-screen overflow-hidden">
      
      {/* 🧭 BARRA LATERAL GLOBAL DE CONVERSACIONES */}
      <ChatSidebar 
        chatActivoId={chatId} 
        onSeleccionarChat={handleSeleccionarChatDesdeSidebar} 
      />

      {/* 💬 AREA DEL CHAT SELECCIONADO */}
      <div className="flex-1 flex flex-col h-full bg-black/10">
        {vendedorId ? (
          <>
            {/* Header del Chat */}
            <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="text-gray-400 hover:text-white transition text-2xl md:hidden"
                >
                  ←
                </button>
                <div>
                  <p className="text-white font-bold text-base">
                    {vendedor?.nombre && vendedor?.apellido ? `${vendedor.nombre} ${vendedor.apellido}` : (vendedor?.fullName || "Cargando...")}
                  </p>
                  <p className="text-green-400 text-xs flex items-center gap-1">● Canal WebSocket Conectado</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/seller/${vendedorId}`)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-cyan-400 transition text-xs font-bold"
              >
                Ver catálogo
              </button>
            </div>

            {/* Ventana de Mensajes */}
            <div 
              ref={contenedorMensajesRef}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
            >
              {cargando ? (
                <div className="text-center text-gray-500 py-12 animate-pulse">Sincronizando historial seguro...</div>
              ) : mensajes.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-5xl mb-4">⚡</p>
                  <p className="font-semibold text-sm">¡Conexión WebSocket establecida!</p>
                  <p className="text-xs text-gray-500 mt-1">Escribe un mensaje para iniciar la conversación en tiempo real.</p>
                </div>
              ) : (
                mensajes.map((m, index) => (
                  <div
                    key={m.id || index}
                    className={`flex ${m.remitenteId === user.uid ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl max-w-xs text-sm shadow-md transition-all ${
                        m.remitenteId === user.uid 
                          ? "bg-purple-600 text-white rounded-tr-none" 
                          : "bg-white/10 text-white rounded-tl-none"
                      }`}
                    >
                      {m.texto}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Bar */}
            <div className="border-t border-white/10 bg-white/5 px-6 py-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEnviarMensaje()}
                  placeholder="Escribe un mensaje por WebSockets..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 outline-none focus:border-purple-500 transition text-sm"
                />
                <button
                  onClick={handleEnviarMensaje}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3.5 rounded-2xl font-bold transition text-sm shadow-md shadow-purple-600/10"
                >
                  Enviar
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Vista por defecto cuando entras limpio a /chat */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6">
            <p className="text-6xl mb-4">📥</p>
            <p className="font-bold text-lg text-white">Tu Bandeja de Entrada WebSocket</p>
            <p className="text-sm text-gray-500 max-w-xs text-center mt-1">
              Selecciona una conversación desde la barra lateral izquierda para sincronizar tus mensajes en tiempo real.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;