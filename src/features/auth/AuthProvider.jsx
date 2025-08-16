// src/features/auth/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const API_BASE = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (path) => `${API_BASE}${path.startsWith("/") ? path : "/" + path}`;

async function fetchMe() {
  try {
    const res = await fetch(apiUrl("/auth/me"), { credentials: "include" });
    if (!res.ok) return { user: null, ok: false };
    const data = await res.json().catch(() => null);
    return { user: data?.result ?? data ?? { ok: true }, ok: true };
  } catch {
    return { user: null, ok: false };
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { memberId, nickname } | null
  const [loading, setLoading] = useState(true); // bootstrapping

  const reload = useMemo(() => async () => {
    setLoading(true);
    const { user: u } = await fetchMe();
    setUser(u);
    setLoading(false);
    return u;
  }, []);

  // 부팅 시 세션 확인 (/auth/me 가정). 200 이면 로그인 상태로 판단.
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const res = await fetchMe();
      if (!active) return;
      setUser(res.user);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({ user, setUser, loading, reload }), [user, loading, reload]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}