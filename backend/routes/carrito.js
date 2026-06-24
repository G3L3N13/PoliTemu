import express from "express";
import { db } from "../config/firebase.js"; // Firestore de Admin SDK

const router = express.Router();

// Obtener carrito del usuario
router.get("/", async (req, res) => {
  try {
    const carritoRef = db.collection("carritos").doc(req.user.uid);
    const snapshot = await carritoRef.get();

    if (!snapshot.exists) {
      return res.json({ productos: [] });
    }

    res.json(snapshot.data());
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    res.status(500).json({ error: "Error al obtener carrito" });
  }
});

// Agregar producto al carrito
router.post("/", async (req, res) => {
  try {
    const { productoId, cantidad } = req.body;

    const carritoRef = db.collection("carritos").doc(req.user.uid);

    const doc = await carritoRef.get();

    let productos = [];

    if (doc.exists) {
      productos = doc.data().productos || [];
    }

    const index = productos.findIndex(
      (p) => p.productoId === productoId
    );

    if (index >= 0) {
      productos[index].cantidad += cantidad;
    } else {
      productos.push({
        productoId,
        cantidad,
      });
    }

    await carritoRef.set({
      productos,
    });

    res.json({
      mensaje: "Producto agregado",
      productos,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al agregar producto",
    });
  }
});
// Actualizar cantidad de un producto en el carrito
router.put("/:productoId", async (req, res) => {
  try {
    const { productoId } = req.params;
    const { cantidad } = req.body;

    const carritoRef = db.collection("carritos").doc(req.user.uid);
    const doc = await carritoRef.get();

    if (!doc.exists) return res.status(404).json({ error: "Carrito no encontrado" });

    const productos = doc.data().productos.map(p =>
      p.productoId === productoId ? { ...p, cantidad } : p
    );

    await carritoRef.update({ productos });

    res.json({ mensaje: "Cantidad actualizada", productos });
  } catch (error) {
    console.error("Error al actualizar producto en carrito:", error);
    res.status(500).json({ error: "Error al actualizar producto en carrito" });
  }
});

// Eliminar un producto del carrito
router.delete("/:productoId", async (req, res) => {
  try {
    const { productoId } = req.params;

    const carritoRef = db.collection("carritos").doc(req.user.uid);
    const doc = await carritoRef.get();

    if (!doc.exists) return res.status(404).json({ error: "Carrito no encontrado" });

    const productos = doc.data().productos.filter(p => p.productoId !== productoId);

    await carritoRef.update({ productos });

    res.json({ mensaje: "Producto eliminado del carrito", productos });
  } catch (error) {
    console.error("Error al eliminar producto del carrito:", error);
    res.status(500).json({ error: "Error al eliminar producto del carrito" });
  }
});

// Vaciar todo el carrito
router.delete("/", async (req, res) => {
  try {
    const carritoRef = db.collection("carritos").doc(req.user.uid);
    await carritoRef.set({ productos: [] });

    res.json({ mensaje: "Carrito vaciado" });
  } catch (error) {
    console.error("Error al vaciar carrito:", error);
    res.status(500).json({ error: "Error al vaciar carrito" });
  }
});


export default router;
