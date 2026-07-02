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

// Datos públicos de un usuario/vendedor
router.get("/datos/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const doc = await db.collection("usuarios").doc(uid).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error al obtener datos públicos del usuario:", error);
    res.status(500).json({ error: "Error al obtener datos del usuario" });
  }
});

// Endpoint para la barra lateral del chat
router.get("/chats/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const chatsSnapshot = await db.collection("chats")
      .where("participantes", "array-contains", uid)
      .get();

    if (chatsSnapshot.empty) {
      return res.json([]);
    }

    const listaChats = chatsSnapshot.docs.map(doc => {
      const datos = doc.data();
      const otroParticipanteId = datos.participantes?.find(id => id !== uid) || "";

      return {
        id: doc.id,
        otroParticipanteId,
        ultimoMensaje: datos.ultimoMensaje || "Sin mensajes aún",
        ultimaActividad: datos.ultimaActividad || new Date().toISOString(),
        nombresParticipantes: datos.nombresParticipantes || {}
      };
    });

    listaChats.sort((a, b) => new Date(b.ultimaActividad) - new Date(a.ultimaActividad));

    res.json(listaChats);
  } catch (error) {
    console.error("Error en GET /api/usuarios/chats/:uid:", error);
    res.status(500).json({ error: "Error al obtener historial de chats" });
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
      productosPublicados: 0,
      productosPublicado: [],
      favoritosIds: [],
      carrito: [],
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

// GET /api/usuarios/role
router.get("/role", verificarFirebaseToken, async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(400).json({ error: "Usuario no autenticado" });

    const userDoc = await db.collection("usuarios").doc(uid).get();
    if (!userDoc.exists) {
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

/* ========================
   Reseñas (reviews)
   POST /api/usuarios/:uid/reseñas  -> crear reseña (auth required)
   GET  /api/usuarios/:uid/reseñas  -> listar reseñas públicas
   ======================== */

// Crear una reseña para un vendedor
router.post("/:uid/reseñas", verificarFirebaseToken, async (req, res) => {
  try {
    const sellerUid = req.params.uid;
    const { uid: authorUid } = req.user;
    if (!sellerUid) return res.status(400).json({ error: "UID de vendedor requerido" });

    // Evitar que el autor sea el mismo vendedor
    if (sellerUid === authorUid) {
      return res.status(400).json({ error: "No puedes reseñarte a ti mismo" });
    }

    const { rating, comentario } = req.body;
    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: "rating debe ser un número entre 1 y 5" });
    }

    // Opcional: impedir duplicados por authorUid+sellerUid (por ejemplo una sola reseña por comprador)
    const existing = await db.collection("reseñas")
      .where("sellerUid", "==", sellerUid)
      .where("authorUid", "==", authorUid)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ error: "Ya has reseñado a este vendedor" });
    }

    const reviewDoc = {
      sellerUid,
      authorUid,
      rating: ratingNum,
      comentario: comentario || "",
      created_at: new Date().toISOString()
    };

    const ref = await db.collection("reseñas").add(reviewDoc);

    // Recalcular calificación promedio
    const snaps = await db.collection("reseñas").where("sellerUid", "==", sellerUid).get();
    const total = snaps.docs.reduce((acc, d) => acc + (d.data().rating || 0), 0);
    const count = snaps.size || 1;
    const avg = total / count;

    await db.collection("usuarios").doc(sellerUid).update({
      calificacion: avg,
      totalResenas: count
    });

    res.json({ id: ref.id, ...reviewDoc });
  } catch (err) {
    console.error("Error creando reseña:", err);
    res.status(500).json({ error: "Error creando reseña" });
  }
});

// Listar reseñas de un vendedor
router.get("/:uid/reseñas", async (req, res) => {
  try {
    const sellerUid = req.params.uid;
    const snaps = await db.collection("reseñas").where("sellerUid", "==", sellerUid).orderBy("created_at", "desc").get();
    const reviews = snaps.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(reviews);
  } catch (err) {
    console.error("Error listando reseñas:", err);
    res.status(500).json({ error: "Error listando reseñas" });
  }
});

export default router;