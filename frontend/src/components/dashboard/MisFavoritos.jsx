import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function MisFavoritos({ user }) {
  const [favoritos, setFavoritos] = useState([]);

  useEffect(() => {
    const fetchFavoritos = async () => {
      const snap = await getDoc(doc(db, "usuarios", user.uid));
      if (snap.exists()) setFavoritos(snap.data().favoritos || []);
    };
    fetchFavoritos();
  }, [user]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
      <h2 className="text-2xl font-black text-white mb-6">Mis Favoritos</h2>
      {favoritos.length === 0 ? (
        <p className="text-gray-400">No tienes productos guardados aún.</p>
      ) : (
        <div className="grid gap-4">{/* Aquí mapearías tus productos */}</div>
      )}
    </div>
  );
}