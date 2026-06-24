import { useEffect, useState } from "react";
import { productosService } from "../services/api";

function Ofertas() {
    const [productos, setProductos] = useState([]);


    useEffect(() => {
        cargar();
    }, []);

    const cargar = async () => {
        const data = await productosService.getTodos();

        console.log("PRODUCTOS:", data);

        const ofertas = data
            .filter(p =>
                Number(p.descuento) > 0 &&
                Number(p.stock) > 0
            )
            .sort((a, b) =>
                Number(b.descuento) - Number(a.descuento)
            );

        setProductos(ofertas);
    };

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-8">

            <h1 className="text-4xl font-black mb-8">
                🔥 Ofertas Especiales
            </h1>

            <div className="grid md:grid-cols-4 gap-6">

                {productos.map((p) => {

                    const precioBase = Number(p.precio || 0);
                    const descuento = Number(p.descuento || 0);

                    const precioOferta = precioBase * (1 - descuento / 100);

                    return (
                        <div
                            key={p._id}
                            className="relative bg-white/5 rounded-3xl overflow-hidden"
                        >

                            {p.descuento > 0 && (
                                <span className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-xl text-sm font-bold z-10">
                                    -{p.descuento}% OFF
                                </span>
                            )}

                            <img
                                src={p.imagenUrl.split(",")[0]}
                                alt=""
                                className="h-52 w-full object-cover"
                            />

                            <div className="p-4">

                                <h2 className="font-bold">
                                    {p.nombre}
                                </h2>

                                <span className="text-red-400">
                                    -{p.descuento}%
                                </span>

                                {p.descuento > 0 && (
                                    <p className="line-through text-gray-500">
                                        ${precioBase.toFixed(2)}
                                    </p>
                                )}

                                <p className="text-green-400 text-2xl font-bold">
                                    ${precioOferta.toFixed(2)}
                                </p>

                            </div>

                        </div>
                    );
                })}
            </div>

        </div>
    );
}

export default Ofertas;