import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa"; // O el icono que uses

const FloatingCart = () => {
  const { items } = useCart();
  const navigate = useNavigate();

  // Si no hay productos, quizás no quieras mostrar el botón
  if (items.length === 0) return null;

  return (
    <div 
      onClick={() => navigate("/carrito")}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#007bff",
        color: "white",
        padding: "15px",
        borderRadius: "50%",
        cursor: "pointer",
        zIndex: 9999, // Asegura que esté encima de todo
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
      }}
    >
      <FaShoppingCart size={24} />
      {/* Indicador de cantidad */}
      <span style={{
        position: "absolute",
        top: "-5px",
        right: "-5px",
        backgroundColor: "red",
        borderRadius: "50%",
        padding: "2px 8px",
        fontSize: "12px"
      }}>
        {items.length}
      </span>
    </div>
  );
};

export default FloatingCart;