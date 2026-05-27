// Input reutilizable
export function AuthInput({ label, type = "text", placeholder, value, onChange }) {
  return (
    <div className="mb-4 text-left">
      <label className="block text-sm text-blue-200 mb-1 font-medium">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
      />
    </div>
  );
}

// Botón amarillo 
export function PrimaryButton({ onClick, disabled, loading, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-blue-900 font-bold py-3 rounded-xl transition-all duration-200 mt-2 shadow-lg shadow-yellow-400/20"
    >
      {loading ? "Cargando..." : children}
    </button>
  );
}

// Mensaje de error
export function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2 mb-4">
      <p className="text-red-300 text-xs text-center">{message}</p>
    </div>
  );
}

// Mensaje de éxito
export function SuccessMessage({ message }) {
  if (!message) return null;
  return (
    <div className="bg-green-500/20 border border-green-400/30 rounded-xl px-4 py-2 mb-4">
      <p className="text-green-300 text-xs text-center">{message}</p>
    </div>
  );
}

// Card contenedor para formularios 
export function AuthCard({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo EPN */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">
            Poli<span className="text-yellow-400">Temu</span>
          </h1>
          <p className="text-blue-300 text-sm mt-1">Escuela Politécnica Nacional</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
          {subtitle && <p className="text-blue-300 text-sm mb-6">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}