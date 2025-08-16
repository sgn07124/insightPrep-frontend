// src/features/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-ink-500">
        인증 상태 확인 중…
      </div>
    );
  }

  if (!user) {
    // 로그인 페이지로 리다이렉트하되, 돌아올 위치를 state로 전달
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}