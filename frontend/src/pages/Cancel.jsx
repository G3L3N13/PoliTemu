// frontend/src/pages/Cancel.jsx
import { useNavigate } from "react-router-dom";
export default function Cancel() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen p-10 bg-[#0a0a1a] text-white">
      <div className="max-w-2xl mx-auto bg-white/5 p-8 rounded-2xl">
        <h1 className="text-3xl font-bold mb-4">Pago cancelado</h1>
        <p className="text-gray-300">Parece que cancelaste el pago. Tu carrito no se ha vaciado.</p>
        <div className="mt-6">
          <button onClick={() => navigate("/carrito")} className="bg-purple-600 px-4 py-2 rounded mr-2">Volver al carrito</button>
          <button onClick={() => navigate("/")} className="bg-gray-700 px-4 py-2 rounded">Seguir comprando</button>
        </div>
      </div>
    </div>
  );
}