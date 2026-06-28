import { useState } from "react";
import ChatBox from "./ChatBox";
// 1. IMPORTA TU CONTEXTO DE AUTH
import { useAuth } from "../../context/AuthContext"; 

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  // 2. OBTÉN EL USUARIO DEL CONTEXTO
  const { user } = useAuth(); 

  // Si no hay usuario, quizás quieras no mostrar nada o un mensaje de "Inicia sesión"
  if (!user) return null; 

  // Definimos un ID de chat. Puedes usar el ID del usuario para un chat privado, 
  // o un string fijo como "soporte" si quieres que todos hablen con el mismo administrador.
  const chatId = user.uid; 

  return (
    <>
      {/* Botón flotante */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 bg-purple-600 text-white p-4 rounded-full shadow-2xl z-50 hover:scale-105 transition"
      >
        💬
      </button>

      {/* Modal del Chat */}
      {isOpen && (
        <div className="fixed bottom-36 right-6 w-80 h-[500px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
          
          <div className="p-3 bg-blue-950 text-white flex justify-between items-center font-bold">
            <span>Soporte PoliTemu</span>
            <button onClick={() => setIsOpen(false)} className="hover:text-red-400">X</button>
          </div>
          
          <div className="flex-1 overflow-hidden">
             {/* 3. PASAMOS LAS PROPS NECESARIAS */}
             <ChatBox chatId={chatId} user={user} />
          </div>
        </div>
      )}
    </>
  );
}