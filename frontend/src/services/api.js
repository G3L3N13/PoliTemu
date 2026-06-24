import axios from "axios";
import { auth } from "./firebase";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Agregar automáticamente el token a cada petición
API.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const productosService = {
  getTodos: async () => {
    const respuesta = await API.get("/productos");
    return respuesta.data;
  },

  registrar: async (datosProducto) => {
    const respuesta = await API.post("/productos", datosProducto);
    return respuesta.data;
  },
  misProductos: async () => {
    const response = await API.get("/productos/vendedor/mis-productos");
    return response.data;
  }
};

export const usuariosService = {
  obtenerMiPerfil: async (config = {}) => {
    const respuesta = await API.get("/usuarios/profile/me", config);
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

export const adminService = {

  stats: async () => {
    const response = await API.get(
      "/usuarios/admin/stats"
    );

    return response.data;
  },

  usuarios: async () => {
    const response = await API.get(
      "/usuarios"
    );

    return response.data;
  },

  eliminarUsuario: async (id) => {
    const response = await API.delete(
      `/usuarios/${id}`
    );

    return response.data;
  },

  productos: async () => {
    const response = await API.get(
      "/productos"
    );

    return response.data;
  },

  eliminarProducto: async (id) => {
    const response = await API.delete(
      `/productos/${id}`
    );

    return response.data;
  }
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
    const response = await API.put(
      `/carrito/${productoId}`,
      { cantidad }
    );

    return response.data;
  },

  eliminar: async (productoId) => {
    const response = await API.delete(
      `/carrito/${productoId}`
    );

    return response.data;
  },

  vaciar: async () => {
    const response = await API.delete("/carrito");
    return response.data;
  },
};

