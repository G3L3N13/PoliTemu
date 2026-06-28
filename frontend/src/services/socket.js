import { io } from "socket.io-client";

// Obtenemos la URL desde las variables de entorno
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Si VITE_API_URL incluye "/api", debemos quitarlo para el socket
// porque el socket conecta al servidor base, no a la ruta /api
const socketEndpoint = SOCKET_URL.replace("/api", "");

// ... tu código anterior ...

export const socket = io(socketEndpoint, {
  transports: ["websocket"],
  autoConnect: false, 
  auth: {
    token: localStorage.getItem("token") || "" // Manejo de caso vacío
  }
});

// FUNCIÓN PARA ACTUALIZAR TOKEN (Llámala cuando el usuario se loguee)
export const updateSocketToken = (token) => {
  socket.auth.token = token;
  // Si el socket estaba conectado, es buena práctica reconectar
  if (socket.connected) {
    socket.disconnect();
    socket.connect();
  }
};