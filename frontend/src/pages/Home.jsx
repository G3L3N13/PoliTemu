// src/pages/Home.jsx   
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { carritoService } from "../services/api";

import Hero from "../components/landing/Hero";
import Categories from "../components/landing/Categories";
import FeaturedProducts from "../components/landing/FeaturedProducts";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";
import ProductModal from "../components/dashboard/ProductoModal"; // 

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [agregandoAlCarrito, setAgregandoAlCarrito] = useState(false);

  const handleOpenModal = (producto) => {
    console.log("Abriendo modal con producto:", producto);
    setSelectedProduct(producto);
    setIsModalOpen(true);
  };

  const handleAgregarAlCarritoDesdeHome = async (producto) => {
    if (!user) {
      alert(" Por seguridad, debes iniciar sesión con tu cuenta de la EPN para gestionar tu carrito.");
      navigate("/login");
      return;
    }

    try {
      setAgregandoAlCarrito(true);
      
      const payload = {
        productoId: producto.id || producto._id,
        cantidad: 1,
      };

      await carritoService.agregar(payload);
      
      alert(` ¡${producto.nombre} se agregó correctamente a tu carrito!`);
      setIsModalOpen(false); 
    } catch (err) {
      console.error(" Error al añadir al carrito desde Home:", err);
      alert("No se pudo agregar el producto. Inténtalo de nuevo.");
    } finally {
      setAgregandoAlCarrito(false);
    }
  };

  return (
    <div className="bg-[#0a0a1a] text-white overflow-hidden">
      <Hero />
      <Categories />
      <FeaturedProducts onOpenModal={handleOpenModal} />
      <CTA />
      <Footer />

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        producto={selectedProduct}
        onAgregarAlCarrito={handleAgregarAlCarritoDesdeHome}
        cargando={agregandoAlCarrito}
      />
    </div>
  );
}

export default Home;