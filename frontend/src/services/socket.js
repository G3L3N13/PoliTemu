// frontend/src/services/socket.js
import { io } from "socket.io-client";

// Obtenemos la URL de la API desde las variables de entorno
// Si es local, usará http://localhost:3000
// Si es producción, usará la URL de tu backend en Render
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  // Es buena práctica forzar el transporte a websocket en lugar de polling
  transports: ["websocket"], 
});