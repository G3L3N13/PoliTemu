import express from "express";
import { db } from "../config/firebase.js";  // asegúrate de importar tu instancia de Firestore

const router = express.Router();

// Listar todos los usuarios
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("usuarios").get();
    const usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(usuarios);
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res.status(500).json({ error: "Error al listar usuarios" });
  }
});

// Obtener usuario por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("usuarios").doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

// Registrar nuevo usuario
router.post("/", async (req, res) => {
  try {
    const nuevoUsuario = req.body;
    const docRef = await db.collection("usuarios").add(nuevoUsuario);
    res.json({ id: docRef.id, ...nuevoUsuario });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// Actualizar usuario por ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;
    await db.collection("usuarios").doc(id).update(datosActualizados);
    res.json({ id, ...datosActualizados });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// Eliminar usuario por ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("usuarios").doc(id).delete();
    res.json({ mensaje: "Usuario eliminado correctamente", id });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

export default router;
