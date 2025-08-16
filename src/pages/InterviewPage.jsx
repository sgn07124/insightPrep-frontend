import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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

        // 202(PENDING) 처리: 본문 1회만 파싱하고 재시도
        if (res.status === 202) {
          const data = await res.json().catch(() => null);
          console.debug("[feedback] 202 pending", data);
          if (data?.code === "FEEDBACK_PENDING") {
            setTimeout(tryFetch, 3000);
            return;
          }
          // 202인데 예상 코드가 아니면 에러로 취급
          setFeedbackLoading(false);
          setError(data?.message || "피드백 대기 중 예기치 못한 응답입니다.");
          return;
        }

        const data = await res.json().catch(() => null);
        console.debug("[feedback] status", res.status, "data", data);

        if (res.ok) {
          // 일부 서버가 200에서도 PENDING 코드를 줄 수 있어 방어
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

        // 기타 오류 처리
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
    <div className="grid gap-6">
      {phase === "select" && (
        <section className="rounded-lg border bg-white p-4">
          <h2 className="text-base font-semibold mb-3">카테고리 선택</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setSelectedCat(c.key)}
                className={`h-10 rounded-md border text-sm ${
                  selectedCat === c.key
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 bg-brand-600 hover:bg-brand-700 border-transparent"
                    : "border-ink-200 text-ink-700 hover:bg-surface-soft"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={startSolving}
              disabled={!selectedCat}
              className={`h-10 px-4 rounded-md ${
                selectedCat
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 bg-brand-600 hover:bg-brand-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              문제 풀기
            </button>
          </div>
        </section>
      )}

      {phase !== "select" && (
        <div className="grid gap-4">
          {/* 질문 */}
          <section className="rounded-lg border bg-white p-4 min-h-48">
            <div className="text-sm font-semibold text-ink-500 mb-2">질문</div>
            {question ? (
              <p className="font-medium whitespace-pre-wrap">{question.text}</p>
            ) : (
              <div className="text-ink-500 text-sm">카테고리를 선택하고 문제를 시작하세요.</div>
            )}
          </section>

          {/* 답변 */}
          <section className="rounded-lg border bg-white p-4 min-h-48">
            <div className="text-sm font-semibold text-ink-500 mb-2">답변</div>

            {phase === "answer" && (
              <>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="여기에 답변을 작성하세요."
                  className="w-full min-h-36 rounded-md border p-3"
                />
                <div className="mt-3">
                  <button
                    onClick={submitAnswer}
                    disabled={!answer.trim() || submitting}
                    className={`h-10 px-4 rounded-md ${
                      !answer.trim() || submitting
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 bg-brand-600 hover:bg-brand-700"
                    }`}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        제출 중…
                      </div>
                    ) : "답변 제출"}
                  </button>
                </div>
              </>
            )}

            {(feedbackLoading || feedback) && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-ink-500 mb-2">피드백</div>
                {feedbackLoading ? (
                  <div className="text-sm text-ink-500">피드백 생성 중…</div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className="font-semibold">점수:</span>
                      <span className="text-ink-700">{feedback.score}</span>
                    </div>
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-ink-500 mb-1">개선점</div>
                      <div className="rounded-md border bg-surface p-3 whitespace-pre-wrap">{feedback.improvement}</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-ink-500 mb-1">모범 답안</div>
                      <div className="rounded-md border bg-surface p-3 whitespace-pre-wrap">{feedback.modelAnswer}</div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={goNext}
                        className="h-10 px-4 rounded-md border hover:bg-surface-soft"
                      >
                        다음 문제
                      </button>
                      <button
                        type="button"
                        onClick={goMyReview}
                        className="h-10 px-4 rounded-md border hover:bg-surface-soft"
                      >
                        내가 푼 문제
                      </button>
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
            <div className="mt-3 min-h-[1.25rem] text-xs text-red-600">{error}</div>
          </section>
        </div>
      )}
    </div>
  );
}