// src/pages/Home.jsx
import Layout from "../components/Layout";
import Hero from "../components/landing/Hero";
import Categories from "../components/landing/Categories";
import FeaturedProducts from "../components/landing/FeaturedProducts";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

function Home() {
  return (
    <Layout>
      <div className="bg-[#0a0a1a] text-white overflow-hidden">
        <Hero />
        <Categories />
        <FeaturedProducts />
        <CTA />
        <Footer />
      </div>
    </Layout>
  );
}

export default Home;
