import { createContext, useContext, useState, useEffect } from "react";
import { carritoService } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const { user } = useAuth();

  // Función para obtener datos del servidor
  const refreshCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      const data = await carritoService.obtener();
      setItems(data.productos || []);
    } catch (error) {
      console.error("Error al sincronizar carrito:", error);
    }
  };

  // Función para AGREGAR al carrito (Reactiva)
  const addToCart = async (producto) => {
    try {
      await carritoService.agregar({ productoId: producto.id, cantidad: 1 });
      // FORMA REACTIVA: Actualizamos el estado local inmediatamente
      // Así el navbar y el flotante se actualizan sin recargar
      await refreshCart(); 
    } catch (error) {
      console.error("Error al agregar:", error);
    }
  };

  // Calcula el total de unidades (cantidad total de productos)
  const totalUnidades = items.reduce((acc, item) => acc + (item.cantidad || 1), 0);
  
  // Calcula el número de tipos de productos (únicos)
  const totalTipos = items.length;

  useEffect(() => {
    refreshCart();
  }, [user]);

  return (
    <CartContext.Provider value={{ 
        items, 
        refreshCart, 
        addToCart, 
        totalUnidades, 
        totalTipos 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);