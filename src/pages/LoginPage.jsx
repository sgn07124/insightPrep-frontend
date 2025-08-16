import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider"

// env-based API base URL (same pattern as SignupPage)
const API_BASE = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (path) => `${API_BASE}${path.startsWith("/") ? path : "/" + path}`;

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    // 1) 클라이언트 유효성 검사 선행
    if (!isValidEmail(email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    if (!pw.trim()) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 세션 쿠키 포함
        body: JSON.stringify({ email, password: pw, autoLogin }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (res.ok && data?.code === "LOGIN_SUCCESS") {
        setUser(data?.result ?? null);
        navigate(from, { replace: true });
        return;
      }

      // 실패 처리 (코드 기반)
      if (data?.code === "LOGIN_FAIL") {
        setError(data?.message || "이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        // 네트워크/기타 오류 한글화
        const msg = (data?.message || "").toString();
        if (msg.includes("Failed to fetch") || !navigator.onLine) {
          setError("서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.");
        } else {
          setError(msg || "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }
      }
    } catch (e2) {
      if (e2?.message?.includes("Failed to fetch") || !navigator.onLine) {
        setError("서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.");
      } else {
        setError(e2?.message || "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading;

  return (
    <>
      <h1 className="text-xl font-bold mb-4">로그인</h1>
      <form className="grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1">
          <span className="text-sm font-semibold">이메일</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder="name@example.com"
            className="h-11 rounded-md border px-3"
            disabled={disabled}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-semibold">비밀번호</span>
          <input
            type="password"
            required
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              if (error) setError("");
            }}
            placeholder="••••••••"
            className="h-11 rounded-md border px-3"
            disabled={disabled}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoLogin}
            onChange={(e) => setAutoLogin(e.target.checked)}
            className="size-4"
            disabled={disabled}
          />
          자동 로그인
        </label>

        {/* 오류 메시지 */}
        <div className="min-h-[1.25rem] text-xs text-red-600">{error}</div>

        <button
          className={`mt-1 h-11 rounded-md ${
            disabled
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 bg-brand-600 hover:bg-brand-700"
          }`}
          disabled={disabled}
        >
          {loading ? "로그인 중…" : "로그인"}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link to="/forgot-password" className="text-brand-600 hover:underline">
          비밀번호 찾기
        </Link>
        <Link to="/signup" className="text-brand-600 hover:underline">
          회원가입
        </Link>
      </div>
    </>
  );
}