import express from "express";
import { db } from "../config/firebase.js";
import { verificarFirebaseToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Obtener todos los usuarios
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

// Obtener perfil del usuario autenticado
router.get("/profile/me", verificarFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const doc = await db.collection("usuarios").doc(uid).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "Perfil de usuario no encontrado" });
    }
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error al obtener perfil del usuario:", error);
    res.status(500).json({ error: "Error al obtener perfil del usuario" });
  }
});

// Crear o actualizar perfil de usuario (al registrarse o completar datos)
router.post("/profile/create", verificarFirebaseToken, async (req, res) => {
  try {
    const { uid, email } = req.user;
    const {
      nombre,
      apellido,
      telefono,
      ciudad,
      direccion,
      carrera,
      fotoPerfil,
      descripcion,
      rut
    } = req.body;

    // Validar campos obligatorios
    if (!nombre || !apellido || !telefono) {
      return res.status(400).json({ error: "Nombre, apellido y teléfono son obligatorios" });
    }

    const usuarioData = {
      uid,
      email,
      nombre,
      apellido,
      telefono,
      ciudad: ciudad || "",
      direccion: direccion || "",
      carrera: carrera || "No especificada",
      fotoPerfil: fotoPerfil || "",
      descripcion: descripcion || "",
      rut: rut || "",
      calificacion: 0,
      totalVentas: 0,
      totalCompras: 0,
      productosPuhlicados: 0,
      fechaRegistro: new Date().toISOString(),
      verificado: false,
      estado: "activo"
    };

    await db.collection("usuarios").doc(uid).set(usuarioData, { merge: true });
    
    res.json({ 
      mensaje: "Perfil creado/actualizado exitosamente",
      usuario: usuarioData 
    });
  } catch (error) {
    console.error("Error al crear/actualizar perfil:", error);
    res.status(500).json({ error: "Error al crear/actualizar perfil" });
  }
});

// Actualizar perfil del usuario autenticado
router.put("/profile/me", verificarFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const datosActualizados = req.body;
    
    // No permitir cambiar ciertos campos
    delete datosActualizados.uid;
    delete datosActualizados.email;
    delete datosActualizados.calificacion;
    delete datosActualizados.totalVentas;
    delete datosActualizados.totalCompras;
    delete datosActualizados.fechaRegistro;
    
    await db.collection("usuarios").doc(uid).update(datosActualizados);
    
    res.json({ 
      mensaje: "Perfil actualizado exitosamente",
      usuarioActualizado: datosActualizados 
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
});

// Registrar nuevo usuario manualmente
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

// Incrementar contador de ventas
router.patch("/:id/ventas", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("usuarios").doc(id).get();
    const totalVentas = (doc.data()?.totalVentas || 0) + 1;
    
    await db.collection("usuarios").doc(id).update({ totalVentas });
    res.json({ id, totalVentas });
  } catch (error) {
    console.error("Error al incrementar ventas:", error);
    res.status(500).json({ error: "Error al incrementar ventas" });
  }
});

// Incrementar contador de compras
router.patch("/:id/compras", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("usuarios").doc(id).get();
    const totalCompras = (doc.data()?.totalCompras || 0) + 1;
    
    await db.collection("usuarios").doc(id).update({ totalCompras });
    res.json({ id, totalCompras });
  } catch (error) {
    console.error("Error al incrementar compras:", error);
    res.status(500).json({ error: "Error al incrementar compras" });
  }
});

///////
// GET /api/user/role
router.get("/role", verificarFirebaseToken, async (req, res) => {
  try {
    // req.user viene del middleware (uid, email, name, etc.)
    const uid = req.user?.uid;
    if (!uid) return res.status(400).json({ error: "Usuario no autenticado" });

    // Opción A: si guardas rol en colección users
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      // Si no existe, asumimos no admin
      return res.json({ isAdmin: false });
    }
    const userData = userDoc.data();
    const isAdmin = Boolean(userData?.role === "admin" || userData?.isAdmin);

    return res.json({ isAdmin });
  } catch (err) {
    console.error("GET /api/user/role error:", err);
    return res.status(500).json({ error: "Error al obtener rol" });
  }
});


export default router;
