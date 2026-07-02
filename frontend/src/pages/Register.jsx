// frontend/src/pages/Register.jsx
import { useState } from "react";
import { auth, storage } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate, Link } from "react-router-dom";
import buhoImg from "../assets/Buho_tienda.jpeg";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    ciudad: "",
    direccion: "",
    descripcion: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleRegister = async () => {
    setError("");

    if (!formData.fullName.trim()) { setError("Ingresa tu nombre completo."); return; }
    if (!formData.email.trim()) { setError("Ingresa un correo válido."); return; }
    if (!formData.telefono.trim()) { setError("Ingresa tu número de teléfono."); return; }
    if (!formData.ciudad.trim()) { setError("Ingresa tu ciudad."); return; }
    if (formData.password !== formData.confirmPassword) { setError("Las contraseñas no coinciden."); return; }
    if (formData.password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }

    setLoading(true);
    try {
      // 1) Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      // 2) Preparar nombre/apellidos
      const partesNombre = formData.fullName.trim().split(" ");
      const nombre = partesNombre[0] || "";
      const apellido = partesNombre.slice(1).join(" ") || " ";

      // 3) Subir foto si existe
      let fotoPerfilUrl = "";
      if (file) {
        const path = `profiles/${user.uid}/profile_${Date.now()}`;
        const r = storageRef(storage, path);
        await uploadBytes(r, file);
        fotoPerfilUrl = await getDownloadURL(r);
      }

      // 4) Llamar backend para crear perfil
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/usuarios/profile/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          apellido,
          telefono: formData.telefono,
          ciudad: formData.ciudad,
          direccion: formData.direccion,
          descripcion: formData.descripcion,
          fotoPerfil: fotoPerfilUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al sincronizar perfil con el servidor.");
      }

      navigate("/verify-email");
    } catch (err) {
      console.error("Error en registro:", err);
      const mensajes = {
        "auth/email-already-in-use": "Ese correo ya está registrado.",
        "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
        "auth/invalid-email": "El correo no tiene un formato válido.",
      };
      setError(mensajes[err.code] || err.message || "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1E63] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-6xl bg-white rounded-[40px] overflow-hidden shadow-2xl grid lg:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="relative hidden lg:block">
          <img src={buhoImg} alt="Imagen Buho" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-700/70 to-blue-900/70"></div>
          <div className="absolute bottom-10 left-10 text-white z-10">
            <h2 className="text-5xl font-bold leading-tight">Únete a PoliTemu</h2>
            <p className="mt-5 text-lg text-gray-200 max-w-md">
              Forma parte del marketplace académico de la Escuela Politécnica Nacional.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center p-10 md:p-16 overflow-y-auto max-h-screen">
          <div className="w-full max-w-md">
            <div className="mb-10 text-center">
              <h1 className="text-5xl font-bold text-[#0B1E63]">
                Poli<span className="text-yellow-400">Temu</span>
              </h1>
              <p className="text-gray-500 mt-3">Escuela Politécnica Nacional</p>
            </div>

            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-800">Crear Cuenta</h2>
              <p className="text-gray-500 mt-3">Únete a la comunidad PoliTemu</p>
            </div>

            {error && (
              <div className="bg-red-100 text-red-600 p-4 rounded-2xl mb-6">{error}</div>
            )}

            {/* Perfil foto */}
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">Foto de perfil (opcional)</label>
              {preview ? (
                <img src={preview} alt="preview" className="w-24 h-24 object-cover rounded-full mb-2" />
              ) : null}
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            {/* FORM - NOMBRE */}
            <div className="mb-5">
              <label className="block mb-2 font-medium text-gray-700">Nombre completo</label>
              <input
                type="text"
                name="fullName"
                placeholder="Tu nombre y apellido"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:border-[#6C4CF1] transition"
              />
            </div>

            {/* ... resto del formulario igual que antes ... */}
            {/* (mantén el HTML que ya tenías para email, telefono, ciudad, etc.) */}

            <div className="mb-5">
              <label className="block mb-2 font-medium text-gray-700">Correo electrónico</label>
              <input
                type="email"
                name="email"
                placeholder="tu@epn.edu.ec"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:border-[#6C4CF1] transition"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-medium text-gray-700">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                placeholder="0987654321"
                value={formData.telefono}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:border-[#6C4CF1] transition"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-medium text-gray-700">Ciudad</label>
              <input
                type="text"
                name="ciudad"
                placeholder="Quito"
                value={formData.ciudad}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:border-[#6C4CF1] transition"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-medium text-gray-700">Dirección</label>
              <input
                type="text"
                name="direccion"
                placeholder="Calle y número"
                value={formData.direccion}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:border-[#6C4CF1] transition"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-medium text-gray-700">Sobre ti (opcional)</label>
              <textarea
                name="descripcion"
                placeholder="Cuéntanos un poco sobre ti"
                value={formData.descripcion}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:border-[#6C4CF1] transition resize-none h-20"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                name="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:border-[#6C4CF1] transition"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-medium text-gray-700">Confirmar contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:border-[#6C4CF1] transition"
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-[#6C4CF1] hover:bg-[#5b3fe0] text-white py-4 rounded-2xl font-semibold transition shadow-lg disabled:opacity-50"
            >
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </button>

            <p className="text-center text-gray-500 mt-8">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-[#6C4CF1] font-semibold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Register;