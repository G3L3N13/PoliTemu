import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api"
});

export const productosService = {
  getTodos: async (config = {}) => {
    const respuesta = await API.get("/productos", config);
    return respuesta.data;
  },
  // 🔥 NUEVA FUNCIÓN: Envía el JSON con la URL de Supabase al Backend
  registrar: async (datosProducto, config = {}) => {
    const respuesta = await API.post("/productos", datosProducto, config);
    return respuesta.data;
  }
};