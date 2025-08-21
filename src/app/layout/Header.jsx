import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import LogoutButton from "@/app/layout/LogoutButton";

export default function Header() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

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
                <li
                  className="relative"
                  onMouseEnter={() => setMenuOpen(true)}
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  {/* 메인: 큰 CTA + 캐럿 (접근성 고려) */}
                  <div className="inline-flex items-stretch overflow-hidden rounded-lg border border-surface-border bg-surface-card shadow-sm focus-within:ring-2 focus-within:ring-brand-600/40">
                    {/* 주 액션: 면접 연습 바로 가기 */}
                    <Link
                      to="/interview"
                      className="inline-flex items-center gap-2 px-3 h-10 text-ink-900 hover:bg-surface-soft focus:outline-none"
                      aria-label="AI 면접 연습으로 이동"
                    >
                      <span className="font-semibold">AI 면접 연습</span>
                    </Link>
                    {/* 서브 트리거: 펼침 토글 느낌 (hover/focus로 패널 표시) */}
                    <button
                      type="button"
                      className="px-2 border-l border-surface-border text-ink-700 hover:bg-surface-soft focus:outline-none"
                      aria-haspopup="menu"
                      aria-expanded={menuOpen}
                      title="더 보기"
                      onClick={() => setMenuOpen((v) => !v)}
                    >
                      <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* 드롭다운 패널: 감각적인 카드형 퀵 액션 */}
                  <div
                    className={`${menuOpen ? "visible opacity-100 pointer-events-auto" : "invisible opacity-0 pointer-events-none"} absolute right-0 top-full translate-y-2 w-[360px] rounded-xl border border-surface-border bg-surface-card shadow-card/80 ring-1 ring-black/5 transition before:content-[''] before:absolute before:-top-2 before:left-0 before:h-2 before:w-full`}
                    role="menu"
                    aria-label="면접 연습 관련 메뉴"
                  >
                    <div className="px-4 pt-4 pb-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">빠른 이동</div>
                      <p className="mt-1 text-sm text-ink-600">최근 연습 기록을 복습하거나 토론 게시판에서 의견을 받아보세요.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 p-3">
                      <Link
                        to="/review"
                        onClick={() => setMenuOpen(false)}
                        className="group/item flex items-start gap-3 rounded-lg p-3 hover:bg-surface-soft focus:bg-surface-soft"
                        role="menuitem"
                      >
                        <div className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {/* 책 아이콘 */}
                          <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                            <path d="M6 4.5A1.5 1.5 0 017.5 3H20a1 1 0 011 1v14a1 1 0 01-1 1H8c-.55 0-1 .45-1 1v1H5.5A1.5 1.5 0 014 19.5v-14A1.5 1.5 0 015.5 4h.5v14.25c.3-.16.64-.25 1-.25H20V4H7.5A1.5 1.5 0 006 5.5V4.5z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-ink-900">나의 기록 복습</div>
                          <div className="text-sm text-ink-600 line-clamp-2">지난 문제들의 답변과 피드백을 한 번에 확인하고 복습하세요.</div>
                        </div>
                      </Link>

                      <Link
                        to="/discussions"
                        onClick={() => setMenuOpen(false)}
                        className="group/item flex items-start gap-3 rounded-lg p-3 hover:bg-surface-soft focus:bg-surface-soft"
                        role="menuitem"
                      >
                        <div className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                          {/* 말풍선 아이콘 */}
                          <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                            <path d="M20 2H4a2 2 0 00-2 2v14l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-ink-900">토론 게시판</div>
                          <div className="text-sm text-ink-600 line-clamp-2">질문을 공유해 다양한 의견을 받고 해결로 이어가 보세요.</div>
                        </div>
                      </Link>
                    </div>
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