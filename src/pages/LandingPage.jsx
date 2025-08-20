import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="rounded-xl bg-brand-50 p-10 shadow-card flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-700">
          AI 기반 CS 면접 & 기업 분석
        </h1>
        <p className="mt-3 text-lg text-ink-500 max-w-xl">
          질문 생성 → 답변 → 피드백까지 한 화면에서.<br />
          쉽고 빠른 IT 취업 준비, 인사이트프렙이 함께합니다.
        </p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="h-11 px-6 rounded-md bg-brand-600 text-white hover:bg-brand-700 font-semibold"
          >
            시작하기
          </button>
          <button
            onClick={() => navigate("/interview")}
            className="h-11 px-6 rounded-md border hover:bg-surface-soft font-semibold"
          >
            데모 보기
          </button>
        </div>
      </section>

      {/* How it works */}
      <section className="rounded-xl bg-white p-8 shadow-card">
        <h2 className="text-2xl font-bold text-brand-700 mb-4">이용 방법</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold mb-2">1</div>
            <div className="font-semibold">질문 생성</div>
            <div className="text-ink-500 text-sm mt-1">카테고리/난이도 선택 후 AI가 맞춤 질문을 생성합니다.</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold mb-2">2</div>
            <div className="font-semibold">답변 작성</div>
            <div className="text-ink-500 text-sm mt-1">생성된 질문에 직접 답변을 입력해보세요.</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold mb-2">3</div>
            <div className="font-semibold">AI 피드백</div>
            <div className="text-ink-500 text-sm mt-1">핵심 키워드, 보완점 등 즉각적인 AI 피드백을 받아보세요.</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="rounded-xl bg-surface-soft p-8 shadow-card">
        <h2 className="text-2xl font-bold text-brand-700 mb-4">주요 기능</h2>
        <div className="grid gap-4 md:grid-cols-3">
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
        </div>
      </section>

      {/* Preview Section */}
      <section className="rounded-xl bg-white p-8 shadow-card flex flex-col items-center">
        <h2 className="text-2xl font-bold text-brand-700 mb-4">미리보기</h2>
        <div className="w-full max-w-2xl h-52 bg-surface-soft rounded-lg flex items-center justify-center text-ink-400">
          {/* Replace with screenshot or animated demo in production */}
          서비스 화면 미리보기 이미지/애니메이션 (placeholder)
        </div>
      </section>

      {/* FAQ Section */}
      <section className="rounded-xl bg-surface-soft p-8 shadow-card">
        <h2 className="text-2xl font-bold text-brand-700 mb-4">자주 묻는 질문</h2>
        <div className="space-y-5">
          <div>
            <div className="font-semibold text-ink-700">Q. 무료로 사용할 수 있나요?</div>
            <div className="text-ink-500 text-sm mt-1">네, 현재는 회원가입 후 모든 기능을 무료로 이용하실 수 있습니다.</div>
          </div>
          <div>
            <div className="font-semibold text-ink-700">Q. 어떤 기업/직무에 활용할 수 있나요?</div>
            <div className="text-ink-500 text-sm mt-1">IT 분야 CS/개발 직군 중심으로 다양한 직무에 활용 가능합니다.</div>
          </div>
          <div>
            <div className="font-semibold text-ink-700">Q. 답변 데이터가 저장되나요?</div>
            <div className="text-ink-500 text-sm mt-1">네, 본인만 확인 가능한 복습 리스트에 자동 저장됩니다.</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="rounded-xl bg-brand-50 p-10 shadow-card flex flex-col items-center text-center">
        <h2 className="text-2xl font-extrabold text-brand-700 mb-2">지금 바로 인사이트프렙 시작하기</h2>
        <p className="text-ink-500 mb-6">AI와 함께 효율적으로 면접을 준비하세요.</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="h-11 px-6 rounded-md bg-brand-600 text-white hover:bg-brand-700 font-semibold"
          >
            시작하기
          </button>
          <button
            onClick={() => navigate("/interview")}
            className="h-11 px-6 rounded-md border hover:bg-surface-soft font-semibold"
          >
            데모 보기
          </button>
        </div>
      </section>
    </div>
  );
}