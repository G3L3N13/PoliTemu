import express from "express";
import { db } from "../config/firebase.js"; // importa tu instancia de Firestore

const router = express.Router();

// Listar todas las ofertas
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("ofertas").get();
    const ofertas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(ofertas);
  } catch (error) {
    console.error("Error al obtener ofertas:", error);
    res.status(500).json({ error: "Error al obtener ofertas" });
  }
});

// Obtener oferta por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("ofertas").doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: "Oferta no encontrada" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error al obtener oferta:", error);
    res.status(500).json({ error: "Error al obtener oferta" });
  }
});

// Crear nueva oferta
router.post("/", async (req, res) => {
  try {
    const nuevaOferta = req.body;
    const docRef = await db.collection("ofertas").add(nuevaOferta);
    res.json({ id: docRef.id, ...nuevaOferta });
  } catch (error) {
    console.error("Error al crear oferta:", error);
    res.status(500).json({ error: "Error al crear oferta" });
  }
});

// Actualizar oferta por ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;
    await db.collection("ofertas").doc(id).update(datosActualizados);
    res.json({ id, ...datosActualizados });
  } catch (error) {
    console.error("Error al actualizar oferta:", error);
    res.status(500).json({ error: "Error al actualizar oferta" });
  }
});

// Eliminar oferta por ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("ofertas").doc(id).delete();
    res.json({ mensaje: "Oferta eliminada correctamente", id });
  } catch (error) {
    console.error("Error al eliminar oferta:", error);
    res.status(500).json({ error: "Error al eliminar oferta" });
  }
});

export default router;
