import express from "express";
import cors from "cors";
import morgan from "morgan";
import { verificarFirebaseToken } from "./middlewares/authMiddleware.js";
import productosRoutes from "./routes/productos.js";
import carritoRoutes from "./routes/carrito.js";
import ofertasRoutes from "./routes/ofertas.js";
import perfilRoutes from "./routes/perfil.js";
import usuariosRoutes from "./routes/usuarios.js";



const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Rutas protegidas
app.use("/api/productos", productosRoutes);
app.use("/api/carrito", verificarFirebaseToken, carritoRoutes);
app.use("/api/ofertas", verificarFirebaseToken, ofertasRoutes);
app.use("/api/perfil", verificarFirebaseToken, perfilRoutes);
app.use("/api/usuarios", verificarFirebaseToken, usuariosRoutes);
 // Asegúrate de que esta ruta esté protegida también


// Ruta base
app.get("/", (req, res) => {
  res.json({ mensaje: "Servidor backend conectado a Firebase 🚀" });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));

