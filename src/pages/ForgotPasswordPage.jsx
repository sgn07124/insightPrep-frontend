// src/pages/ForgotPasswordPage.jsx
import { useState, useEffect, useRef } from "react";

const API_BASE = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (p) => `${API_BASE}${p.startsWith("/") ? p : "/" + p}`;

export default function ForgotPasswordPage() {
  // 단계 상태
  const [emailSent, setEmailSent] = useState(false); // 전송 완료 시 true → 코드 입력 노출
  const [verified, setVerified] = useState(false);   // 인증 완료 시 true → 비번 재설정 노출

  // 필드 상태
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  // 임시: 인증 성공 시 서버가 내려줄 리셋 토큰을 담는 곳
  const [resetToken, setResetToken] = useState(null);

  // UI 상태
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // 타이머 상태
  const [timeLeft, setTimeLeft] = useState(0);
  const timerId = useRef(null);

  // 간단 이메일 정규식 (프론트 1차 검증)
  const isValidEmail = (v) => /.+@.+\..+/.test(v);

  useEffect(() => {
    if (emailSent) {
      setTimeLeft(600); // 10분 = 600초
      if (timerId.current) {
        clearInterval(timerId.current);
      }
      timerId.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerId.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerId.current) {
        clearInterval(timerId.current);
      }
      setTimeLeft(0);
    }
    return () => {
      if (timerId.current) {
        clearInterval(timerId.current);
      }
    };
  }, [emailSent]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const onSend = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!isValidEmail(email)) {
      setError("올바른 이메일 형식을 입력해 주세요.");
      return;
    }

    try {
      setSending(true);
      const res = await fetch(apiUrl('/auth/otp/sendEmail'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.code !== 'SEND_EMAIL_SUCCESS') {
        throw new Error(data?.message || '전송 실패');
      }
      setEmailSent(true);
      setInfo('인증 코드를 이메일로 전송했습니다. 메일함을 확인해 주세요.');
      setCode("");
      setVerified(false);
      setResetToken(null);
    } catch (err) {
      setError("이메일 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSending(false);
    }
  };

  const onVerify = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!code.trim()) {
      setError("인증 코드를 입력해 주세요.");
      return;
    }

    if (timeLeft === 0) {
      setError("인증 시간이 만료되었습니다. 인증 코드를 다시 요청해 주세요.");
      return;
    }

    try {
      setVerifying(true);
      const res = await fetch(apiUrl('/auth/otp/verify'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.code !== 'VERIFIED_EMAIL_SUCCESS') {
        throw new Error(data?.message || '인증 실패');
      }
      const token = data?.result?.resetToken;
      if (!token) throw new Error('리셋 토큰을 받을 수 없습니다.');
      setResetToken(token);
      setVerified(true);
      setInfo('인증이 완료되었습니다. 새 비밀번호를 설정해 주세요.');
      if (timerId.current) {
        clearInterval(timerId.current);
      }
      setTimeLeft(0);
    } catch (err) {
      setError("인증에 실패했습니다. 코드가 정확한지 확인해 주세요.");
    } finally {
      setVerifying(false);
    }
  };

  const onReset = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    // 비밀번호 최소 검증 (대문자/소문자/특수문자 포함)
    const pwOk = /[A-Z]/.test(password) && /[a-z]/.test(password) && /[^\w\s]/.test(password);
    if (!pwOk) {
      setError("비밀번호는 대문자/소문자/특수문자를 각각 1자 이상 포함해야 합니다.");
      return;
    }
    if (password !== rePassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setResetting(true);
      const res = await fetch(apiUrl('/auth/password/reset'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword: password })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.code !== 'SUCCESS') {
        throw new Error(data?.message || '재설정 실패');
      }
      alert("비밀번호가 성공적으로 재설정되었습니다. 로그인 화면으로 이동합니다.");
      window.location.href = "/login";
    } catch (err) {
      setError("비밀번호 재설정에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <section className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold mb-2">비밀번호 재설정</h1>
        <p className="text-sm text-gray-600 mb-4">이메일로 인증 코드를 받아 비밀번호를 재설정합니다.</p>

        {/* 안내/오류 메시지 */}
        <div className="min-h-[1.25rem] text-sm mb-3">
          {error ? (
            <span className="text-red-600">{error}</span>
          ) : info ? (
            <span className="text-emerald-600">{info}</span>
          ) : null}
        </div>

        {/* 1) 이메일 입력 + 전송 */}
        <form onSubmit={onSend} className="space-y-3 mb-4">
          <label className="block">
            <span className="text-sm font-medium text-ink-700">이메일</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="name@example.com"
              disabled={emailSent}
              required
            />
          </label>
          {!emailSent && (
            <button
              type="submit"
              disabled={sending}
              className={`w-full h-10 rounded-lg ${
                sending
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 bg-brand-600 hover:bg-brand-700"
              }`}
            >
              {sending ? "전송 중…" : "전송"}
            </button>
          )}
        </form>

        {/* 2) 코드 입력 + 인증 (전송 후 표시) */}
        {emailSent && (
          <form onSubmit={onVerify} className="space-y-3 mb-4">
            <label className="block">
              <span className="text-sm font-medium text-ink-700">인증 코드</span>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="이메일로 받은 코드를 입력"
                disabled={verified}
                required
              />
            </label>
            {!verified && (
              <>
                <div className="text-sm text-gray-600 mb-1">
                  {timeLeft > 0 ? (
                    <>인증 시간 남음: <span className="font-mono">{formatTime(timeLeft)}</span></>
                  ) : (
                    <span className="text-red-600">인증 시간이 만료되었습니다. 인증 코드를 다시 요청해 주세요.</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={verifying || timeLeft === 0}
                  className={`w-full h-10 rounded-lg ${
                    verifying || timeLeft === 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 bg-brand-600 hover:bg-brand-700"
                  }`}
                >
                  {verifying ? "인증 중…" : "인증"}
                </button>
              </>
            )}
          </form>
        )}

        {/* 3) 비밀번호 재설정 (인증 후 표시) */}
        {verified && (
          <form onSubmit={onReset} className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-ink-700">새 비밀번호</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="대/소문자, 특수문자 포함"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink-700">새 비밀번호 확인</span>
              <input
                type="password"
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="비밀번호 재입력"
                required
              />
            </label>
            <button
              type="submit"
              disabled={resetting}
              className={`w-full h-10 rounded-lg ${
                resetting
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 bg-brand-600 hover:bg-brand-700"
              }`}
            >
              {resetting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  재설정 중…
                </div>
              ) : (
                "재설정"
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}