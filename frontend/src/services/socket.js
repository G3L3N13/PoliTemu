import { io } from "socket.io-client";

// Obtenemos la URL desde las variables de entorno
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Si VITE_API_URL incluye "/api", debemos quitarlo para el socket
// porque el socket conecta al servidor base, no a la ruta /api
const socketEndpoint = SOCKET_URL.replace("/api", "");

export const socket = io(socketEndpoint, {
  transports: ["websocket"], // Forzamos websocket para evitar problemas de polling en Render
  autoConnect: false, // Es mejor conectarlo manualmente cuando el usuario esté listo
  auth: {
    token: localStorage.getItem("token") // Asegúrate de pasar el token aquí
  }
});