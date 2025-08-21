import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/shared/ui/Button";
import Textarea from "@/shared/ui/Textarea";
import Spinner from "@/shared/ui/Spinner";

const API_BASE = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (path) => `${API_BASE}${path.startsWith("/") ? path : "/" + path}`;

const CATEGORIES = [
  { key: "java", label: "Java" },
  { key: "algorithm", label: "Algorithm" },
  { key: "database", label: "Database" },
  { key: "os", label: "OS" },
  { key: "network", label: "Network" },
  { key: "datastructure", label: "Data Structure" },
];

export default function InterviewPage() {
  // phase: select → answer
  const [phase, setPhase] = useState("select");
  const [selectedCat, setSelectedCat] = useState(null);

  const [question, setQuestion] = useState(null); // { id, text }
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false); // 답변 제출 중

  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [error, setError] = useState("");
  const pollAbortRef = useRef({ aborted: false });

  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 폴링 중지
      pollAbortRef.current.aborted = true;
      if (pollAbortRef.current.timeoutId) {
        clearTimeout(pollAbortRef.current.timeoutId);
      }
    };
  }, []);

  // 카테고리를 선택하고 "문제 풀기" 클릭 시
  const startSolving = async () => {
    if (!selectedCat) return;
    setError("");
    setPhase("answer");
    setQuestion(null);
    setAnswer("");
    setFeedback(null);

    try {
      const res = await fetch(apiUrl(`/question/${encodeURIComponent(selectedCat)}`), {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || data?.code !== "CREATE_QUESTION_SUCCESS") {
        const msg = (data?.message || "문제 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.").toString();
        setError(msg);
        return;
      }

      setQuestion({ id: data.result?.id, text: data.result?.content });
    } catch (e) {
      const msg = (e?.message || "").toString();
      if (msg.includes("Failed to fetch") || !navigator.onLine) {
        setError("서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.");
      } else {
        setError("문제 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    }
  };

  // 답변 제출 → 피드백 폴링(3s) → 피드백 표시
  const submitAnswer = async () => {
    if (!answer.trim() || !question) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(apiUrl(`/question/${question.id}/answer`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: answer.trim() }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || data?.code !== "SAVE_ANSWER_SUCCESS") {
        const msg = (data?.message || "답변 제출에 실패했습니다. 잠시 후 다시 시도해 주세요.").toString();
        setError(msg);
        return;
      }

      const answerId = data?.result?.answerId;
      if (!answerId) {
        setError("답변 ID를 확인할 수 없습니다.");
        return;
      }

      // 폴링 시작
      setFeedback(null);
      setFeedbackLoading(true);
      pollAbortRef.current.aborted = false;
      await pollFeedback(answerId);
    } catch (e) {
      const msg = (e?.message || "").toString();
      if (msg.includes("Failed to fetch") || !navigator.onLine) {
        setError("서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.");
      } else {
        setError("답변 제출에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  async function pollFeedback(answerId) {
    // 3초 간격 재귀 폴링
    pollAbortRef.current.timeoutId = setTimeout(() => {
      pollAbortRef.current.aborted = true;
      setFeedbackLoading(false);
      setError("피드백 조회 시간이 초과되었습니다. 다시 시도해주세요.");
    }, 60000);

    const tryFetch = async () => {
      if (pollAbortRef.current.aborted) return;
      try {
        const res = await fetch(apiUrl(`/question/${answerId}/feedback`), {
          method: "POST",
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        // 202(PENDING) 처리
        if (res.status === 202) {
          const data = await res.json().catch(() => null);
          if (data?.code === "FEEDBACK_PENDING") {
            setTimeout(tryFetch, 3000);
            return;
          }
          setFeedbackLoading(false);
          setError(data?.message || "피드백 대기 중 예기치 못한 응답입니다.");
          return;
        }

        const data = await res.json().catch(() => null);

        if (res.ok) {
          if (data?.code === "FEEDBACK_PENDING") {
            setTimeout(tryFetch, 3000);
            return;
          }

          const r = data?.result;
          if (r && (typeof r.score !== "undefined" || r.feedbackId)) {
            clearTimeout(pollAbortRef.current.timeoutId);
            pollAbortRef.current.aborted = true;
            setFeedback({
              score: r.score,
              improvement: r.improvement,
              modelAnswer: r.modelAnswer,
            });
            setFeedbackLoading(false);
            return;
          }
        }
        setFeedbackLoading(false);
        setError(data?.message || "피드백 조회에 실패했습니다.");
      } catch (e) {
        const msg = (e?.message || "").toString();
        if (msg.includes("Failed to fetch") || !navigator.onLine) {
          setError("서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.");
        } else {
          setError("피드백 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }
        setFeedbackLoading(false);
      }
    };

    setTimeout(tryFetch, 3000);
  }

  const goNext = () => {
    // 다음 문제 → 카테고리 선택 화면으로 초기화
    pollAbortRef.current.aborted = true;
    if (pollAbortRef.current.timeoutId) {
      clearTimeout(pollAbortRef.current.timeoutId);
    }
    setPhase("select");
    setSelectedCat(null);
    setQuestion(null);
    setAnswer("");
    setFeedback(null);
    setFeedbackLoading(false);
    setError("");
  };

  const goMyReview = () => navigate("/review");

  return (
    <div className="container-page mx-auto max-w-4xl px-4">
      {phase === "select" && (
        <section className="rounded-2xl border border-surface-border bg-surface-card p-4 shadow-card">
          <h2 className="text-lg font-semibold text-ink-900">카테고리 선택</h2>
          <p className="mt-1 text-sm text-ink-600">원하는 분야의 문제를 골라 시작하세요.</p>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setSelectedCat(c.key)}
                className={`h-10 rounded-lg border text-sm transition-colors ${
                  selectedCat === c.key
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white border-surface-border text-ink-700 hover:bg-surface-soft"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <Button
              as="button"
              onClick={startSolving}
              disabled={!selectedCat}
              variant="primary"
              size="md"
            >
              문제 풀기
            </Button>
          </div>
        </section>
      )}

      {phase !== "select" && (
        <div className="grid gap-4">
          {/* 질문 */}
          <section className="rounded-2xl border border-surface-border bg-surface-card p-4 shadow-card min-h-48">
            <div className="text-sm font-semibold text-ink-500 mb-2">질문</div>
            {question ? (
              <p className="font-medium whitespace-pre-wrap text-ink-900">{question.text}</p>
            ) : (
              <div className="text-ink-500 text-sm">카테고리를 선택하고 문제를 시작하세요.</div>
            )}
          </section>

          {/* 답변 */}
          <section className="rounded-2xl border border-surface-border bg-surface-card p-4 shadow-card min-h-48">
            <div className="text-sm font-semibold text-ink-500 mb-2">답변</div>

            {phase === "answer" && (
              <>
                <Textarea
                  id="interview-answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="여기에 답변을 작성하세요."
                  minRows={8}
                  fullWidth
                />
                <div className="mt-3">
                  <Button
                    as="button"
                    onClick={submitAnswer}
                    disabled={!answer.trim() || submitting}
                    variant="primary"
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2"><Spinner size="sm" variant="white"/> 제출 중…</span>
                    ) : (
                      "답변 제출"
                    )}
                  </Button>
                </div>
              </>
            )}

            {(feedbackLoading || feedback) && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-ink-500 mb-2">피드백</div>
                {feedbackLoading ? (
                  <div className="inline-flex items-center gap-2 text-sm text-ink-600"><Spinner size="sm"/> 피드백 생성 중…</div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className="font-semibold">점수:</span>
                      <span className="text-ink-700">{feedback.score}</span>
                    </div>
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-ink-500 mb-1">개선점</div>
                      <div className="rounded-md border border-surface-border bg-white p-3 whitespace-pre-wrap text-ink-800">{feedback.improvement}</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-ink-500 mb-1">모범 답안</div>
                      <div className="rounded-md border border-surface-border bg-white p-3 whitespace-pre-wrap text-ink-800">{feedback.modelAnswer}</div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button as="button" type="button" onClick={goNext} variant="outline">다음 문제</Button>
                      <Button as="button" type="button" onClick={goMyReview} variant="secondary">내가 푼 문제</Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {phase === "answer" && (
              <div className="mt-3 flex gap-2 text-xs text-ink-500">
                <span>선택한 카테고리: </span>
                <span className="font-medium">{CATEGORIES.find((c) => c.key === selectedCat)?.label}</span>
              </div>
            )}

            {/* 에러 메시지 */}
            <div className="mt-3 min-h-[1.25rem] text-sm text-danger-600" role="alert">{error}</div>
          </section>
        </div>
      )}
    </div>
  );
}