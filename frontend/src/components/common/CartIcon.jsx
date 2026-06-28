import { useCart } from "../../context/CartContext";
import { FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";

const CartIcon = () => {
  const { totalTipos } = useCart();

  return (
    <Link
      to="/carrito"
      className="relative flex items-center text-white"
    >
      <FaShoppingCart size={22} />
      {totalTipos > 0 && (
        <span
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-md"
        >
          {totalTipos}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;
