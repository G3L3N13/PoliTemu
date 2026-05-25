// src/pages/Home.jsx
import React from "react";
import "../index.css";

function Home() {
  const opciones = [
    { titulo: "Productos", descripcion: "Explora nuestro catálogo", ruta: "/productos" },
    { titulo: "Carrito", descripcion: "Revisa tus compras", ruta: "/carrito" },
    { titulo: "Ofertas", descripcion: "Promociones especiales", ruta: "/ofertas" },
    { titulo: "Perfil", descripcion: "Gestiona tu cuenta", ruta: "/perfil" }
  ];

  return (
    <div className="container dark">
      <h2>Bienvenido a PoliTemu</h2>
      <div className="grid">
        {opciones.map((op, i) => (
          <div key={i} className="card clickable dark-card" onClick={() => window.location.href = op.ruta}>
            <h3>{op.titulo}</h3>
            <p>{op.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
