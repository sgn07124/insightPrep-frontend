import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (path) => `${API_BASE}${path.startsWith("/") ? path : "/" + path}`;

/**
 * SignupPage with Email Verification Flow
 *
 * Requirements implemented:
 * - Email input with "전송" button on the right
 * - Clicking "전송" starts a 10-minute timer and changes button to "재전송"
 * - Below email, show "인증 번호" input + "인증" button
 * - Verify: on success → inputs become disabled/greyed (인증 완료 상태)
 *           on failure → show "일치하지 않습니다" or API error message
 * - Special case: when API returns "존재하는 이메일" code, show that message
 * - Below: password, password confirm, nickname inputs
 * - Password rule: >=8 chars with at least 1 uppercase, 1 lowercase, 1 special
 * - "회원가입" button is disabled until: email verified AND passwords match AND rule satisfied
 *
 * NOTE: send/verify API are mocked here. Replace with real API later.
 */

const TEN_MINUTES = 10 * 60; // seconds
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// TODO: Replace with actual API calls
async function apiSendEmailCode(email) {
  const res = await fetch(apiUrl("/auth/sendEmail"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (res.ok && data?.code === "SEND_EMAIL_SUCCESS") {
    return data; // { code: "SEND_EMAIL_SUCCESS", message: "이메일 전송 성공" }
  }
  const err = new Error(data?.message || "전송에 실패했습니다.");
  err.code = data?.code || "SEND_EMAIL_ERROR";
  throw err;
}

// TODO: Replace with actual API calls
async function apiVerifyEmailCode({ email, code }) {
  const res = await fetch(apiUrl("/auth/verifyEmail"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (res.ok && data?.code === "VERIFIED_EMAIL_SUCCESS") {
    return data; // success
  }
  const err = new Error(data?.message || "인증에 실패했습니다.");
  err.code = data?.code || "VERIFY_EMAIL_ERROR"; // e.g., CODE_NOT_MATCH_ERROR, EXPIRED_CODE_ERROR
  throw err;
}

async function apiSignup({ email, password, re_password, nickname }) {
  const res = await fetch(apiUrl("/auth/signup"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, re_password, nickname }),
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (res.ok && data?.code === "SIGNUP_SUCCESS") {
    return data;
  }
  const err = new Error(data?.message || "회원가입에 실패했습니다.");
  err.code = data?.code || "SIGNUP_ERROR"; // e.g., EMAIL_VERIFICATION_ERROR, PASSWORD_MATCH_ERROR
  throw err;
}

function formatSeconds(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function SignupPage() {
  const navigate = useNavigate();

  // Email + verification
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState("idle"); // idle | sending | sent | verifying | verified | error
  const [emailError, setEmailError] = useState("");
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  // Other fields
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [nickname, setNickname] = useState("");

  // Password validations
  const pwStrong = useMemo(
    () => /^(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).{8,}$/.test(pw),
    [pw]
  );
  const pwMatch = useMemo(() => pw.length > 0 && pw === pw2, [pw, pw2]);

  const emailVerified = emailStatus === "verified";
  const canSubmit = emailVerified && pwStrong && pwMatch && nickname.trim().length > 0;

  // Timer effect
  useEffect(() => {
    if (secondsLeft <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timerRef.current && secondsLeft <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [secondsLeft]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const onSend = async () => {
    // 1) Client-side validation first
    if (!isValidEmail(email)) {
      setEmailStatus("error");
      setEmailError("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    try {
      setEmailError("");
      setEmailStatus("sending");
      const res = await apiSendEmailCode(email);
      if (res?.code === "SEND_EMAIL_SUCCESS") {
        setEmailStatus("sent"); // code input appears
        setSecondsLeft(TEN_MINUTES);
        setCode("");
      } else {
        setEmailStatus("error");
        setEmailError(res?.message || "전송에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch (e) {
      setEmailStatus("error");
      if (e?.code === "EMAIL_DUPLICATE_ERROR") {
        setEmailError("이미 존재하는 이메일입니다.");
      } else {
        if (
          (e?.message && e.message.includes("Failed to fetch")) ||
          (typeof navigator !== "undefined" && !navigator.onLine)
        ) {
          setEmailError("서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.");
        } else {
          setEmailError(e?.message || "전송에 실패했습니다. 다시 시도해 주세요.");
        }
      }
    }
  };

  const onVerify = async () => {
    try {
      setEmailError("");
      setEmailStatus("verifying");
      const res = await apiVerifyEmailCode({ email, code });
      if (res?.code === "VERIFIED_EMAIL_SUCCESS") {
        setEmailStatus("verified");
        setSecondsLeft(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else {
        setEmailStatus("error");
        setEmailError(res?.message || "인증에 실패했습니다.");
      }
    } catch (e) {
      // Keep inputs visible for retry as long as timer > 0
      setEmailStatus("error");
      if (e?.code === "CODE_NOT_MATCH_ERROR") {
        setEmailError("인증번호가 일치하지 않습니다.");
      } else if (e?.code === "EXPIRED_CODE_ERROR") {
        setEmailError("인증번호가 만료되었습니다. 다시 전송해 주세요.");
        setSecondsLeft(0);
      } else {
        if (
          (e?.message && e.message.includes("Failed to fetch")) ||
          (typeof navigator !== "undefined" && !navigator.onLine)
        ) {
          setEmailError("서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.");
        } else {
          setEmailError(e?.message || "인증에 실패했습니다. 다시 시도해 주세요.");
        }
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await apiSignup({ email, password: pw, re_password: pw2, nickname });
      alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
      navigate("/login");
    } catch (e) {
      if (e?.code === "EMAIL_VERIFICATION_ERROR") {
        alert("이메일 인증이 완료되지 않았습니다.");
      } else if (e?.code === "PASSWORD_MATCH_ERROR") {
        alert("비밀번호가 일치하지 않습니다.");
      } else {
        if (
          (e?.message && e.message.includes("Failed to fetch")) ||
          (typeof navigator !== "undefined" && !navigator.onLine)
        ) {
          alert("서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.");
        } else {
          alert(e?.message || "회원가입에 실패했습니다.");
        }
      }
    }
  };

  const emailDisabled = emailVerified;
  const codeDisabled = emailVerified;
  const emailBtnLabel =
    emailStatus === "sent" || secondsLeft > 0 || emailStatus === "error"
      ? "재전송"
      : emailStatus === "sending"
      ? "전송 중…"
      : "전송";

  return (
    <>
      <h1 className="text-xl font-bold mb-4">회원가입</h1>

      <form className="grid gap-3" onSubmit={onSubmit}>
        {/* 이메일 + 전송 버튼 */}
        <label className="grid gap-1">
          <span className="text-sm font-semibold">이메일</span>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
                // Reset verification flow whenever email changes
                setEmailStatus("idle");
                setCode("");
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                  timerRef.current = null;
                }
                setSecondsLeft(0);
              }}
              placeholder="name@example.com"
              className={`h-11 flex-1 rounded-md border px-3 ${
                emailDisabled ? "bg-gray-100 text-gray-500" : ""
              }`}
              disabled={emailDisabled}
            />
            <button
              type="button"
              onClick={onSend}
              disabled={
                emailDisabled ||
                emailStatus === "sending" ||
                (secondsLeft > 0 && (emailStatus === "sent" || emailStatus === "error")) ||
                !isValidEmail(email)
              }
              className={`h-11 px-4 rounded-md ${
                emailDisabled
                  ? "bg-gray-200 text-gray-500"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 bg-brand-600 hover:bg-brand-700"
              }`}
            >
              {emailBtnLabel}
            </button>
          </div>
          {/* 타이머 & 에러 메시지 */}
          <div className="min-h-[1.25rem]">
            {secondsLeft > 0 && !emailVerified && (
              <span className="text-xs text-ink-500">
                남은 시간 {formatSeconds(secondsLeft)}
              </span>
            )}
            {emailError && (
              <div className="text-xs text-red-600">{emailError}</div>
            )}
          </div>
        </label>

        {/* 인증번호 + 인증 버튼 (전송 이후에 표시) */}
        {(emailStatus === "sent" || emailStatus === "verifying" || (emailStatus === "error" && secondsLeft > 0)) && (
          <label className="grid gap-1">
            <span className="text-sm font-semibold">인증 번호</span>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6자리 인증번호"
                className={`h-11 flex-1 rounded-md border px-3 ${
                  codeDisabled ? "bg-gray-100 text-gray-500" : ""
                }`}
                disabled={codeDisabled}
              />
              <button
                type="button"
                onClick={onVerify}
                disabled={codeDisabled || !code.trim() || emailStatus === "verifying"}
                className={`h-11 px-4 rounded-md ${
                  codeDisabled
                    ? "bg-gray-200 text-gray-500"
                    : "border hover:bg-surface-soft"
                }`}
              >
                {emailStatus === "verifying" ? "인증 중…" : "인증"}
              </button>
            </div>
            {secondsLeft > 0 && !emailVerified && (
              <div className="text-xs text-ink-500">남은 시간 {formatSeconds(secondsLeft)}</div>
            )}
          </label>
        )}

        {/* 비밀번호 */}
        <label className="grid gap-1">
          <span className="text-sm font-semibold">비밀번호</span>
          <input
            type="password"
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="h-11 rounded-md border px-3"
            placeholder="대문자/소문자/특수문자 포함 8자 이상"
          />
          <div className="min-h-[1.25rem] text-xs">
            {!pwStrong && pw.length > 0 && (
              <span className="text-red-600">
                대문자 1개 이상, 소문자 1개 이상, 특수문자 1개 이상 포함해야 합니다. (8자 이상)
              </span>
            )}
          </div>
        </label>

        {/* 비밀번호 재입력 */}
        <label className="grid gap-1">
          <span className="text-sm font-semibold">비밀번호 재입력</span>
          <input
            type="password"
            required
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            className="h-11 rounded-md border px-3"
            placeholder="비밀번호를 다시 입력하세요"
          />
          <div className="min-h-[1.25rem] text-xs">
            {pw2.length > 0 && !pwMatch && (
              <span className="text-red-600">비밀번호가 일치하지 않습니다.</span>
            )}
          </div>
        </label>

        {/* 닉네임 */}
        <label className="grid gap-1">
          <span className="text-sm font-semibold">닉네임</span>
          <input
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="h-11 rounded-md border px-3"
            placeholder="표시할 닉네임"
          />
        </label>

        {/* 회원가입 버튼 */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`mt-1 h-11 rounded-md ${
            canSubmit
              ? "bg-indigo-600 text-white hover:bg-indigo-700 bg-brand-600 hover:bg-brand-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
          title={!canSubmit ? "이메일 인증 완료 및 비밀번호 유효성/일치가 필요합니다." : undefined}
        >
          회원가입
        </button>
      </form>

      <div className="mt-4 text-sm">
        이미 계정이 있으신가요?{" "}
        <Link to="/login" className="text-brand-600 hover:underline">
          로그인
        </Link>
      </div>
    </>
  );
}