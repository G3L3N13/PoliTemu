// src/components/dashboard/DatosPersonalesForm.jsx
import { useState, useEffect } from "react";
import { usuariosService } from "../../services/api";

export default function DatosPersonalesForm({ user, profile }) {
  // Estados locales para controlar los inputs del formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [carrera, setCarrera] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Estados para el feedback del usuario
  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  // CLAVE: Este useEffect se ejecuta CADA VEZ que el perfil cambia o llega desde Firebase
  useEffect(() => {
    if (profile) {
      setNombre(profile.nombre || user?.displayName || "");
      setEmail(profile.email || user?.email || "");
      setTelefono(profile.telefono || "");
      setCarrera(profile.carrera || "");
      setDescripcion(profile.descripcion || "");
    }
  }, [profile, user]);

  // Función para guardar los cambios en Firestore
  const handleGuardar = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    if (!user) return;

    setCargando(true);
    setMensajeExito("");
    setMensajeError("");

    try {
      const token = await user.getIdToken();

      await usuariosService.actualizarPerfil(
        {
          nombre,
          telefono,
          carrera,
          descripcion
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMensajeExito("¡Datos personales actualizados correctamente!");

      // Borrar el mensaje de éxito después de 4 segundos
      setTimeout(() => setMensajeExito(""), 4000);
    } catch (error) {
      console.error("Error al guardar en Firestore:", error);
      setMensajeError("Hubo un error al guardar los cambios. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-lg p-8 rounded-3xl w-full shadow-2xl text-white">
      <h2 className="text-2xl font-black mb-1">Datos Personales</h2>
      <p className="text-gray-400 mb-6 text-sm">Actualiza tu información pública de vendedor en PoliTemu.</p>

      {/* Alertas de Feedback */}
      {mensajeError && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-4 rounded-xl mb-4 text-sm text-center">
          {mensajeError}
        </div>
      )}
      {mensajeExito && (
        <div className="bg-green-500/20 border border-green-500/40 text-green-300 p-4 rounded-xl mb-4 text-sm text-center">
          {mensajeExito}
        </div>
      )}

      <form onSubmit={handleGuardar} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Input Nombre */}
          <div>
            <label className="block text-xs text-purple-300 mb-2 font-medium">Nombre Completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
              required
            />
          </div>

          {/* Input Email (Deshabilitado porque es tu cuenta de acceso) */}
          <div>
            <label className="block text-xs text-gray-400 mb-2 font-medium">Correo Institucional (No modificable)</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm text-gray-400 outline-none cursor-not-allowed"
            />
          </div>

          {/* Input Teléfono */}
          <div>
            <label className="block text-xs text-purple-300 mb-2 font-medium">Número de Teléfono / WhatsApp</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 0987654321"
              className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
            />
          </div>

          {/* Input Carrera */}
          <div>
            <label className="block text-xs text-purple-300 mb-2 font-medium">Facultad / Carrera (EPN)</label>
            <input
              type="text"
              value={carrera}
              onChange={(e) => setCarrera(e.target.value)}
              placeholder="Ej: Ingeniería en Sistemas"
              className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
            />
          </div>
        </div>

        {/* Input Biografía */}
        <div>
          <label className="block text-xs text-purple-300 mb-2 font-medium">Biografía del Vendedor</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Cuéntale a la comunidad qué vendes, tus horarios de entrega en el campus, etc..."
            rows="3"
            className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition resize-none"
          />
        </div>

        {/* Botón Guardar Cambios */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={cargando}
            className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-blue-950 font-black px-8 py-3 rounded-2xl transition shadow-lg shadow-yellow-400/10 active:scale-[0.98]"
          >
            {cargando ? "Guardando cambios..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}