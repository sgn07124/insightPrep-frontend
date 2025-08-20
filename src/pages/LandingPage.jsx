import { useNavigate } from "react-router-dom";
import Button from "@/shared/ui/Button";
import Card, { CardHeader, CardContent } from "@/shared/ui/Card";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex justify-center">
      <div className="container-page max-w-6xl space-y-16 md:space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl p-12 md:p-16 shadow-card text-center">
        {/* decorative gradient background */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-brand-50 to-white"
        />
        <div className="relative z-10 mx-auto max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-ink-900 tracking-tight">
            AI 기반 CS 면접 & 기업 분석
          </h1>
          <p className="mt-4 text-ink-600 text-lg leading-relaxed">
            질문 생성 → 답변 → 피드백까지 한 화면에서.
            <br />
            쉽고 빠른 IT 취업 준비, 인사이트프렙이 함께합니다.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="primary" size="md" onClick={() => navigate("/login")}>
              시작하기
            </Button>
            <Button variant="outline" size="md" onClick={() => navigate("/interview")}>
              데모 보기
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="rounded-2xl bg-white p-8 shadow-card">
        <h2 className="text-2xl font-bold text-ink-900 mb-6">이용 방법</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              step: 1,
              t: "질문 생성",
              d: "카테고리/난이도 선택 후 AI가 맞춤 질문을 생성합니다.",
            },
            {
              step: 2,
              t: "답변 작성",
              d: "생성된 질문에 직접 답변을 입력해보세요.",
            },
            {
              step: 3,
              t: "AI 피드백",
              d: "핵심 키워드, 보완점 등 즉각적인 AI 피드백을 받아보세요.",
            },
          ].map((f, i) => (
            <Card key={i} className="h-full">
              <CardContent className="flex flex-col items-center text-center py-6">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold mb-2">
                  {f.step}
                </div>
                <div className="font-semibold text-ink-800">{f.t}</div>
                <div className="text-ink-600 text-sm mt-2">{f.d}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="rounded-2xl bg-surface-soft p-8 shadow-card">
        <h2 className="text-2xl font-bold text-ink-900 mb-6">주요 기능</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: "실전형 질문 생성", d: "카테고리 기반 난이도 조절" },
            { t: "즉시 피드백", d: "핵심 키워드·누락 포인트 제시" },
            { t: "복습 리스트", d: "질문별 기록/검색/토론 연계" },
          ].map((f, i) => (
            <Card key={i} className="h-full">
              <CardHeader className="text-lg font-bold text-ink-900">
                {f.t}
              </CardHeader>
              <CardContent className="text-ink-600">{f.d}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Preview Section */}
      <section className="rounded-2xl bg-white p-8 shadow-card">
        <h2 className="text-2xl font-bold text-ink-900 mb-6">미리보기</h2>
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video w-full rounded-2xl border border-dashed border-surface-border grid place-items-center text-ink-400">
              {/* Replace with screenshot or animated demo in production */}
              서비스 화면 미리보기 이미지/애니메이션 (placeholder)
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ Section */}
      <section className="rounded-2xl bg-surface-soft p-8 shadow-card">
        <h2 className="text-2xl font-bold text-ink-900 mb-6">자주 묻는 질문</h2>
        <div className="space-y-5">
          <div>
            <div className="font-semibold text-ink-800">
              Q. 무료로 사용할 수 있나요?
            </div>
            <div className="text-ink-600 text-sm mt-1">
              네, 현재는 회원가입 후 모든 기능을 무료로 이용하실 수 있습니다.
            </div>
          </div>
          <div>
            <div className="font-semibold text-ink-800">
              Q. 어떤 기업/직무에 활용할 수 있나요?
            </div>
            <div className="text-ink-600 text-sm mt-1">
              IT 분야 CS/개발 직군 중심으로 다양한 직무에 활용 가능합니다.
            </div>
          </div>
          <div>
            <div className="font-semibold text-ink-800">
              Q. 답변 데이터가 저장되나요?
            </div>
            <div className="text-ink-600 text-sm mt-1">
              네, 본인만 확인 가능한 복습 리스트에 자동 저장됩니다.
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden rounded-2xl p-12 md:p-16 shadow-card text-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-brand-50 to-white"
        />
        <div className="relative z-10 mx-auto max-w-xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-ink-900 mb-3">
            지금 바로 인사이트프렙 시작하기
          </h2>
          <p className="text-ink-600 mb-6">
            AI와 함께 효율적으로 면접을 준비하세요.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="primary" size="md" onClick={() => navigate("/login")}>
              시작하기
            </Button>
            <Button variant="outline" size="md" onClick={() => navigate("/interview")}>
              데모 보기
            </Button>
          </div>
        </div>
      </section>
    </div>
  </div>
  );
}