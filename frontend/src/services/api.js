// src/services/api.js
import axios from "axios";
import { auth } from "./firebase";

// 1. Configuración de la URL base
// Asegúrate de tener un archivo .env en la raíz con: VITE_API_URL=http://localhost:3000/api
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const API = axios.create({
  baseURL: API_URL,
});

// 2. Interceptor de Request: Agrega automáticamente el token a cada petición
API.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      // getIdToken() refresca el token automáticamente si está expirado
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Interceptor de Response: Manejo centralizado de errores
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si recibimos un 401, la sesión ha expirado o el usuario no está autorizado
    if (error.response?.status === 401) {
      console.warn("Sesión expirada o falta de autorización.");
      // Opcional: podrías redirigir al usuario al login aquí
    }
    return Promise.reject(error);
  }
);

// --- SERVICIOS ---

export const productosService = {
  getTodos: async () => {
    const respuesta = await API.get("/productos");
    return respuesta.data;
  },

  getMisProductos: async () => {
    const respuesta = await API.get("/productos/vendedor/mis-productos");
    return respuesta.data;
  },

  registrar: async (datosProducto) => {
    const respuesta = await API.post("/productos", datosProducto);
    return respuesta.data;
  },

  actualizar: async (id, datos) => {
    const respuesta = await API.put(`/productos/${id}`, datos);
    return respuesta.data;
  },

  eliminar: async (id) => {
    const respuesta = await API.delete(`/productos/${id}`);
    return respuesta.data;
  },
};

export const usuariosService = {
  obtenerMiPerfil: async () => {
    const respuesta = await API.get("/usuarios/profile/me");
    return respuesta.data;
  },

  actualizarPerfil: async (datos) => {
    const respuesta = await API.put("/usuarios/profile/me", datos);
    return respuesta.data;
  },

  obtenerRol: async () => {
    const respuesta = await API.get("/usuarios/role");
    return respuesta.data;
  },
};

export const carritoService = {
  obtener: async () => {
    const response = await API.get("/carrito");
    return response.data;
  },

  agregar: async (data) => {
    const response = await API.post("/carrito", data);
    return response.data;
  },

  actualizar: async (productoId, cantidad) => {
    const response = await API.put(`/carrito/${productoId}`, { cantidad });
    return response.data;
  },

  eliminar: async (productoId) => {
    const response = await API.delete(`/carrito/${productoId}`);
    return response.data;
  },

  vaciar: async () => {
    const response = await API.delete("/carrito");
    return response.data;
  },
};