// src/pages/Dashboard.jsx
import React, { useState } from "react";
import "../index.css";

function Dashboard() {
  const [ventas] = useState([500, 700, 800, 650]);
  const [usuarios] = useState(45);
  const [pedidos] = useState(8);

  return (
    <div className="container">
      <h2>Dashboard Ecommerce</h2>

      <div className="card">
        <p>Total de productos: 120</p>
        <p>Usuarios registrados: {usuarios}</p>
        <p>Pedidos pendientes: {pedidos}</p>
      </div>

      <div className="card">
        <h3>Ventas mensuales</h3>
        <ul>
          {ventas.map((v, i) => (
            <li key={i}>Mes {i + 1}: ${v}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
