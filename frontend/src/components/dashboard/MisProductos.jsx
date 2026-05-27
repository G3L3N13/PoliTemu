import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function MisProductos({ user }) {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const fetchMisProductos = async () => {
      const q = query(collection(db, "productos"), where("vendedorId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      setProductos(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchMisProductos();
  }, [user]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
      <h2 className="text-2xl font-black text-white mb-6">Mis Productos en Venta</h2>
      {/* Lista de productos aquí */}
    </div>
  );
}