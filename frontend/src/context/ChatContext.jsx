import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../services/firebase";
import { collection, query, where, onSnapshot, orderBy, addDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext"; // 1. Importamos el hook de autenticación

const ChatContext = createContext();

export const ChatProvider = ({ children }) => { // 2. Ya no recibimos user por props
  const { user } = useAuth(); // 3. Obtenemos el usuario directamente del contexto de Auth
  const [chats, setChats] = useState([]);
  const [chatActivoId, setChatActivoId] = useState(null);
  const [mensajes, setMensajes] = useState([]);

  // 1. Escuchar chats
  useEffect(() => {
    if (!user?.uid) return; // Si no hay usuario, no hacemos nada

    const q = query(
      collection(db, "chats"), 
      where("participantes", "array-contains", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(lista);
      
      // Auto-seleccionar chat si no hay ninguno activo
      if (lista.length > 0 && !chatActivoId) {
        setChatActivoId(lista[0].id);
      }
    });

    return () => unsub();
  }, [user]); // Ahora depende del usuario que viene de AuthContext

  // 2. Escuchar mensajes del chat activo
  useEffect(() => {
    if (!chatActivoId) {
      setMensajes([]);
      return;
    }

    const q = query(
      collection(db, `chats/${chatActivoId}/mensajes`), 
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMensajes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [chatActivoId]);

  // 3. Enviar mensaje
  const enviarMensaje = async (texto) => {
    if (!chatActivoId || !texto.trim() || !user) return;
    
    await addDoc(collection(db, `chats/${chatActivoId}/mensajes`), {
      texto: texto.trim(),
      remitenteId: user.uid, // Usamos el user obtenido del contexto
      timestamp: new Date().toISOString()
    });
  };

  return (
    <ChatContext.Provider value={{ chats, chatActivoId, setChatActivoId, mensajes, enviarMensaje }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);