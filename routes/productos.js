import express from "express";
import { db } from "../config/firebase.js"; // Firestore de Admin SDK

const router = express.Router();

// Obtener productos
// Obtener productos
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("productos").get();
    const productos = snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        id: doc.id,
        nombre: data.nombre || "",
        precio: data.precio || 0,
        stock: data.stock || 0,
        categoria: data.categoria || "Sin categoría"
      };
    });

    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});



// Obtener producto por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("productos").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error al obtener producto por ID:", error);
    res.status(500).json({ error: "Error al obtener producto por ID" });
  }
});

// Buscar productos por nombre
router.get("/buscar/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params;
    const snapshot = await db.collection("productos")
      .where("nombre", "==", nombre)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "No se encontraron productos con ese nombre" });
    }

    const productos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(productos);
  } catch (error) {
    console.error("Error al buscar producto por nombre:", error);
    res.status(500).json({ error: "Error al buscar producto por nombre" });
  }
});



// Crear producto
router.post("/", async (req, res) => {
  try {
    const { nombre, precio, stock, categoria } = req.body;

    if (!nombre || typeof nombre !== "string") {
      return res.status(400).json({ error: "El campo 'nombre' es obligatorio y debe ser texto" });
    }
    if (typeof precio !== "number" || precio <= 0) {
      return res.status(400).json({ error: "El campo 'precio' debe ser un número positivo" });
    }
    if (typeof stock !== "number" || stock < 0) {
      return res.status(400).json({ error: "El campo 'stock' debe ser un número mayor o igual a 0" });
    }

    const nuevoProducto = { nombre, precio, stock, categoria };
    const docRef = await db.collection("productos").add(nuevoProducto);

    res.json({ id: docRef.id, ...nuevoProducto });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// Actualizar producto por ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    await db.collection("productos").doc(id).update(datosActualizados);

    res.json({ id, ...datosActualizados });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});


// Eliminar producto por ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("productos").doc(id).delete();

    res.json({ mensaje: "Producto eliminado correctamente", id });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});


// Buscar productos por categoría
router.get("/categoria/:categoria", async (req, res) => {
  try {
    const { categoria } = req.params;
    const snapshot = await db.collection("productos")
      .where("categoria", "==", categoria)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "No se encontraron productos en esa categoría" });
    }

    const productos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(productos);
  } catch (error) {
    console.error("Error al buscar productos por categoría:", error);
    res.status(500).json({ error: "Error al buscar productos por categoría" });
  }
});


// Filtrar productos por rango de precio
router.get("/precio/min/:min/max/:max", async (req, res) => {
  try {
    const { min, max } = req.params;
    const snapshot = await db.collection("productos")
      .where("precio", ">=", parseFloat(min))
      .where("precio", "<=", parseFloat(max))
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "No se encontraron productos en ese rango de precio" });
    }

    const productos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(productos);
  } catch (error) {
    console.error("Error al filtrar productos por precio:", error);
    res.status(500).json({ error: "Error al filtrar productos por precio" });
  }
});

// Listar productos con stock bajo (ejemplo: menos de 5 unidades)
router.get("/stock/bajo", async (req, res) => {
  try {
    const snapshot = await db.collection("productos")
      .where("stock", "<", 5)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "No hay productos con stock bajo" });
    }

    const productos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(productos);
  } catch (error) {
    console.error("Error al listar productos con stock bajo:", error);
    res.status(500).json({ error: "Error al listar productos con stock bajo" });
  }
});

// Actualizar solo el stock de un producto
router.patch("/:id/stock", async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    await db.collection("productos").doc(id).update({ stock });

    res.json({ id, stock });
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    res.status(500).json({ error: "Error al actualizar stock" });
  }
});

// Actualizar solo el precio de un producto
router.patch("/:id/precio", async (req, res) => {
  try {
    const { id } = req.params;
    const { precio } = req.body;

    await db.collection("productos").doc(id).update({ precio });

    res.json({ id, precio });
  } catch (error) {
    console.error("Error al actualizar precio:", error);
    res.status(500).json({ error: "Error al actualizar precio" });
  }
});



export default router;
