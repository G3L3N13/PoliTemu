import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-[#05051a] border-t border-white/10 px-6 py-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">

        {/* Marca */}
        <div>
          <h3 className="text-2xl font-black text-white mb-3">
            POLI<span className="text-yellow-400">TEMU</span>
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Tu marketplace universitario para vender productos de forma segura dentro de la EPN.
          </p>
          {/* Redes sociales */}
          <div className="flex gap-3 mt-5">
            {["𝕏", "ig", "fb", "yt"].map((red) => (
              <button
                key={red}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-purple-600 text-gray-400 hover:text-white text-xs font-bold transition flex items-center justify-center"
              >
                {red}
              </button>
            ))}
          </div>
        </div>

        {/* PoliTemu */}
        <div>
          <h4 className="text-white font-bold mb-4">PoliTemu</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><a href="#" className="hover:text-yellow-400 transition">Categorías</a></li>
            <li><a href="#" className="hover:text-yellow-400 transition">Ofertas</a></li>
            <li><a href="#" className="hover:text-yellow-400 transition">Novedades</a></li>
            <li><a href="#" className="hover:text-yellow-400 transition">Vendedores</a></li>
          </ul>
        </div>

        {/* Soporte */}
        <div>
          <h4 className="text-white font-bold mb-4">Soporte</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><a href="#" className="hover:text-yellow-400 transition">Centro de Ayuda</a></li>
            <li><a href="#" className="hover:text-yellow-400 transition">Contacto</a></li>
            <li><a href="#" className="hover:text-yellow-400 transition">Política de Devoluciones</a></li>
            <li><a href="#" className="hover:text-yellow-400 transition">Reportar un Problema</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-bold mb-4">Legal</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><a href="#" className="hover:text-yellow-400 transition">Terminos y Condiciones</a></li>
            <li><Link to="/register" className="hover:text-yellow-400 transition">Privacidad</Link></li>
            <li><a href="#" className="hover:text-yellow-400 transition">Cookies</a></li>
            <li><a href="#" className="hover:text-yellow-400 transition">Licencia</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-500 text-sm">
          PoliTemu © 2026 Todos los derechos reservados
        </p>
        <div className="flex items-center gap-3">
          {["VISA", "MC", "PayPal", "GPay"].map((p) => (
            <span key={p} className="bg-white/10 text-gray-400 text-xs px-3 py-1 rounded-lg font-semibold">
              {p}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;