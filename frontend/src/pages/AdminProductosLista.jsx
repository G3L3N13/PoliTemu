import { useEffect, useState } from "react";
import { productosService } from "../services/api";

function AdminProductosLista() {
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        try {
            const data = await productosService.getTodos();
            setProductos(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-8">

            <h1 className="text-4xl font-black mb-8">
                📦 Gestión de Productos
            </h1>

            <div className="grid md:grid-cols-4 gap-6">

                {productos.map((p) => (
                    <div
                        key={p._id}
                        className="bg-white/5 rounded-3xl overflow-hidden"
                    >

                        <img
                            src={p.imagenUrl?.split(",")[0]}
                            alt=""
                            className="h-52 w-full object-cover"
                        />

                        <div className="p-4">

                            <h2 className="font-bold">
                                {p.nombre}
                            </h2>

                            <p className="text-yellow-400">
                                ${p.precio}
                            </p>

                            <p className="text-gray-400">
                                Stock: {p.stock}
                            </p>

                            <button
                                className="w-full mt-3 bg-red-500 py-2 rounded-xl"
                            >
                                Eliminar
                            </button>

                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
}

export default AdminProductosLista;