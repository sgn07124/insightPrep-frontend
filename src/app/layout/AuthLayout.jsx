import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-dvh grid lg:grid-cols-2">
      {/* 좌측 브랜딩(큰 화면에서만) */}
      <div className="hidden lg:flex flex-col justify-center bg-brand-50">
        <div className="container">
          <h1 className="text-4xl font-extrabold text-brand-700 mb-3">InsightPrep</h1>
          <p className="text-brand-800/80">
            AI 기반 면접 준비와 기업 분석을 한 곳에서.
          </p>
        </div>
      </div>

      {/* 우측: 카드 */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface shadow-card rounded-xl p-6">
          <Outlet />
          <div className="mt-4 text-sm text-ink-500">
            <Link to="/" className="hover:text-brand-600">← 홈으로</Link>
          </div>
        </div>
      </div>
    </div>
  );
}