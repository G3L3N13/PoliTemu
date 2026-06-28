import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import { db } from "./config/firebase.js";
import { verificarFirebaseToken } from "./middlewares/authMiddleware.js";

// Importaciones de rutas
import productosRoutes from "./routes/productos.js";
import carritoRoutes from "./routes/carrito.js";
import ofertasRoutes from "./routes/ofertas.js";
import perfilRoutes from "./routes/perfil.js";
import usuariosRoutes from "./routes/usuarios.js";
import chatRoutes from "./routes/chat.js";

const app = express();
const server = http.createServer(app);

// --- CONFIGURACIÓN CORS ---
// 1. Definimos los orígenes permitidos
const allowedOrigins = [
  "http://localhost:5173", 
  "http://127.0.0.1:5173", 
  process.env.FRONTEND_URL // <-- DEBES configurar esto en Render (ej: https://politemu-public.onrender.com)
].filter(Boolean);

// 2. Aplicamos CORS con opciones extendidas
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Incluimos OPTIONS
  allowedHeaders: ["Content-Type", "Authorization"], // CRUCIAL: Autorizar el Header del Token
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(morgan("dev"));

// --- RUTAS ---
app.use("/api/productos", productosRoutes);

// Protegemos rutas sensibles
// Nota: Si usuariosRoutes tiene login/registro, quizás quieras quitar el middleware allí
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/carrito",  carritoRoutes);
app.use("/api/ofertas",ofertasRoutes);
app.use("/api/perfil",  perfilRoutes);
app.use("/api/chats",  chatRoutes);

app.get("/", (req, res) => {
  res.json({ mensaje: "Servidor backend conectado y seguro 🚀" });
});

// --- SOCKETS ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware de autenticación para Sockets (Previene conexiones no autorizadas)
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Conexión no autorizada"));
  }
  next();
});

io.on("connection", (socket) => {
  console.log("Usuario conectado al socket:", socket.id);

  socket.on("join_room", (chatId) => {
    if (!chatId) return;
    socket.join(chatId);
  });

  socket.on("enviar_mensaje", async (data) => {
    if (!data || !data.chatId) return;
    try {
      const chatRef = db.collection("chats").doc(data.chatId);
      await chatRef.collection("mensajes").add({
        texto: data.texto,
        remitenteId: data.remitenteId,
        timestamp: data.timestamp || new Date().toISOString()
      });

      await chatRef.set({
         ultimoMensaje: data.texto,
         ultimaActividad: data.timestamp || new Date().toISOString(),
         participantes: data.chatId.split("_")
      }, { merge: true });

      io.to(data.chatId).emit("recibir_mensaje", data);
    } catch (error) {
      console.error("❌ Error en socket:", error);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Backend activo en puerto ${PORT}`);
});