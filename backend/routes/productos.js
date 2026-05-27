import express from "express";
import { db } from "../config/firebase.js";
import { verificarFirebaseToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("productos").get();
    const productos = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data.nombre || "",
        descripcion: data.descripcion || "",
        precio: data.precio || 0,
        stock: data.stock || 0,
        categoria: data.categoria || "Sin categoría",
        imagenUrl: data.imagenUrl || "",
        vendedorId: data.vendedorId || "",
        vendedorNombre: data.vendedorNombre || "",
        estado: data.estado || "activo",
        fechaCreacion: data.fechaCreacion || "",
        condicion: data.condicion || "nueva"
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

// Obtener productos del usuario autenticado
router.get("/vendedor/mis-productos", verificarFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const snapshot = await db.collection("productos")
      .where("vendedorId", "==", uid)
      .get();

    const productos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos del vendedor:", error);
    res.status(500).json({ error: "Error al obtener productos del vendedor" });
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

// ... resto del código ...

// Crear producto
router.post("/", verificarFirebaseToken, async (req, res) => {
  try {
    const { nombre, precio, stock, categoria, descripcion, condicion, imagenUrl } = req.body;
    const vendedorId = req.user.uid; // 🔥 DEL TOKEN

    if (!nombre || typeof nombre !== "string") {
      return res.status(400).json({ error: "El campo 'nombre' es obligatorio y debe ser texto" });
    }
    if (typeof precio !== "number" || precio <= 0) {
      return res.status(400).json({ error: "El campo 'precio' debe ser un número positivo" });
    }
    if (typeof stock !== "number" || stock < 0) {
      return res.status(400).json({ error: "El campo 'stock' debe ser un número mayor o igual a 0" });
    }

    const nuevoProducto = {
      nombre,
      descripcion: descripcion || "",
      categoria: categoria || "Otros",
      condicion: condicion || "Nuevo",
      precio,
      stock,
      imagenUrl: imagenUrl || "",
      
      // 🔥 DATOS DEL VENDEDOR
      vendedorId,
      vendedorNombre: req.user.name || "Vendedor",
      vendedorEmail: req.user.email,
      
      // 🔥 METADATA
      creadoEn: new Date(),
      actualizadoEn: new Date(),
      estado: "activo",
      vistas: 0,
      favoritos: 0
    };

    const docRef = await db.collection("productos").add(nuevoProducto);

    res.json({ 
      id: docRef.id, 
      ...nuevoProducto 
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
});



// Actualizar producto por ID (solo el vendedor)
router.put("/:id", verificarFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    const datosActualizados = req.body;

    // Verificar que el usuario sea el dueño del producto
    const doc = await db.collection("productos").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const producto = doc.data();
    if (producto.vendedorId !== uid) {
      return res.status(403).json({ error: "No tienes permisos para actualizar este producto" });
    }

    // No permitir cambiar vendedor
    delete datosActualizados.vendedorId;
    delete datosActualizados.vendedorEmail;
    delete datosActualizados.fechaCreacion;

    await db.collection("productos").doc(id).update(datosActualizados);

    res.json({ id, ...datosActualizados });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

// Eliminar producto por ID (solo el vendedor)
router.delete("/:id", verificarFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    // Verificar que el usuario sea el dueño del producto
    const doc = await db.collection("productos").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const producto = doc.data();
    if (producto.vendedorId !== uid) {
      return res.status(403).json({ error: "No tienes permisos para eliminar este producto" });
    }

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
      .where("estado", "==", "activo")
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
      .where("estado", "==", "activo")
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

// Listar productos con stock bajo
router.get("/stock/bajo", async (req, res) => {
  try {
    const snapshot = await db.collection("productos")
      .where("stock", "<", 5)
      .where("estado", "==", "activo")
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
router.patch("/:id/stock", verificarFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    const { stock } = req.body;

    // Verificar que el usuario sea el dueño
    const doc = await db.collection("productos").doc(id).get();
    if (doc.data().vendedorId !== uid) {
      return res.status(403).json({ error: "No tienes permisos para actualizar este producto" });
    }

    await db.collection("productos").doc(id).update({ stock });

    res.json({ id, stock });
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    res.status(500).json({ error: "Error al actualizar stock" });
  }
});

// Actualizar solo el precio de un producto
router.patch("/:id/precio", verificarFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    const { precio } = req.body;

    // Verificar que el usuario sea el dueño
    const doc = await db.collection("productos").doc(id).get();
    if (doc.data().vendedorId !== uid) {
      return res.status(403).json({ error: "No tienes permisos para actualizar este producto" });
    }

    await db.collection("productos").doc(id).update({ precio });

    res.json({ id, precio });
  } catch (error) {
    console.error("Error al actualizar precio:", error);
    res.status(500).json({ error: "Error al actualizar precio" });
  }
});

// Marcar producto como vendido
router.patch("/:id/vendido", verificarFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    // Verificar que el usuario sea el dueño
    const doc = await db.collection("productos").doc(id).get();
    if (doc.data().vendedorId !== uid) {
      return res.status(403).json({ error: "No tienes permisos para actualizar este producto" });
    }

    await db.collection("productos").doc(id).update({ 
      vendido: true,
      estado: "vendido"
    });

    res.json({ id, vendido: true });
  } catch (error) {
    console.error("Error al marcar como vendido:", error);
    res.status(500).json({ error: "Error al marcar como vendido" });
  }
});

export default router;
