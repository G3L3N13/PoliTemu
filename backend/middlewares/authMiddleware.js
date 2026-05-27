import { authAdmin } from "../config/firebase.js";

export const verificarFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await authAdmin.verifyIdToken(token);
    req.user = decoded; // uid, email, claims
    console.log("Decoded token:", decoded);

    next();
  } catch (error) {
    console.error("Error al verificar token:", error);
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export default verificarFirebaseToken;
