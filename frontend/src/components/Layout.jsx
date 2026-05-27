// src/components/Layout.jsx
import { useEffect, useState } from "react";
import NavbarPublic from "./landing/NavbarPublic";
import Navbar from "./Navbar"; // tu navbar autenticado (con check admin)
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user } = useAuth(); // asumo que tu AuthContext expone user o null

  return (
    <>
      {user ? <Navbar /> : <NavbarPublic />}
      <main className="pt-20">
        {children}
      </main>
    </>
  );
}
