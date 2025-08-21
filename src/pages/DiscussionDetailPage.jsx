// src/pages/DiscussionDetailPage.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import Spinner from "@/shared/ui/Spinner";

const API_BASE = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (p) => `${API_BASE}${p.startsWith("/") ? p : "/" + p}`;

async function addComment(postId, content) {
  const res = await fetch(apiUrl(`/post/${postId}/comments`), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "댓글 등록에 실패했습니다.");
  return data;
}

export default function DiscussionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [comment, setComment] = useState("");
  const [resolving, setResolving] = useState(false);
  const [cLoading, setCLoading] = useState(false);
  const [cError, setCError] = useState("");
  const [posting, setPosting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(apiUrl(`/post/${id}`), {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json().catch(() => null);
        if (!mounted) return;
        if (!res.ok || !data?.result)
          throw new Error(data?.message || "상세를 불러오지 못했습니다.");
        const r = data.result;
        setData({
          id: r.postId,
          title: r.title,
          content: r.content,
          status: r.status,
          createdAt: r.createdAt,
          authorId: r.authorId,
          authorNickname: r.authorNickname,
          questionId: r.questionId,
          category: r.category,
          question: r.question,
          answerId: r.answerId,
          answer: r.answer,
          feedbackId: r.feedbackId,
          score: r.score,
          improvement: r.improvement,
          modelAnswer: r.modelAnswer,
          myPost: !!r.myPost,
          commentCount: typeof r.commentCount === "number" ? r.commentCount : 0,
          comments: [],
        });
      } catch (e) {
        console.error("/post/{id} 상세 조회 실패:", e);
        if (!mounted) return;
        setData(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function loadComments(page = 1) {
    if (!data) return;
    setCError("");
    setCLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("size", String(30));
      const res = await fetch(apiUrl(`/post/${data.id}/comments?${params.toString()}`), {
        method: "GET",
        credentials: "include",
      });
      const d = await res.json().catch(() => null);
      if (!res.ok || !d?.result) throw new Error(d?.message || "댓글을 불러오지 못했습니다.");
      const r = d.result;
      const list = (r.content || []).map((it) => ({
        id: it.commentId,
        authorId: it.authorId,
        authorNickname: it.authorNickname,
        content: it.content,
        createdAt: it.createdAt,
        mine: !!it.mine,
      }));
      setData((prev) =>
        prev
          ? {
              ...prev,
              comments: list,
              commentCount:
                typeof r.totalElements === "number"
                  ? r.totalElements
                  : prev.commentCount ?? list.length,
            }
          : prev
      );
    } catch (e) {
      setCError("댓글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setCLoading(false);
    }
  }

  useEffect(() => {
    if (data?.id) {
      loadComments(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  async function updateComment(commentId, content) {
    const res = await fetch(apiUrl(`/post/${data.id}/comments/${commentId}`), {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const d = await res.json().catch(() => null);
    if (!res.ok) throw new Error(d?.message || "댓글 수정에 실패했습니다.");
    return d;
  }

  async function deleteComment(commentId) {
    const res = await fetch(apiUrl(`/post/${data.id}/comments/${commentId}`), {
      method: "DELETE",
      credentials: "include",
    });
    const d = await res.json().catch(() => null);
    if (!res.ok) throw new Error(d?.message || "댓글 삭제에 실패했습니다.");
    return d;
  }

  async function markResolved() {
    if (!data) return;
    if (!window.confirm("이 글을 해결 완료 상태로 변경할까요?")) return;
    try {
      setResolving(true);
      const res = await fetch(apiUrl(`/post/${data.id}/resolve`), {
        method: "PATCH",
        credentials: "include",
      });
      const d = await res.json().catch(() => null);
      if (!res.ok || d?.code !== "SUCCESS") throw new Error(d?.message || "변경 실패");
      setData((prev) => (prev ? { ...prev, status: "RESOLVED" } : prev));
    } catch (e) {
      alert("상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setResolving(false);
    }
  }

  if (!data)
    return (
      <div className="container-page mx-auto max-w-3xl px-4 py-10 text-ink-600 inline-flex items-center gap-2">
        <Spinner size="sm" /> 불러오는 중…
      </div>
    );

  return (
    <div className="container-page mx-auto max-w-3xl px-4">
      {/* 상단 네비 */}
      <div className="mb-4 text-sm">
        <Button as={Link} to="/discussions" variant="ghost" size="sm">
          ← 목록으로
        </Button>
      </div>

      {/* 헤더 영역 */}
      <div className="mb-4 rounded-2xl border border-surface-border bg-surface-card p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded ${
              data.status === "OPEN"
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {data.status === "OPEN" ? "토론 중" : "해결 완료"}
          </span>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-ink-900">
            {data.title}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            {data.myPost && data.status !== "RESOLVED" && (
              <Button
                as="button"
                onClick={markResolved}
                disabled={resolving}
                variant="outline"
                size="sm"
              >
                {resolving ? "변경 중…" : "해결 완료로 변경"}
              </Button>
            )}
            {data.myPost && (
              <Button
                as={Link}
                to={`/review?open=${data.questionId}`}
                variant="secondary"
                size="sm"
              >
                질문으로 이동
              </Button>
            )}
          </div>
        </div>
        <div className="mt-2 text-xs text-ink-500">
          작성자: {data.authorNickname ?? "알 수 없음"} · {data.createdAt ? new Date(data.createdAt).toLocaleString() : ""}
        </div>
      </div>

      {/* 연결된 질문 / 답변 / 피드백 */}
      <section className="mb-6 grid gap-3">
        <div className="rounded-2xl border border-surface-border bg-surface-card p-4 shadow-card">
          {/* 상단 메타 + 점수 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded border border-surface-border bg-white px-2 py-0.5 text-xs text-ink-700">
              카테고리: {data.category}
            </span>
            <div className="ml-auto text-right">
              {typeof data.score === "number" && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  점수 {data.score}
                </span>
              )}
            </div>
          </div>

          {/* 질문 */}
          <div className="mt-3">
            <div className="text-[11px] uppercase tracking-wide text-ink-500 font-semibold mb-1">질문</div>
            <div className="rounded-lg border border-surface-border bg-white p-3 text-ink-900 whitespace-pre-wrap">
              {data.question}
            </div>
          </div>

          {/* 내 답변 */}
          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-wide text-ink-500 font-semibold mb-1">내 답변</div>
            <div className="rounded-lg border border-surface-border bg-white p-3 text-ink-800 whitespace-pre-wrap">
              {data.answer ?? "(답변 없음)"}
            </div>
          </div>

          {/* 피드백 */}
          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-wide text-ink-500 font-semibold mb-2">피드백</div>
            {data.improvement || data.modelAnswer ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-surface-border bg-white p-3">
                  <div className="text-xs font-semibold text-ink-500 mb-1">개선점</div>
                  <div className="text-ink-800 whitespace-pre-wrap">{data.improvement || "(개선점 없음)"}</div>
                </div>
                <div className="rounded-lg border border-surface-border bg-white p-3">
                  <div className="text-xs font-semibold text-ink-500 mb-1">모범 답안</div>
                  <div className="text-ink-800 whitespace-pre-wrap">{data.modelAnswer || "(모범 답안 없음)"}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-surface-border bg-surface-soft p-3 text-sm text-ink-500">
                (피드백 없음)
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 본문 */}
      <article className="mb-6 rounded-2xl border border-surface-border bg-surface-card p-4 shadow-card whitespace-pre-wrap text-ink-900">
        {data.content}
      </article>

      {/* 댓글 */}
      <section className="rounded-2xl border border-surface-border bg-surface-card shadow-card">
        <div className="p-4 border-b border-surface-border flex items-center justify-between">
          <div className="font-semibold">
            댓글 <span className="text-sm text-ink-500">({data.commentCount ?? 0})</span>
          </div>
          <Button
            as="button"
            onClick={() => {
              setEditingId(null);
              setEditText("");
              loadComments(1);
            }}
            disabled={cLoading}
            variant="ghost"
            size="sm"
          >
            {cLoading ? "새로고침 중…" : "새로고침"}
          </Button>
        </div>
        {cError && <div className="p-4 text-sm text-danger-600">{cError}</div>}
        {!data.comments || data.comments.length === 0 ? (
          <div className="p-4 text-sm text-ink-500">아직 댓글이 없습니다.</div>
        ) : (
          <ul className="divide-y divide-surface-border">
            {data.comments.map((c) => (
              <li key={c.id} className="p-4">
                <div className="text-sm flex items-center gap-2">
                  <span className="font-semibold truncate">{c.authorNickname}</span>
                  {c.mine && (
                    <span className="text-[11px] inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      내 댓글
                    </span>
                  )}
                  <span className="text-ink-400 ml-auto shrink-0">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                  </span>
                </div>

                {editingId === c.id ? (
                  <div className="mt-2">
                    <textarea
                      className="w-full rounded-md border border-surface-border bg-white p-2 min-h-[80px] text-ink-900"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      disabled={updatingId === c.id}
                    />
                    <div className="mt-2 flex gap-2">
                      <Button
                        as="button"
                        onClick={async () => {
                          if (!editText.trim()) return;
                          try {
                            setUpdatingId(c.id);
                            await updateComment(c.id, editText.trim());
                            setEditingId(null);
                            setEditText("");
                            await loadComments(1);
                          } catch (e) {
                            alert("댓글 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.");
                          } finally {
                            setUpdatingId(null);
                          }
                        }}
                        disabled={updatingId === c.id}
                        variant="primary"
                        size="sm"
                      >
                        {updatingId === c.id ? "저장 중…" : "저장"}
                      </Button>
                      <Button
                        as="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditText("");
                        }}
                        variant="outline"
                        size="sm"
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-1 whitespace-pre-wrap text-ink-800">{c.content}</div>
                    {c.mine && (
                      <div className="mt-2 flex gap-2">
                        <Button
                          as="button"
                          onClick={() => {
                            setEditingId(c.id);
                            setEditText(c.content);
                          }}
                          variant="secondary"
                          size="sm"
                        >
                          수정
                        </Button>
                        <Button
                          as="button"
                          onClick={async () => {
                            if (!window.confirm("댓글을 삭제할까요?")) return;
                            try {
                              setDeletingId(c.id);
                              await deleteComment(c.id);
                              await loadComments(1);
                            } catch (e) {
                              alert("댓글 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
                            } finally {
                              setDeletingId(null);
                            }
                          }}
                          disabled={deletingId === c.id}
                          variant="outline"
                          size="sm"
                        >
                          {deletingId === c.id ? "삭제 중…" : "삭제"}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* 댓글 작성 */}
        <form
          className="p-4 flex gap-2 border-t border-surface-border"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!comment.trim()) return;
            try {
              setPosting(true);
              await addComment(id, comment.trim());
              setComment("");
              await loadComments(1);
            } catch (err) {
              alert("댓글 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
            } finally {
              setPosting(false);
            }
          }}
        >
          <Input
            id="new-comment"
            placeholder="댓글을 입력하세요"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            size="lg"
            disabled={posting}
          />
          <Button
            as="button"
            type="submit"
            variant="primary"
            size="lg"
            disabled={posting}
            className="whitespace-nowrap"
          >
            {posting ? "등록 중…" : "등록"}
          </Button>
        </form>
      </section>

      {/* 하단 네비 */}
      <div className="py-6 flex justify-end">
        <Button as="button" variant="ghost" size="sm" onClick={() => navigate("/discussions")}>목록으로</Button>
      </div>
    </div>
  );
}