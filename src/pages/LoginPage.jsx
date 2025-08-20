import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import Spinner from "@/shared/ui/Spinner";

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
        credentials: "include",
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

      if (data?.code === "LOGIN_FAIL") {
        setError(data?.message || "이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
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
      <header className="mb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink-900">
          로그인
        </h1>
        <p className="mt-1 text-sm text-ink-600">이메일과 비밀번호를 입력해 주세요.</p>
      </header>

      <form className="grid gap-4" onSubmit={onSubmit}>
        <Input
          id="login-email"
          label="이메일"
          required
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          placeholder="name@example.com"
          disabled={disabled}
          fullWidth
        />

        <Input
          id="login-password"
          label="비밀번호"
          required
          type="password"
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            if (error) setError("");
          }}
          placeholder="••••••••"
          disabled={disabled}
          fullWidth
        />

        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={autoLogin}
            onChange={(e) => setAutoLogin(e.target.checked)}
            className="h-4 w-4 rounded border-surface-border text-brand-600 focus:ring-brand-600/40"
            disabled={disabled}
          />
          자동 로그인
        </label>

        <div
          className="min-h-[1.25rem] text-sm text-danger-600"
          role="status"
          aria-live="polite"
        >
          {error}
        </div>

        <Button
          variant="primary"
          size="md"
          className="mt-1 inline-flex items-center justify-center"
          disabled={disabled}
          as="button"
          type="submit"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Spinner size="sm" variant="white" />
              로그인 중…
            </span>
          ) : (
            "로그인"
          )}
        </Button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm">
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