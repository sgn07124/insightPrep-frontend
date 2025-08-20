import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider";
import LogoutButton from "@/app/layout/LogoutButton";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-surface-card border-b border-surface-border">
      <div className="container-page mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link to="/" className="text-xl md:text-2xl font-extrabold tracking-tight text-ink-900 hover:text-brand-700 transition-colors">
            InsightPrep
          </Link>
        </div>

        {/* Center: Primary navigation (only key features; visible when logged in) */}
        <div className="flex-1 flex justify-center">
          <nav aria-label="primary">
            <ul className="flex items-center gap-4">
              {user && (
                <li className="relative group">
                  {/* 메인 버튼: 클릭 시 /interview 이동 */}
                  <Link
                    to="/interview"
                    className="inline-flex h-9 items-center rounded-md border border-brand-600 text-brand-700 bg-surface-card px-3 hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-600/40"
                  >
                    AI 면접 연습
                  </Link>
                  {/* 펼침 메뉴: hover 또는 포커스 시 열림 */}
                  <div
                    className="absolute right-0 mt-2 hidden w-44 rounded-md border border-surface-border bg-surface-card shadow-card py-1 group-hover:block group-focus-within:block"
                    role="menu"
                    aria-label="면접 연습 메뉴"
                  >
                    <Link
                      to="/review"
                      className="block px-3 py-2 text-sm text-ink-700 hover:bg-surface-soft focus:bg-surface-soft"
                      role="menuitem"
                    >
                      나의 기록
                    </Link>
                    <Link
                      to="/discussions"
                      className="block px-3 py-2 text-sm text-ink-700 hover:bg-surface-soft focus:bg-surface-soft"
                      role="menuitem"
                    >
                      토론 게시판
                    </Link>
                  </div>
                </li>
              )}
            </ul>
          </nav>
        </div>

        {/* Right: Auth-related (login/signup or greeting/logout) */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:inline text-ink-700">안녕하세요, {user.nickname}님</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex h-9 items-center rounded-md border border-surface-border px-3 text-ink-700 hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-brand-600/40"
              >
                로그인
              </Link>
              <Link
                to="/signup"
                className="inline-flex h-9 items-center rounded-md bg-brand-600 text-white px-3 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600/40"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}