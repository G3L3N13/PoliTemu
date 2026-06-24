import express from "express";
import cors from "cors";
import morgan from "morgan";
import { verificarFirebaseToken } from "./middlewares/authMiddleware.js";
import productosRoutes from "./routes/productos.js";
import carritoRoutes from "./routes/carrito.js";
import ofertasRoutes from "./routes/ofertas.js";
import perfilRoutes from "./routes/perfil.js";
import usuariosRoutes from "./routes/usuarios.js";

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/* ---------------------------
   Montar Swagger UI en /docs
   --------------------------- */
// Si openapi.yaml está en la misma carpeta que index.js usa "openapi.yaml"
// Si está en backend/openapi.yaml ajusta: path.join(__dirname, "backend", "openapi.yaml")
const swaggerPath = path.join(__dirname, "openapi.yaml");
let swaggerDocument = null;
try {
  swaggerDocument = YAML.load(swaggerPath);
  console.log("openapi.yaml cargado correctamente desde:", swaggerPath);
} catch (err) {
  console.warn("No se pudo cargar openapi.yaml:", err.message);
}

if (swaggerDocument) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  app.get("/docs", (req, res) => {
    res.status(500).send("Documentación no disponible: openapi.yaml no encontrado o inválido.");
  });
}

/* ---------------------------
   Rutas públicas
   --------------------------- */
app.use("/api/productos", productosRoutes);
app.use("/api/usuarios", usuariosRoutes);

/* ---------------------------
   Rutas protegidas (auth)
   --------------------------- */
app.use("/api/carrito", verificarFirebaseToken, carritoRoutes);
app.use("/api/ofertas", verificarFirebaseToken, ofertasRoutes);
app.use("/api/perfil", verificarFirebaseToken, perfilRoutes);

/* ---------------------------
   Ruta base
   --------------------------- */
app.get("/", (req, res) => {
  res.json({ mensaje: "Servidor backend conectado a Firebase 🚀" });
});

/* ---------------------------
   Manejadores globales de errores
   --------------------------- */
process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection:", reason);
});

/* ---------------------------
   Arranque
   --------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
