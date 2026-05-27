// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  console.log("PrivateRoute check:", { user: !!user, loading, path: location.pathname });

  if (loading) return <div style={{padding:20}}>Cargando...</div>;
  if (!user) {
    const redirectTo = encodeURIComponent(location.pathname + (location.search || ""));
    return <Navigate to={`/login?redirect=${redirectTo}`} replace />;
  }
  return children;
}
