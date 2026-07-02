// GET /api/checkout/session?sessionId=...
// Devuelve la session de Stripe (expand payment_intent) para mostrar en frontend.
// NOTA: Esta ruta sirve solo para mostrar info al usuario; el source of truth es el webhook.
router.get("/session", async (req, res) => {
  try {
    const sessionId = req.query.sessionId || req.query.session_id || req.query.id;
    if (!sessionId) return res.status(400).json({ error: "sessionId query param is required" });

    // Recuperar sesión desde Stripe (expandir payment_intent para más detalles)
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });

    // Opcional: puedes validar que la session.metadata.uid coincida con el usuario autenticado
    // si el frontend envía Authorization. Aquí solo devolvemos la session (para UX).
    return res.json(session);
  } catch (err) {
    console.error("Error retrieving Stripe session:", err && err.message ? err.message : err);
    return res.status(500).json({ error: "Error retrieving session from Stripe" });
  }
});