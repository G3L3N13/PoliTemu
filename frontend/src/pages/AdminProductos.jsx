import React, { useState } from "react";
import { PackagePlus, DollarSign, Boxes, ImagePlus, Upload } from "lucide-react";
import { getAuth } from "firebase/auth";
import { productosService } from "../services/api";
import { supabase } from "../services/supabase";

const CATEGORIAS = ["Electrónica","Computadoras","Automotríz",
   "Libros", "Material de Estudio", "Accesorios", "Hogar",
   "Moda","Salud y Hogar","Videojuegos","Deportes","Peliculas", "Otros"];

export default function AdminProductos() {
  const [form, setForm] = useState({ 
    nombre: "", 
    categoria: CATEGORIAS[0], 
    precio: "", 
    stock: "",
    descripcion: "", // 🔥 NUEVO
    condicion: "Nuevo", // 🔥 NUEVO: Nuevo, Como nuevo, Usado
  });
  const [imagenes, setImagenes] = useState([]);
  const [previsualizaciones, setPrevisualizaciones] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

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
    if (!form.nombre || !form.precio || imagenes.length === 0) {
      setMensaje({ texto: "Completa: nombre, precio e imágenes", tipo: "error" });
      return;
    }
    
    setCargando(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setMensaje({ texto: "Debes estar autenticado", tipo: "error" });
        setCargando(false);
        return;
      }

      const token = await user.getIdToken();
      
      // 🔥 AGREGAR DATOS DEL VENDEDOR Y CAMPOS NUEVOS
      const productoData = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        categoria: form.categoria,
        condicion: form.condicion,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock || 0),
        imagenUrl: imagenes.join(", "),
        
        // 🔥 NUEVO: Datos del vendedor
        vendedorId: user.uid,
        vendedorNombre: user.displayName || "Vendedor",
        vendedorEmail: user.email,
        
        // 🔥 NUEVO: Metadata
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
        estado: "activo",
        vistas: 0,
        favoritos: 0
      };

      await productosService.registrar(productoData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      setMensaje({ texto: "¡Producto guardado exitosamente!", tipo: "success" });
      
      // Limpiar formulario
      setForm({ 
        nombre: "", 
        categoria: CATEGORIAS[0], 
        precio: "", 
        stock: "",
        descripcion: "",
        condicion: "Nuevo"
      });
      setImagenes([]);
      setPrevisualizaciones([]);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
      
    } catch (error) {
      console.error("Error al guardar:", error);
      setMensaje({ texto: "Error al guardar el producto", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarImagen = (index) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index));
    setPrevisualizaciones((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-[#020617] border border-white/10 rounded-[35px] p-8 shadow-2xl text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Registrar Producto 📦</h1>
        <p className="text-gray-400">Publica artículos dentro de PoliTemu.</p>
      </div>

      {/* MENSAJE DE FEEDBACK */}
      {mensaje.texto && (
        <div className={`p-4 rounded-2xl mb-6 ${
          mensaje.tipo === "success" 
            ? "bg-green-500/20 text-green-300 border border-green-500/50" 
            : "bg-red-500/20 text-red-300 border border-red-500/50"
        }`}>
          {mensaje.texto}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* NOMBRE */}
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Nombre</label>
          <input 
            type="text" 
            value={form.nombre} 
            onChange={(e) => setForm({...form, nombre: e.target.value})} 
            placeholder="Ej: Laptop Dell"
            className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400 transition text-white" 
          />
        </div>

        {/* CATEGORÍA */}
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Categoría</label>
          <select 
            value={form.categoria} 
            onChange={(e) => setForm({...form, categoria: e.target.value})} 
            className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-400 transition"
          >
            {CATEGORIAS.map(cat => <option key={cat} value={cat} className="bg-[#020617]">{cat}</option>)}
          </select>
        </div>

        {/* PRECIO */}
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Precio ($)</label>
          <input 
            type="number" 
            value={form.precio} 
            onChange={(e) => setForm({...form, precio: e.target.value})} 
            placeholder="0.00"
            className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400 transition text-white" 
          />
        </div>

        {/* STOCK */}
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Stock</label>
          <input 
            type="number" 
            value={form.stock} 
            onChange={(e) => setForm({...form, stock: e.target.value})} 
            placeholder="0"
            className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400 transition text-white" 
          />
        </div>

        {/* CONDICIÓN */}
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Condición</label>
          <select 
            value={form.condicion} 
            onChange={(e) => setForm({...form, condicion: e.target.value})} 
            className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-400 transition"
          >
            <option value="Nuevo">Nuevo</option>
            <option value="Como nuevo">Como nuevo</option>
            <option value="Usado">Usado</option>
          </select>
        </div>
      </div>

      {/* DESCRIPCIÓN */}
      <div className="mt-6">
        <label className="text-sm text-gray-300 mb-2 block">Descripción</label>
        <textarea 
          value={form.descripcion} 
          onChange={(e) => setForm({...form, descripcion: e.target.value})} 
          placeholder="Describe tu producto..."
          className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400 transition text-white resize-none h-24" 
        />
      </div>

      {/* UPLOAD IMÁGENES */}
      <label className="w-full mt-6 border-2 border-dashed border-white/20 rounded-3xl p-6 flex flex-col items-center cursor-pointer hover:border-cyan-400 transition">
        <Upload className="text-cyan-400 mb-2" />
        <span>{subiendo ? "Subiendo..." : "Subir imágenes"}</span>
        <input type="file" multiple onChange={handleArchivosLocales} className="hidden" disabled={subiendo} />
      </label>

      {/* PREVIEW IMÁGENES */}
      {previsualizaciones.length > 0 && (
        <div className="mt-6">
          <p className="text-gray-400 mb-3">{previsualizaciones.length} imagen(s) seleccionada(s)</p>
          <div className="grid grid-cols-3 gap-4">
            {previsualizaciones.map((src, index) => (
              <div key={index} className="relative group">
                <img src={src} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-lg" />
                <button
                  onClick={() => handleEliminarImagen(index)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition text-xs"
                >
                  ✕ Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOTÓN GUARDAR */}
      <button 
        onClick={handleGuardarProducto} 
        disabled={cargando || subiendo}
        className="w-full mt-8 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-black py-4 rounded-2xl font-bold transition"
      >
        {cargando ? "⏳ Guardando..." : subiendo ? "📤 Subiendo imágenes..." : "💾 Guardar Producto"}
      </button>
    </div>
  );
}