import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider";
import LogoutButton from "@/app/layout/LogoutButton";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="flex items-center px-6 py-4 border-b">
      {/* Left: Logo */}
      <div className="flex items-center">
        <Link to="/" className="text-xl font-bold">
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
                  className="inline-flex h-9 items-center rounded-md border border-brand-600 text-brand-600 bg-white px-3 hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-600/40"
                >
                  AI 면접 연습
                </Link>
                {/* 펼침 메뉴: hover 또는 포커스 시 열림 */}
                <div
                  className="absolute right-0 mt-2 hidden w-44 rounded-md border bg-white shadow-lg group-hover:block group-focus-within:block"
                  role="menu"
                  aria-label="면접 연습 메뉴"
                >
                  <Link
                    to="/review"
                    className="block px-3 py-2 text-sm hover:bg-surface-soft focus:bg-surface-soft"
                    role="menuitem"
                  >
                    나의 기록
                  </Link>
                  <Link
                    to="/discussions"
                    className="block px-3 py-2 text-sm hover:bg-surface-soft focus:bg-surface-soft"
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
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-gray-700">안녕하세요, {user.nickname}님</span>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link to="/login" className="text-blue-600 hover:underline">
              로그인
            </Link>
            <Link to="/signup" className="text-blue-600 hover:underline">
              회원가입
            </Link>
          </>
        )}
      </div>
    </header>
  );
}