import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

// Obtener perfil del usuario autenticado
router.get("/", async (req, res) => {
  try {
    console.log("UID recibido:", req.user.uid);

    const perfilRef = db.collection("usuarios").doc(req.user.uid);
    const doc = await perfilRef.get();

    if (!doc.exists) {
      // Buscar por email si no existe el documento con UID
      const snapshot = await db.collection("usuarios")
        .where("email", "==", req.user.email)
        .get();

      if (!snapshot.empty) {
        const perfil = snapshot.docs[0];
        return res.json({ id: perfil.id, ...perfil.data() });
      }

      // Si tampoco existe por email, crear perfil automáticamente
      await perfilRef.set({
        email: req.user.email,
        rol: "cliente",
        creadoEn: new Date().toISOString()
      });

      return res.json({
        id: perfilRef.id,
        email: req.user.email,
        rol: "cliente",
        creadoEn: new Date().toISOString()
      });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
});

// Actualizar perfil del usuario autenticado
router.put("/", async (req, res) => {
  try {
    const perfilRef = db.collection("usuarios").doc(req.user.uid);
    await perfilRef.set(req.body, { merge: true });

    res.json({ mensaje: "Perfil actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
});

// Eliminar perfil del usuario autenticado
router.delete("/", async (req, res) => {
  try {
    const perfilRef = db.collection("usuarios").doc(req.user.uid);
    await perfilRef.delete();

    res.json({ mensaje: "Perfil eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar perfil:", error);
    res.status(500).json({ error: "Error al eliminar perfil" });
  }
});

export default router;
