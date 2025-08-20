import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import Spinner from "@/shared/ui/Spinner";

const API_BASE = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (path) => `${API_BASE}${path.startsWith("/") ? path : "/" + path}`;

/**
 * SignupPage with Email Verification Flow (Design-applied)
 */

const TEN_MINUTES = 10 * 60; // seconds
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

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
    return data;
  }
  const err = new Error(data?.message || "전송에 실패했습니다.");
  err.code = data?.code || "SEND_EMAIL_ERROR";
  throw err;
}

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
    if (emailStatus === "sending" || emailStatus === "verified") return;
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
        setEmailStatus("sent");
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
      <header className="mb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink-900">회원가입</h1>
        <p className="mt-1 text-sm text-ink-600">이메일 인증 후 비밀번호를 설정해 주세요.</p>
      </header>

      <form className="grid gap-4" onSubmit={onSubmit}>
        {/* 이메일 + 전송 버튼 */}
        <div>
          <label className="text-sm font-medium text-ink-700">이메일</label>
          <div className="mt-1 flex gap-2">
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
                setEmailStatus("idle");
                setCode("");
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                  timerRef.current = null;
                }
                setSecondsLeft(0);
              }}
              placeholder="name@example.com"
              disabled={emailDisabled}
              fullWidth
            />
            <Button
              as="button"
              variant={emailDisabled ? "secondary" : "primary"}
              onClick={onSend}
              type="button"
              disabled={
                emailDisabled ||
                emailStatus === "sending" ||
                (secondsLeft > 0 && (emailStatus === "sent" || emailStatus === "error")) ||
                !isValidEmail(email)
              }
              className="min-w-24"
            >
              {emailStatus === "verified" ? (
                "인증 완료"
              ) : emailStatus === "sending" ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner size="sm" variant="white" />
                  전송 중…
                </span>
              ) : (
                emailBtnLabel
              )}
            </Button>
          </div>
          {/* 타이머 & 에러 메시지 */}
          <div className="min-h-[1.25rem] mt-1">
            {emailVerified ? (
              <span className="text-xs text-success-700">이메일 인증이 완료되었습니다.</span>
            ) : (
              <>
                {secondsLeft > 0 && (
                  <span className="text-xs text-ink-500">남은 시간 {formatSeconds(secondsLeft)}</span>
                )}
                {emailError && <div className="text-xs text-danger-600">{emailError}</div>}
              </>
            )}
          </div>
        </div>

        {/* 인증번호 + 인증 버튼 (전송 이후에 표시) */}
        {(emailStatus === "sent" || emailStatus === "verifying" || (emailStatus === "error" && secondsLeft > 0)) && (
          <div>
            <label className="text-sm font-medium text-ink-700">인증 번호</label>
            <div className="mt-1 flex gap-2">
              <Input
                id="signup-code"
                inputMode="numeric"
                pattern="\\d*"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6자리 인증번호"
                disabled={codeDisabled}
                fullWidth
              />
              <Button
                as="button"
                variant="outline"
                onClick={onVerify}
                type="button"
                disabled={codeDisabled || !code.trim() || emailStatus === "verifying"}
                className="min-w-24"
              >
                {emailStatus === "verifying" ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" />
                    인증 중…
                  </span>
                ) : (
                  "인증"
                )}
              </Button>
            </div>
            {secondsLeft > 0 && !emailVerified && (
              <div className="text-xs text-ink-500 mt-1">남은 시간 {formatSeconds(secondsLeft)}</div>
            )}
          </div>
        )}

        {/* 비밀번호 */}
        <Input
          id="signup-password"
          label="비밀번호"
          type="password"
          required
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="대문자/소문자/특수문자 포함 8자 이상"
          fullWidth
        />
        <div className="min-h-[1.25rem] -mt-2 text-xs">
          {!pwStrong && pw.length > 0 && (
            <span className="text-danger-600">
              대문자 1개 이상, 소문자 1개 이상, 특수문자 1개 이상 포함해야 합니다. (8자 이상)
            </span>
          )}
        </div>

        {/* 비밀번호 재입력 */}
        <Input
          id="signup-password2"
          label="비밀번호 재입력"
          type="password"
          required
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          placeholder="비밀번호를 다시 입력하세요"
          fullWidth
        />
        <div className="min-h-[1.25rem] -mt-2 text-xs">
          {pw2.length > 0 && !pwMatch && (
            <span className="text-danger-600">비밀번호가 일치하지 않습니다.</span>
          )}
        </div>

        {/* 닉네임 */}
        <Input
          id="signup-nickname"
          label="닉네임"
          required
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="표시할 닉네임"
          fullWidth
        />

        {/* 회원가입 버튼 */}
        <Button
          as="button"
          variant="primary"
          size="md"
          className="mt-1"
          type="submit"
          disabled={!canSubmit}
          title={!canSubmit ? "이메일 인증 완료 및 비밀번호 유효성/일치가 필요합니다." : undefined}
        >
          회원가입
        </Button>
      </form>

      <div className="mt-5 text-sm">
        이미 계정이 있으신가요?{" "}
        <Link to="/login" className="text-brand-600 hover:underline">
          로그인
        </Link>
      </div>
    </>
  );
}