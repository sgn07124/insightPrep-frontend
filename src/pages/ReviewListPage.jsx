import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";

const API_BASE = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (p) => `${API_BASE}${p.startsWith("/") ? p : "/" + p}`;

async function fetchReviewList({ page, size, q }) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (size && Number(size) !== 10) params.set("size", String(size));
  if (q) params.set("q", q);

  const res = await fetch(apiUrl(`/question?${params.toString()}`), {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json().catch(() => null);

  if (!res.ok || data?.code !== "GET_QUESTIONS_SUCCESS") {
    const msg = data?.message || "목록 조회에 실패했습니다.";
    throw new Error(msg);
  }

  const result = data.result || {};
  const serverPage = typeof result.page === "number" ? result.page : undefined;
  let uiPage = page;
  if (typeof serverPage === "number") {
    uiPage = serverPage === page ? serverPage : serverPage + 1;
  }

  return {
    content: result.content || [],
    page: uiPage,
    size: result.size ?? size ?? 10,
    totalPages: result.totalPages ?? 1,
    totalElements: result.totalElements ?? 0,
  };
}

export default function ReviewListPage() {
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get("page") || 1);
  const size = Number(sp.get("size") || 10);
  const q = sp.get("q") || "";
  const openFromUrl = useMemo(() => Number(sp.get("open")) || null, [sp]);

  const [items, setItems] = useState([]);
  const [openId, setOpenId] = useState(openFromUrl);
  const [meta, setMeta] = useState({ page, size, totalPages: 1, totalElements: 0 });
  const [search, setSearch] = useState(q);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetchReviewList({ page, size, q });
        if (!active) return;
        setItems(res.content);
        setMeta({ page: res.page, size: res.size, totalPages: res.totalPages, totalElements: res.totalElements });
      } catch (e) {
        console.error("/question 목록 조회 실패:", e);
      }
    })();
    return () => { active = false; };
  }, [page, size, q]);

  useEffect(() => {
    const next = new URLSearchParams();
    next.set("page", String(page));
    if (size !== 10) next.set("size", String(size));
    if (q) next.set("q", q);
    if (openId) next.set("open", String(openId));
    setSp(next, { replace: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  const toggle = (id) => {
    const next = openId === id ? null : id;
    setOpenId(next);
  };

  const onDelete = async (answerId) => {
    if (!window.confirm("해당 질문을 삭제하시겠습니까?")) return;
    setDeletingId(answerId);
    try {
      const res = await fetch(apiUrl(`/question/${answerId}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("DELETE_FAILED");
      const d = await res.json().catch(() => null);
      if (d?.code !== "DELETE_QUESTION_SUCCESS") throw new Error("DELETE_FAILED");

      setItems((prev) => prev.filter((x) => x.answerId !== answerId));
      setMeta((m) => ({ ...m, totalElements: Math.max(0, m.totalElements - 1) }));
      if (openId && items.find?.((x) => x.answerId === answerId)?.questionId === openId) setOpenId(null);
    } catch (e) {
      alert("삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDeletingId(null);
    }
  };

  const doSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams();
    next.set("page", "1");
    if (size !== 10) next.set("size", String(size));
    if (search) next.set("q", search);
    setSp(next);
  };

  return (
    <div className="container-page mx-auto max-w-4xl px-4">
      {/* Page header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink-900">나의 기록</h1>
        <p className="mt-1 text-sm text-ink-600">면접에서 푼 문제의 질문, 나의 답변, 피드백을 한 곳에서 확인해요.</p>
      </header>

      {/* 검색 영역 */}
      <form onSubmit={doSearch} className="mb-5 flex gap-2">
        <Input
          id="review-search"
          placeholder="질문 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          className="h-11"
        />
        <Button as="button" type="submit" variant="primary" className="px-5 h-11 whitespace-nowrap">검색</Button>
      </form>

      {/* 목록 */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-surface-border bg-surface-card text-center py-16 shadow-card">
          <p className="text-ink-600">아직 기록이 없어요. 인터뷰를 시작해 보세요!</p>
          <div className="mt-4">
            <Button as={Link} to="/interview" variant="primary">AI 면접 시작하기</Button>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => {
            const isOpen = openId === it.questionId;
            return (
              <li key={it.questionId} className="rounded-2xl border border-surface-border bg-surface-card shadow-card overflow-hidden">
                <button
                  className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 hover:bg-surface-soft/60"
                  aria-expanded={isOpen}
                  aria-controls={`panel-${it.questionId}`}
                  id={`disclosure-${it.questionId}`}
                  onClick={() => toggle(it.questionId)}
                >
                  <div>
                    <div className="font-semibold text-ink-900 line-clamp-2">{it.question}</div>
                    <div className="mt-1 text-xs text-ink-500 flex items-center gap-2">
                      <span className="inline-flex items-center rounded border border-surface-border bg-white px-2 py-0.5">{it.category}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-ink-300">{isOpen ? "▾" : "▸"}</span>
                </button>

                {isOpen && (
                  <div
                    id={`panel-${it.questionId}`}
                    role="region"
                    aria-labelledby={`disclosure-${it.questionId}`}
                    className="border-t border-surface-border bg-surface-soft px-4 py-4"
                  >
                    <div className="grid gap-4">
                      <div>
                        <div className="text-xs font-semibold text-ink-500 mb-1">내 답변</div>
                        <div className="rounded-md border border-surface-border bg-white p-3 whitespace-pre-wrap text-ink-800">{it.answer}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-ink-500 mb-1">피드백</div>
                        <div className="rounded-md border border-surface-border bg-white p-3 whitespace-pre-wrap text-ink-800">
                          <div className="mb-2"><span className="font-medium">점수:</span> {it.score}</div>
                          <div className="mb-2">
                            <div className="text-xs font-semibold text-ink-500 mb-1">개선점</div>
                            <div>{it.improvement}</div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-ink-500 mb-1">모범 답안</div>
                            <div className="whitespace-pre-wrap">{it.modelAnswer}</div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 flex flex-wrap gap-2">
                        <Button
                          as={Link}
                          to={`/discussions/new?answerId=${it.answerId}`}
                          variant="primary"
                        >
                          질문하기
                        </Button>
                        <Button
                          as="button"
                          type="button"
                          onClick={() => onDelete(it.answerId)}
                          disabled={deletingId === it.answerId}
                          variant="outline"
                        >
                          {deletingId === it.answerId ? "삭제 중…" : "삭제하기"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* 페이지네이션 */}
      {meta.totalPages > 1 && (
        <nav className="mt-6 flex justify-center gap-1" aria-label="Pagination">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => {
                const next = new URLSearchParams();
                next.set("page", String(n));
                if (size !== 10) next.set("size", String(size));
                if (q) next.set("q", q);
                setSp(next);
              }}
              aria-current={meta.page === n ? "page" : undefined}
              className={`h-9 min-w-9 rounded-md border px-3 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-600/40 ${
                meta.page === n
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-ink-700 border-surface-border hover:bg-surface-soft"
              }`}
            >
              {n}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}