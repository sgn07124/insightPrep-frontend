import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-xl bg-brand-50 p-10 shadow-card">
        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-700">
          AI 기반 CS 면접 & 기업 분석
        </h1>
        <p className="mt-2 text-ink-500">
          질문 생성 → 답변 → 피드백까지 한 화면에서.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="h-11 px-5 rounded-md bg-brand-600 text-white hover:bg-brand-700"
          >
            시작하기
          </button>
          <button
            onClick={() => navigate("/interview")}
            className="h-11 px-5 rounded-md border hover:bg-surface-soft"
          >
            데모 보기
          </button>
        </div>
      </section>

      {/* Features (간단 카드) */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { t: "실전형 질문 생성", d: "카테고리 기반 난이도 조절" },
          { t: "즉시 피드백", d: "핵심 키워드·누락 포인트 제시" },
          { t: "복습 리스트", d: "질문별 기록/검색/토론 연계" },
        ].map((f, i) => (
          <div key={i} className="rounded-xl bg-white shadow-card p-5">
            <div className="text-lg font-bold">{f.t}</div>
            <div className="mt-1 text-ink-500">{f.d}</div>
          </div>
        ))}
      </section>
    </div>
  );
}