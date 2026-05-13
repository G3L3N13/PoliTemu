// index.js
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de prueba
app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente 🚀");
});

// Ejemplo de ruta de API
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hola desde el backend" });
});

// Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
