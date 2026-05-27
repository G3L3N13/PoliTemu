import React, { useState } from "react";
import { PackagePlus, DollarSign, Boxes, ImagePlus, Upload } from "lucide-react";
import { getAuth } from "firebase/auth";
import { productosService } from "../services/api";
import { supabase } from "../services/supabase";

const CATEGORIAS = ["Electrónica","Computadoras","Automotríz",
   "Libros", "Material de Estudio", "Accesorios", "Hogar",
   "Moda","Salud y Hogar","Videojuegos","Deportes","Peliculas", "Otros"];

export default function AdminProductos() {
  const [form, setForm] = useState({ nombre: "", categoria: CATEGORIAS[0], precio: "", stock: "" });
  const [imagenes, setImagenes] = useState([]);
  const [previsualizaciones, setPrevisualizaciones] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleArchivosLocales = async (e) => {
    setSubiendo(true);
    const files = Array.from(e.target.files);
    const nuevasUrls = [];
    const nuevasPrevs = [];
    for (const file of files) {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;
      const { error } = await supabase.storage.from("imagenes-productos").upload(fileName, file);
      if (!error) {
        const { data } = supabase.storage.from("imagenes-productos").getPublicUrl(fileName);
        nuevasUrls.push(data.publicUrl);
        nuevasPrevs.push(URL.createObjectURL(file));
      }
    }
    setImagenes((prev) => [...prev, ...nuevasUrls]);
    setPrevisualizaciones((prev) => [...prev, ...nuevasPrevs]);
    setSubiendo(false);
  };

  const handleGuardarProducto = async () => {
    if (!form.nombre || !form.precio) return alert("Completa al menos nombre y precio");
    setCargando(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();
      await productosService.registrar({ ...form, imagenUrl: imagenes.join(", "), precio: parseFloat(form.precio), stock: parseInt(form.stock || 0) }, { headers: { Authorization: `Bearer ${token}` } });
      alert("¡Producto guardado!");
      setForm({ nombre: "", categoria: CATEGORIAS[0], precio: "", stock: "" });
      setImagenes([]); setPrevisualizaciones([]);
    } catch (error) { alert("Error al guardar"); } finally { setCargando(false); }
  };

  return (
    <div className="bg-[#020617] border border-white/10 rounded-[35px] p-8 shadow-2xl text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Registrar Producto 📦</h1>
        <p className="text-gray-400">Publica artículos dentro de PoliTemu.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Nombre</label>
          <input type="text" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 outline-none" />
        </div>
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Categoría</label>
          <select value={form.categoria} onChange={(e) => setForm({...form, categoria: e.target.value})} className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-white">
            {CATEGORIAS.map(cat => <option key={cat} value={cat} className="bg-[#020617]">{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Precio</label>
          <input type="number" value={form.precio} onChange={(e) => setForm({...form, precio: e.target.value})} className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4" />
        </div>
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Stock</label>
          <input type="number" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4" />
        </div>
      </div>

      <label className="w-full mt-6 border-2 border-dashed border-white/20 rounded-3xl p-6 flex flex-col items-center cursor-pointer hover:border-cyan-400">
        <Upload className="text-cyan-400 mb-2" />
        <span>Subir imágenes</span>
        <input type="file" multiple onChange={handleArchivosLocales} className="hidden" />
      </label>

      <button onClick={handleGuardarProducto} className="w-full mt-8 bg-cyan-500 text-black py-4 rounded-2xl font-bold">
        {cargando ? "Guardando..." : "💾 Guardar Producto"}
      </button>
    </div>
  );
}

