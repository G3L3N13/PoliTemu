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
import chatRoutes from "./routes/chat.js"; // <--- Nueva ruta

const app = express();
const server = http.createServer(app);

// Configuración CORS
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));

// Rutas de la API
app.use("/api/productos", productosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/carrito", verificarFirebaseToken, carritoRoutes);
app.use("/api/ofertas", verificarFirebaseToken, ofertasRoutes);
app.use("/api/perfil", verificarFirebaseToken, perfilRoutes);
app.use("/api/chats", chatRoutes); // <--- Rutas de chats montadas aquí

// Endpoint de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "Servidor backend conectado a Firebase 🚀" });
});

// Configuración de Sockets
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
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

      // ... (mantén tu lógica de actualización de cabecera aquí igual)
      await chatRef.set({
         ultimoMensaje: data.texto,
         ultimaActividad: data.timestamp || new Date().toISOString(),
         participantes: data.chatId.split("_")
      }, { merge: true });

      io.to(data.chatId).emit("recibir_mensaje", data);
    } catch (error) {
      console.error("❌ Error al persistir el mensaje:", error);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});