import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-surface">
      {/* 좌측 브랜딩(큰 화면에서만) */}
      <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-brand-50 to-white">
        <div className="container-page mx-auto max-w-6xl px-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-brand-700 mb-3">InsightPrep</h1>
          <p className="text-ink-700">
            AI 기반 면접 준비와 기업 분석을 한 곳에서.
          </p>
        </div>
      </div>

      {/* 우측: 카드 */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md bg-surface-card border border-surface-border shadow-card rounded-2xl p-6 md:p-8">
          <Outlet />
          <div className="mt-4 text-sm text-ink-500">
            <Link to="/" className="hover:text-brand-600">← 홈으로</Link>
          </div>
        </div>
      </div>
    </div>
  );
}