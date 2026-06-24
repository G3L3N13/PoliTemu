import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Inbox() {
  const { user } = useAuth();
  const [conversaciones, setConversaciones] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats"),
      where("participantes", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConversaciones(lista);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
      <h2 className="text-2xl font-black text-white mb-6">Mensajes</h2>

      {conversaciones.length === 0 ? (
        <p className="text-gray-400">Tus conversaciones aparecerán aquí.</p>
      ) : (
        <ul className="space-y-4">
          {conversaciones.map((c) => (
            <li
              key={c.id}
              onClick={() => navigate(`/chat/${c.id.split("_")[1]}`)}
              className="bg-white/10 rounded-xl p-4 hover:bg-white/20 transition cursor-pointer"
            >
              <p className="text-white font-bold">
                Chat con {c.participantes.filter((p) => p !== user.uid)}
              </p>
              <p className="text-gray-400 text-sm">
                Último mensaje: {c.ultimoMensaje || "Sin mensajes aún"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
