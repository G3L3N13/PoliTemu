import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { carritoService, productosService } from "../services/api";
import CheckoutButton from "../components/CheckoutButton";

function Carrito() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [cargando, setCargando] = useState(true);

    const cargarCarrito = async () => {
        try {
            setCargando(true);

            const carrito = await carritoService.obtener();

            const productosCarrito = carrito.productos || [];

            const todosProductos = await productosService.getTodos();

            const detalleProductos = productosCarrito
                .map((item) => {
                    const producto = todosProductos.find(
                        (p) =>
                            (p._id || p.id) === item.productoId
                    );

                    if (!producto) return null;

                    return {
                        ...producto,
                        cantidad: item.cantidad,
                    };
                })
                .filter(Boolean);

            setItems(detalleProductos);
        } catch (error) {
            console.error("Error cargando carrito:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarCarrito();
    }, []);

    const eliminarProducto = async (productoId) => {
        try {
            await carritoService.eliminar(productoId);

            cargarCarrito();
        } catch (error) {
            console.error(error);
        }
    };

    const vaciarCarrito = async () => {
        try {
            await carritoService.vaciar();

            setItems([]);
        } catch (error) {
            console.error(error);
        }
    };

    const total = items.reduce(
        (acc, item) =>
            acc + item.precio * item.cantidad,
        0
    );

    // Preparar items en el formato que el endpoint /checkout/create-session espera
    const stripeItems = items.map((item) => ({
        id: item._id || item.id || "",
        nombre: item.nombre || item.title || `Producto ${item._id || item.id || ""}`,
        precio: Number(item.precio) || 0,
        cantidad: Number(item.cantidad) || 1
    }));

    if (cargando) {
        return (
            <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
                <p>Cargando carrito...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-10">
            <h1 className="text-4xl font-black mb-8">
                🛒 Mi Carrito
            </h1>

            {items.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-6xl mb-4">🛒</p>
                    <p className="text-gray-400">
                        Tu carrito está vacío
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div
                                key={item._id || item.id}
                                className="bg-white/5 border border-white/10 rounded-2xl p-5 flex gap-5"
                            >
                                <img
                                    src={
                                        Array.isArray(item.imagenUrl)
                                            ? item.imagenUrl[0]
                                            : item.imagenUrl?.split(",")[0]
                                    }
                                    alt={item.nombre}
                                    className="w-24 h-24 object-cover rounded-xl"
                                />

                                <div className="flex-1">
                                    <h3 className="text-xl font-bold">
                                        {item.nombre}
                                    </h3>

                                    <p className="text-yellow-400 font-bold">
                                        $
                                        {Number(item.precio).toFixed(2)}
                                    </p>

                                    <p className="text-gray-400">
                                        Cantidad: {item.cantidad}
                                    </p>

                                    <p className="text-green-400">
                                        Subtotal: $
                                        {(
                                            item.precio *
                                            item.cantidad
                                        ).toFixed(2)}
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        eliminarProducto(
                                            item._id || item.id
                                        )
                                    }
                                    className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl h-fit"
                                >
                                    Eliminar
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-3xl font-black text-yellow-400">
                            Total: ${total.toFixed(2)}
                        </h2>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={vaciarCarrito}
                                className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-xl"
                            >
                                Vaciar carrito
                            </button>

                            {/* Aquí reemplazamos el botón "Finalizar compra" por el CheckoutButton */}
                            <div>
                                <CheckoutButton
                                    items={stripeItems}
                                    customerEmail={user?.email}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Carrito;