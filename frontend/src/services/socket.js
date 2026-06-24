// frontend/src/services/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000"; // El puerto donde corre tu backend

// Conexión automática desactivada inicialmente para activarla solo cuando el usuario se loguee
export const socket = io(SOCKET_URL, {
  autoConnect: false,
});