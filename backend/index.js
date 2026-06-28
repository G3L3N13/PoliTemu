import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import path from "path"; // Importante para manejar rutas de archivos
import { fileURLToPath } from "url"; // Importante para __dirname en ES Modules
import { db } from "./config/firebase.js";
import { verificarFirebaseToken } from "./middlewares/authMiddleware.js";

// Importaciones de rutas
import productosRoutes from "./routes/productos.js";
import carritoRoutes from "./routes/carrito.js";
import ofertasRoutes from "./routes/ofertas.js";
import perfilRoutes from "./routes/perfil.js";
import usuariosRoutes from "./routes/usuarios.js";
import chatRoutes from "./routes/chat.js";

// Configuración de __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// --- CONFIGURACIÓN CORS ---
const allowedOrigins = [
  "http://localhost:5173", 
  "http://127.0.0.1:5173", 
  process.env.FRONTEND_URL 
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(morgan("dev"));

// --- RUTAS API (Deben ir antes de la configuración de static) ---
app.use("/api/productos", productosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/carrito", verificarFirebaseToken, carritoRoutes);
app.use("/api/ofertas", verificarFirebaseToken, ofertasRoutes);
app.use("/api/perfil", verificarFirebaseToken, perfilRoutes);
app.use("/api/chats", verificarFirebaseToken, chatRoutes);

// --- SERVIR FRONTEND ---
// 1. Servir archivos estáticos desde la carpeta 'dist' (la carpeta que genera npm run build)
// Ajusta la ruta para que salga de 'backend' y entre en 'frontend/dist'
// Si tu carpeta de frontend se llama distinto, cámbialo en 'frontend'
const distPath = path.join(__dirname, "../frontend/dist"); 

console.log("Intentando servir archivos desde:", distPath);

app.use(express.static(distPath));

// La ruta comodín sigue igual, pero usando la misma variable
app.get(/.*/, (req, res) => {
  console.log("⚠️ Petición recibida en catch-all:", req.path);
  res.sendFile(path.join(distPath, "index.html"));
});
// --- SOCKETS ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Conexión no autorizada"));
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