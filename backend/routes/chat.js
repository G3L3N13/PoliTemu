import express from "express";
import { db } from "../config/firebase.js";
import { verificarFirebaseToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Obtener mensajes de un chat
router.get("/:chatId/mensajes", verificarFirebaseToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const mensajesSnapshot = await db.collection("chats")
      .doc(chatId)
      .collection("mensajes")
      .orderBy("timestamp", "asc")
      .get();

    const historial = mensajesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(historial);
  } catch (error) {
    console.error("Error al cargar historial:", error);
    res.status(500).json({ error: "Error al cargar historial" });
  }
});

// Obtener chats de un usuario
router.get("/user/:uid", verificarFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.params;
    const chatsSnapshot = await db.collection("chats")
      .where("participantes", "array-contains", uid)
      .get();

    if (chatsSnapshot.empty) {
      return res.json([]);
    }

    const listaChats = chatsSnapshot.docs.map(doc => {
      const datos = doc.data();
      const otroParticipanteId = datos.participantes?.find(id => id !== uid) || "";
      return {
        id: doc.id,
        otroParticipanteId,
        ultimoMensaje: datos.ultimoMensaje || "Sin mensajes aún",
        ultimaActividad: datos.ultimaActividad || new Date().toISOString(),
        nombresParticipantes: datos.nombresParticipantes || {}
      };
    });

    listaChats.sort((a, b) => new Date(b.ultimaActividad) - new Date(a.ultimaActividad));
    res.json(listaChats);
  } catch (error) {
    console.error("Error crítico en endpoint global de canales de chat:", error);
    res.status(500).json({ error: "Error al procesar canales de chat" });
  }
});

export default router;