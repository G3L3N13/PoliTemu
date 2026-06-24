import { useEffect, useState } from "react";
import { productosService } from "../services/api";

function AdminOfertas() {

  const [productos, setProductos] = useState([]);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {

    const data = await productosService.getTodos();

    const ofertas = data.filter(
      p => Number(p.descuento) > 0
    );

    setProductos(ofertas);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-8">

      <h1 className="text-4xl font-black mb-8">
        🔥 Gestión de Ofertas
      </h1>

      <div className="grid md:grid-cols-4 gap-6">

        {productos.map((p) => (

          <div
            key={p._id}
            className="bg-white/5 rounded-3xl p-4"
          >

            <img
              src={p.imagenUrl?.split(",")[0]}
              className="w-full h-48 object-cover rounded-2xl"
            />

            <h2 className="font-bold mt-4">
              {p.nombre}
            </h2>

            <p className="text-red-400">
              {p.descuento}% OFF
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}

export default AdminOfertas;