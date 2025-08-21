// src/pages/DiscussionNewPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Input from "@/shared/ui/Input";
import Textarea from "@/shared/ui/Textarea";
import Button from "@/shared/ui/Button";
import Spinner from "@/shared/ui/Spinner";

const API_BASE = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (p) => `${API_BASE}${p.startsWith("/") ? p : "/" + p}`;

async function fetchAnswerPreview(answerId) {
  const res = await fetch(apiUrl(`/question/${answerId}/preview`), {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.result) {
    throw new Error(data?.message || "연결 프리뷰를 불러오지 못했습니다.");
  }
  const q = data.result.question ?? "";
  const a = data.result.answer ?? "";
  return { answerId, question: q, answer: a };
}

async function createDiscussion({ answerId, title, content }) {
  const res = await fetch(apiUrl("/post"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answerId, title, content }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "게시글 등록에 실패했습니다.");
  const id = data?.result?.postId ?? data?.postId ?? data?.id;
  if (typeof id !== "number") throw new Error("생성된 글 ID를 확인할 수 없습니다.");
  return { id };
}

export default function DiscussionNewPage() {
  const [sp] = useSearchParams();
  const answerId = Number(sp.get("answerId"));
  const qpQuestion = sp.get("question");
  const qpAnswer = sp.get("answer");

  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!answerId) {
          setLoading(false);
          return;
        }
        if (qpQuestion || qpAnswer) {
          if (!active) return;
          setPreview({ answerId, question: qpQuestion || "", answer: qpAnswer || "" });
          setLoading(false);
          return;
        }
        const res = await fetchAnswerPreview(answerId);
        if (!active) return;
        setPreview(res);
      } catch (e) {
        setError(e?.message || "연결 프리뷰를 불러오지 못했습니다.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [answerId, qpQuestion, qpAnswer]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!answerId) {
      setError("연결된 답변이 없습니다. /review에서 다시 시도해 주세요.");
      return;
    }
    try {
      setSubmitting(true);
      const { id } = await createDiscussion({ answerId, title, content });
      navigate(`/discussions/${id}`);
    } catch (err) {
      setError(err?.message || "게시글 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page mx-auto max-w-3xl px-4 py-10">
        <div className="inline-flex items-center gap-2 text-ink-600">
          <Spinner size="sm" /> 불러오는 중…
        </div>
      </div>
    );
  }

  return (
    <div className="container-page mx-auto max-w-3xl px-4">
      {/* 상단 네비 */}
      <div className="mb-4 text-sm">
        <Link to="/discussions" className="text-brand-600 hover:underline">
          ← 목록으로
        </Link>
      </div>

      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink-900">
          토론 글 작성
        </h1>
        <p className="mt-1 text-sm text-ink-600">연결된 질문을 확인하고 제목과 본문을 작성해 주세요.</p>
      </header>

      {/* 연결 프리뷰 */}
      {preview ? (
        <section className="mb-6 rounded-2xl border border-surface-border bg-surface-card p-4 shadow-card">
          <h2 className="text-sm font-semibold text-ink-500 mb-2">연결된 질문</h2>
          <div className="font-medium text-ink-900 whitespace-pre-wrap">{preview.question || "(질문 내용 없음)"}</div>
          {preview.answer && (
            <div className="mt-2 text-sm text-ink-700 whitespace-pre-wrap">
              <span className="font-medium text-ink-800">내 답변</span>: {preview.answer}
            </div>
          )}
        </section>
      ) : (
        <section className="mb-6 rounded-2xl border border-dashed border-surface-border bg-surface-soft p-4 text-danger-700">
          답변 연결이 없습니다. (/review에서 진입 권장)
        </section>
      )}

      {/* 에러 메시지 */}
      <div className="min-h-[1.25rem] mb-3 text-sm" role="status" aria-live="polite">
        {error && <span className="text-danger-600">{error}</span>}
      </div>

      {/* 작성 폼 */}
      <form className="grid gap-4" onSubmit={onSubmit}>
        <Input
          id="newpost-title"
          label="제목"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          fullWidth
          size="lg"
        />

        <Textarea
          id="newpost-content"
          label="본문"
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="본문을 입력하세요"
          minRows={8}
          fullWidth
        />

        <div className="pt-1">
          <Button
            as="button"
            type="submit"
            variant="primary"
            size="md"
            className="inline-flex items-center gap-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner size="sm" variant="white" /> 등록 중…
              </>
            ) : (
              "등록하기"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}