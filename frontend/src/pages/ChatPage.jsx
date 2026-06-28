import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext"; // ¡Importamos nuestro contexto global!
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import ChatSidebar from "../components/chat/ChatSidebar";

function ChatPage() {
  const { vendedorId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // Extraemos TODO del contexto global
  const { setChatActivoId, mensajes, enviarMensaje, chatActivoId } = useChat();

  const [vendedor, setVendedor] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const contenedorMensajesRef = useRef(null);

  // 1. Generar el ID único del chat y avisarle al Contexto Global
  useEffect(() => {
    if (!user || !vendedorId) return;
    
    // Generamos el ID combinando los UIDs
    const nuevoChatId = [user.uid, vendedorId].sort().join("_");
    
    // Le decimos al proveedor global: "Hey, este es el chat actual"
    setChatActivoId(nuevoChatId);
    
  }, [user, vendedorId, setChatActivoId]);

  // 2. Auto-scroll (Se mantiene igual)
  useEffect(() => {
    if (contenedorMensajesRef.current) {
      contenedorMensajesRef.current.scrollTop = contenedorMensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  // 3. Cargar datos del Vendedor (Se mantiene igual)
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

  // 4. Enviar mensaje usando el Contexto Global
  const handleEnviarMensaje = async () => {
    if (!mensaje.trim() || !chatActivoId || !user) return;
    
    // El contexto se encarga de enviarlo a Firebase automáticamente
    await enviarMensaje(mensaje);
    setMensaje(""); 
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex h-screen overflow-hidden">
        <ChatSidebar 
          chatActivoId={chatActivoId} 
          onSeleccionarChat={(otroId) => navigate(`/chat/${otroId}`)} 
        />

        <div className="flex-1 flex flex-col h-full bg-black/10">
        {vendedorId ? (
            <>
            {/* Cabecera */}
            <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition text-2xl md:hidden">←</button>
                <div>
                    <p className="text-white font-bold text-base">
                    {vendedor?.nombre ? `${vendedor.nombre} ${vendedor.apellido}` : (vendedor?.fullName || "Cargando...")}
                    </p>
                    {/* Cambiamos el texto porque ahora usamos Firebase */}
                    <p className="text-green-400 text-xs flex items-center gap-1">● Chat Sincronizado</p>
                </div>
                </div>
            </div>

            {/* Lista de Mensajes (Ahora lee directamente del Contexto Global) */}
            <div ref={contenedorMensajesRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                {mensajes.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">No hay mensajes aún. ¡Escribe el primero!</div>
                ) : mensajes.map((m, index) => (
                <div key={m.id || index} className={`flex ${m.remitenteId === user?.uid ? "justify-end" : "justify-start"}`}>
                    <div className={`px-4 py-2.5 rounded-2xl max-w-xs text-sm ${m.remitenteId === user?.uid ? "bg-purple-600 text-white rounded-tr-none" : "bg-white/10 text-white rounded-tl-none"}`}>
                    {m.texto}
                    </div>
                </div>
                ))}
            </div>

            {/* Input */}
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