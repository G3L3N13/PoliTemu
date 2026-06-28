import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { collection, query, where, onSnapshot, orderBy, addDoc } from "firebase/firestore";

export const useChat = (user) => {
  const [chats, setChats] = useState([]);
  const [chatActivoId, setChatActivoId] = useState(null);
  const [mensajes, setMensajes] = useState([]);

  // 1. Obtener la lista de todos los chats
  useEffect(() => {
    if (!user || !user.uid) return;

    const q = query(
      collection(db, "chats"),
      where("participantes", "array-contains", user.uid)
    );

    // Esta variable 'unsubscribeChats' es única para este bloque
    const unsubscribeChats = onSnapshot(q, (snapshot) => {
      const listaChats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setChats(listaChats);

      if (listaChats.length > 0 && !chatActivoId) {
        setChatActivoId(listaChats[0].id);
      }
    }, (error) => {
      console.error("Error al cargar chats:", error);
    });

    return () => unsubscribeChats();
  }, [user]); 

  // 2. Cargar los mensajes del chat seleccionado
  useEffect(() => {
    if (!chatActivoId) {
      setMensajes([]);
      return;
    }

    const q = query(
      collection(db, `chats/${chatActivoId}/mensajes`),
      orderBy("timestamp", "asc")
    );

    // Esta variable 'unsubscribeMensajes' es única para este bloque
    const unsubscribeMensajes = onSnapshot(q, (snapshot) => {
      setMensajes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error al cargar mensajes:", error);
    });

    return () => unsubscribeMensajes();
  }, [chatActivoId]);

  // 3. Enviar mensaje al chat activo
  const enviarMensaje = async (texto) => {
    if (!chatActivoId || !texto.trim()) return;
    
    const nuevoMensaje = {
      texto: texto.trim(),
      remitenteId: user.uid,
      timestamp: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, `chats/${chatActivoId}/mensajes`), nuevoMensaje);
    } catch (error) {
      console.error("¡ERROR al enviar mensaje! Detalle:", error);
      alert("No se pudo enviar el mensaje. Revisa la consola.");
    }
  };

  return { chats, chatActivoId, setChatActivoId, mensajes, enviarMensaje };
};