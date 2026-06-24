import express from "express";
import { db } from "../config/firebase.js";
import { verificarFirebaseToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// --- RUTAS DE LECTURA (Públicas) ---
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("productos").get();
    const productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

router.get("/vendedor/mis-productos", verificarFirebaseToken, async (req, res) => {
  try {
    const snapshot = await db.collection("productos").where("vendedorId", "==", req.user.uid).get();
    const productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener mis productos" });
  }
});

// 🔥 IMPORTANTE: Rutas específicas ANTES de las rutas con :id
router.get("/stock/bajo", async (req, res) => {
  try {
    const snapshot = await db.collection("productos").where("stock", "<", 5).where("estado", "==", "activo").get();
    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) { res.status(500).json({ error: "Error" }); }
});

router.get("/buscar/:nombre", async (req, res) => {
  try {
    const snapshot = await db.collection("productos").where("nombre", "==", req.params.nombre).get();
    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) { res.status(500).json({ error: "Error" }); }
});

// --- RUTAS DE ESCRITURA (Protegidas) ---
router.post("/", verificarFirebaseToken, async (req, res) => {
  try {
    const { nombre, precio, stock, categoria, descripcion, condicion, imagenUrl } = req.body;
    
    // Validación básica
    if (!nombre || precio === undefined || stock === undefined) 
      return res.status(400).json({ error: "Datos incompletos" });

    const nuevoProducto = {
      nombre, descripcion, categoria, condicion, precio, stock, imagenUrl,
      vendedorId: req.user.uid,
      vendedorNombre: req.user.name || "Vendedor",
      vendedorEmail: req.user.email,
      creadoEn: new Date(),
      estado: "activo",
      vistas: 0
    };

    const docRef = await db.collection("productos").add(nuevoProducto);
    res.json({ id: docRef.id, ...nuevoProducto });
  } catch (error) { res.status(500).json({ error: "Error al crear" }); }
});

// --- RUTAS DE ACCIÓN POR ID (Específicas primero) ---
router.patch("/:id/stock", verificarFirebaseToken, async (req, res) => {
  const { stock } = req.body;
  const docRef = db.collection("productos").doc(req.params.id);
  const doc = await docRef.get();
  
  if (doc.data().vendedorId !== req.user.uid) return res.status(403).json({ error: "No autorizado" });
  
  await docRef.update({ stock });
  res.json({ id: req.params.id, stock });
});

router.patch("/:id/vendido", verificarFirebaseToken, async (req, res) => {
  const docRef = db.collection("productos").doc(req.params.id);
  const doc = await docRef.get();
  
  if (doc.data().vendedorId !== req.user.uid) return res.status(403).json({ error: "No autorizado" });
  
  await docRef.update({ vendido: true, estado: "vendido" });
  res.json({ id: req.params.id, estado: "vendido" });
});

// --- RUTA GENERAL ID (Debe ir al final) ---
router.get("/:id", async (req, res) => {
  const doc = await db.collection("productos").doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "No encontrado" });
  res.json({ id: doc.id, ...doc.data() });
});

router.put("/:id", verificarFirebaseToken, async (req, res) => {
  const docRef = db.collection("productos").doc(req.params.id);
  const doc = await docRef.get();
  
  if (doc.data().vendedorId !== req.user.uid) return res.status(403).json({ error: "No autorizado" });
  
  await docRef.update(req.body);
  res.json({ id: req.params.id, ...req.body });
});

router.delete("/:id", verificarFirebaseToken, async (req, res) => {
  const docRef = db.collection("productos").doc(req.params.id);
  const doc = await docRef.get();
  
  if (doc.data().vendedorId !== req.user.uid) return res.status(403).json({ error: "No autorizado" });
  
  await docRef.delete();
  res.json({ mensaje: "Eliminado" });
});

export default router;