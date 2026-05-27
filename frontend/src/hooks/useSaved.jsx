// src/hooks/useSaved.js
import { useState, useEffect } from "react";
import { doc, setDoc, deleteDoc, getDocs, collection, query, orderBy } from "firebase/firestore";
import { db } from "../services/firebase";

export function useSaved(user) {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSaved = async () => {
    if (!user) return setSaved([]);
    setLoading(true);
    try {
      const q = query(collection(db, "usuarios", user.uid, "guardados"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setSaved(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  };

  const addSaved = async (product) => {
    if (!user) throw new Error("No auth");
    const ref = doc(db, "usuarios", user.uid, "guardados", product.id);
    await setDoc(ref, {
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.image || null,
      vendedorId: product.vendedorId,
      createdAt: new Date(),
      snapshot: { price: product.price, activo: product.activo ?? true }
    });
    await fetchSaved();
  };

  const removeSaved = async (productId) => {
    if (!user) throw new Error("No auth");
    const ref = doc(db, "usuarios", user.uid, "guardados", productId);
    await deleteDoc(ref);
    await fetchSaved();
  };

  useEffect(() => { fetchSaved(); }, [user?.uid]);

  return { saved, loading, fetchSaved, addSaved, removeSaved };
}
