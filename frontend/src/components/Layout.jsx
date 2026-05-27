// src/components/Layout.jsx
import { useEffect, useState } from "react";
import NavbarPublic from "./landing/NavbarPublic";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user } = useAuth();

  return (
    <>
      {user ? <Navbar /> : <NavbarPublic />}
      <main className="pt-16">
        {children}
      </main>
    </>
  );
}
