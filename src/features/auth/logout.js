// src/features/auth/logout.js
const API_BASE = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (path) => `${API_BASE}${path.startsWith("/") ? path : "/" + path}`;

export async function logoutRequest() {
  const res = await fetch(apiUrl("/auth/logout"), {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("로그아웃 실패");
  }
  return await res.json().catch(() => ({}));
}