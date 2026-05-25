import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "usuarios", user.uid));
      if (snap.exists()) {
        setFullName(snap.data().fullName || "");
        setEmail(snap.data().email || "");
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      setProfileMsg({ type: "error", text: "El nombre no puede estar vacío." });
      return;
    }
    setLoadingProfile(true);
    setProfileMsg({ type: "", text: "" });
    try {
      await updateDoc(doc(db, "usuarios", user.uid), { fullName });
      setProfileMsg({ type: "success", text: "Perfil actualizado correctamente." });
    } catch {
      setProfileMsg({ type: "error", text: "Error al actualizar el perfil." });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordMsg({ type: "", text: "" });
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ type: "error", text: "Las contraseñas nuevas no coinciden." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }
    setLoadingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordMsg({ type: "success", text: "Contraseña actualizada correctamente." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      const mensajes = {
        "auth/wrong-password": "La contraseña actual es incorrecta.",
        "auth/weak-password": "La nueva contraseña es muy débil.",
        "auth/invalid-credential": "La contraseña actual es incorrecta.",
      };
      setPasswordMsg({ type: "error", text: mensajes[err.code] || "Error al actualizar la contraseña." });
    } finally {
      setLoadingPassword(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition";
  const labelClass = "block text-sm text-blue-200 mb-1 font-medium";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">
            Mi <span className="text-yellow-400">Perfil</span>
          </h1>
          <p className="text-blue-300 text-sm mt-1">{user?.email}</p>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8 bg-white/10 border border-white/20 rounded-2xl p-6">
          <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-blue-900 font-black text-2xl">
            {fullName ? fullName.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <p className="text-white font-bold text-lg">{fullName || "Sin nombre"}</p>
            <p className="text-blue-300 text-sm">{email}</p>
          </div>
        </div>

        {/* Actualizar datos */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">Datos personales</h2>

          <div className="mb-4">
            <label className={labelClass}>Nombre completo</label>
            <input
              type="text"
              className={inputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre completo"
            />
          </div>
          <div className="mb-4">
            <label className={labelClass}>Correo electrónico</label>
            <input
              type="email"
              className={`${inputClass} opacity-50 cursor-not-allowed`}
              value={email}
              disabled
            />
            <p className="text-blue-400 text-xs mt-1">El correo no se puede modificar.</p>
          </div>

          {profileMsg.text && (
            <p className={`text-xs mb-3 ${profileMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {profileMsg.text}
            </p>
          )}

          <button
            onClick={handleUpdateProfile}
            disabled={loadingProfile}
            className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-blue-900 font-bold px-6 py-2 rounded-xl transition"
          >
            {loadingProfile ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

        {/* Cambiar contraseña */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4">Cambiar contraseña</h2>

          <div className="mb-4">
            <label className={labelClass}>Contraseña actual</label>
            <input
              type="password"
              className={inputClass}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Ingresa tu contraseña actual"
            />
          </div>
          <div className="mb-4">
            <label className={labelClass}>Nueva contraseña</label>
            <input
              type="password"
              className={inputClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="mb-4">
            <label className={labelClass}>Confirmar nueva contraseña</label>
            <input
              type="password"
              className={inputClass}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Repite la nueva contraseña"
            />
          </div>

          {passwordMsg.text && (
            <p className={`text-xs mb-3 ${passwordMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {passwordMsg.text}
            </p>
          )}

          <button
            onClick={handleUpdatePassword}
            disabled={loadingPassword}
            className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-blue-900 font-bold px-6 py-2 rounded-xl transition"
          >
            {loadingPassword ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;