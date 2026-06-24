import { useEffect, useState } from "react";
import { Package, Users, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { adminService } from "../services/api";

function Dashboard() {
  const [ventas] = useState([500, 700, 800, 650]);
  const [usuarios, setUsuarios] = useState(0);
  const [productos, setProductos] = useState(0);
  const [ofertas, setOfertas] = useState(0);

  const stats = [
    { icon: <Package size={32} />, valor: productos, label: "Productos Totales", color: "from-purple-600/20 to-purple-900/10", border: "hover:border-purple-500/40", text: "text-purple-400" },
    { icon: <Users size={32} />, valor: usuarios, label: "Usuarios Registrados", color: "from-blue-600/20 to-blue-900/10", border: "hover:border-blue-500/40", text: "text-blue-400" },
    { icon: <ShoppingCart size={32} />, valor: ofertas, label: "Productos en Oferta", color: "from-yellow-500/20 to-yellow-800/10", border: "hover:border-yellow-500/40", text: "text-yellow-400" },
    { icon: <DollarSign size={32} />, valor: "$2,650", label: "Ganancias del Mes", color: "from-green-600/20 to-green-900/10", border: "hover:border-green-500/40", text: "text-green-400" },
  ];

  useEffect(() => {
    cargarStats();
  }, []);

  const cargarStats = async () => {
    try {

      const usuariosData = await adminService.usuarios();
      const productosData = await adminService.productos();

      setUsuarios(usuariosData.length);
      setProductos(productosData.length);

      const ofertasActivas = productosData.filter(
        p => p.enOferta
      );

      setOfertas(ofertasActivas.length);

    } catch (error) {
      console.error(error);
    }
  };

  const maxVenta = Math.max(...ventas);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white px-6 py-10">

      {/* Glows */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── HEADER ── */}
      <div className="mb-14 relative z-10">
        <span className="inline-block bg-purple-600/20 border border-purple-500/30 text-purple-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          Panel Administrativo
        </span>
        <h1 className="text-5xl md:text-6xl font-black">
          Dashboard <span className="text-yellow-400">📊</span>
        </h1>
        <p className="text-gray-400 mt-4 text-lg">
          Visualiza estadísticas y métricas del sistema.
        </p>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 relative z-10">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${s.color} border border-white/10 ${s.border} backdrop-blur-lg rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02]`}
          >
            <div className={`${s.text} mb-4`}>{s.icon}</div>
            <h3 className="text-4xl font-black text-white">{s.valor}</h3>
            <p className="text-gray-400 mt-2 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── VENTAS MENSUALES ── */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-3xl p-8 relative z-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="text-yellow-400">
            <TrendingUp size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Ventas Mensuales</h2>
            <p className="text-gray-400 text-sm">Resumen de los últimos 4 meses</p>
          </div>
        </div>

        <div className="space-y-6">
          {ventas.map((venta, i) => (
            <div key={i}>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300 text-sm font-semibold">Mes {i + 1}</span>
                <span className="text-yellow-400 font-black">${venta}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-yellow-400 transition-all duration-700"
                  style={{ width: `${(venta / maxVenta) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
          <span className="text-gray-400 text-sm">Total acumulado</span>
          <span className="text-white font-black text-2xl">
            ${ventas.reduce((a, b) => a + b, 0).toLocaleString()}
          </span>
        </div>


        <div className="grid md:grid-cols-3 gap-6 mt-10">

          <Link
            to="/admin-productos"
            className="bg-white/5 border border-white/10 p-6 rounded-3xl"
          >
            📦 Gestionar Productos
          </Link>

          <Link
            to="/dashboard/usuarios"
            className="bg-white/5 border border-white/10 p-6 rounded-3xl"
          >
            👥 Gestionar Usuarios
          </Link>

          <Link
            to="/dashboard/ofertas"
            className="bg-white/5 border border-white/10 p-6 rounded-3xl"
          >
            🔥 Gestionar Ofertas
          </Link>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;