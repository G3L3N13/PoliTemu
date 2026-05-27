// src/pages/Home.jsx
import { useState } from "react";
import Layout from "../components/Layout";
import Hero from "../components/landing/Hero";
import Categories from "../components/landing/Categories";
import FeaturedProducts from "../components/landing/FeaturedProducts";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";
import ProductModal from "../components/dashboard/ProductoModal"; // Asegúrate que el archivo exista

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleOpenModal = (producto) => {
    console.log("Abriendo modal con producto:", producto);
    setSelectedProduct(producto);
    setIsModalOpen(true);
  };

  return (
    <Layout>
      <div className="bg-[#0a0a1a] text-white overflow-hidden">
        <Hero />
        <Categories />
        <FeaturedProducts onOpenModal={handleOpenModal} />
        <CTA />
        <Footer />
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        producto={selectedProduct}
      />
    </Layout>
  );
}

export default Home;
