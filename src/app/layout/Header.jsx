

import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider";
import LogoutButton from "@/app/layout/LogoutButton";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <Link to="/" className="text-xl font-bold">
        InsightPrep
      </Link>
      <nav className="flex items-center gap-4">
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
      </nav>
    </header>
  );
}