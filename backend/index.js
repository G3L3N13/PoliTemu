import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import { db } from "./config/firebase.js";
import { verificarFirebaseToken } from "./middlewares/authMiddleware.js";
import productosRoutes from "./routes/productos.js";
import carritoRoutes from "./routes/carrito.js";
import ofertasRoutes from "./routes/ofertas.js";
import perfilRoutes from "./routes/perfil.js";
import usuariosRoutes from "./routes/usuarios.js";

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/* ---------------------------
   Montar Swagger UI en /docs
   --------------------------- */
const swaggerPath = path.join(__dirname, "openapi.yaml");
let swaggerDocument = null;
try {
  swaggerDocument = YAML.load(swaggerPath);
} catch (err) {
  console.warn("No se pudo cargar openapi.yaml");
}
if (swaggerDocument) app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/* ---------------------------
   🔥 ENDPOINT DIRECTO PARA EL HISTORIAL DE UN CHAT ESPECÍFICO
   --------------------------- */
app.get("/api/chats/:chatId/mensajes", async (req, res) => {
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

/* ---------------------------
   🔥 ENDPOINT DIRECTO PARA LA BARRA LATERAL (ChatSidebar)
   Ubicado de forma prioritaria para evitar colisiones en usuarios.js
   --------------------------- */
app.get("/api/usuarios/chats/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    // Buscamos en Firestore todas las salas donde participe este estudiante
    const chatsSnapshot = await db.collection("chats")
      .where("participantes", "array-contains", uid)
      .get();

    if (chatsSnapshot.empty) {
      return res.json([]); // Si no hay nada, devolvemos un array vacío limpio
    }

    const listaChats = chatsSnapshot.docs.map(doc => {
      const datos = doc.data();
      // Identificar el ID de la otra persona con la que se habla
      const otroParticipanteId = datos.participantes?.find(id => id !== uid) || "";

      return {
        id: doc.id,
        otroParticipanteId,
        ultimoMensaje: datos.ultimoMensaje || "Sin mensajes aún",
        ultimaActividad: datos.ultimaActividad || new Date().toISOString(),
        nombresParticipantes: datos.nombresParticipantes || {}
      };
    });

    // Ordenar de mayor a menor actividad (el último chat modificado saldrá primero)
    listaChats.sort((a, b) => new Date(b.ultimaActividad) - new Date(a.ultimaActividad));

    res.json(listaChats);
  } catch (error) {
    console.error("Error crítico en endpoint global de canales de chat:", error);
    res.status(500).json({ error: "Error al procesar canales de chat de la barra lateral" });
  }
});

/* ---------------------------
   🔥 NUEVO: ENDPOINT PARA OBTENER DATOS PÚBLICOS DE UN USUARIO
   Resuelve el problema de 'Missing or insufficient permissions' del frontend
   --------------------------- */
app.get("/api/usuarios/datos/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const userDoc = await db.collection("usuarios").doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    console.error("Error al obtener usuario por API Admin:", error);
    res.status(500).json({ error: "Error interno del servidor al consultar usuario" });
  }
});

/* ---------------------------
   Rutas estables de la API
   --------------------------- */
app.use("/api/productos", productosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/carrito", verificarFirebaseToken, carritoRoutes);
app.use("/api/ofertas", verificarFirebaseToken, ofertasRoutes);
app.use("/api/perfil", verificarFirebaseToken, perfilRoutes);

app.get("/", (req, res) => {
  res.json({ mensaje: "Servidor backend conectado a Firebase 🚀" });
});

/* ---------------------------
   LÓGICA DE WEBSOCKETS (Nombres e Historial Sincronizados)
   --------------------------- */
io.on("connection", (socket) => {
  
  socket.on("join_room", (chatId) => {
    if (!chatId) return;
    socket.join(chatId);
  });

  socket.on("enviar_mensaje", async (data) => {
    if (!data || !data.chatId) return;

    try {
      const chatRef = db.collection("chats").doc(data.chatId);

      // 1. Guardar mensaje en subcolección
      await chatRef.collection("mensajes").add({
        texto: data.texto,
        remitenteId: data.remitenteId,
        timestamp: data.timestamp || new Date().toISOString()
      });

      // 2. Extraer nombres reales de los perfiles para que no diga "Usuario de la EPN"
      const remitenteDoc = await db.collection("usuarios").doc(data.remitenteId).get();
      const destinatarioDoc = await db.collection("usuarios").doc(data.destinatarioId).get();

      const datosRem = remitenteDoc.exists ? remitenteDoc.data() : {};
      const datosDest = destinatarioDoc.exists ? destinatarioDoc.data() : {};

      const nombreRemitente = datosRem.nombre ? `${datosRem.nombre} ${datosRem.apellido || ''}`.trim() : (datosRem.email || "Usuario EPN");
      const nombreDestinatario = datosDest.nombre ? `${datosDest.nombre} ${datosDest.apellido || ''}`.trim() : (datosDest.email || "Usuario EPN");

      // 3. Modificar la cabecera del chat con nombres reales e índices correctos
      await chatRef.set({
        id: data.chatId,
        ultimoMensaje: data.texto,
        ultimaActividad: data.timestamp || new Date().toISOString(),
        participantes: data.chatId.split("_"),
        nombresParticipantes: {
          [data.remitenteId]: nombreRemitente,
          [data.destinatarioId]: nombreDestinatario
        }
      }, { merge: true });

      // 4. Emitir en tiempo real a la sala activa
      io.to(data.chatId).emit("recibir_mensaje", data);

    } catch (error) {
      console.error("❌ Error al persistir el mensaje:", error);
    }
  });

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});