import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_BASE = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (p) => `${API_BASE}${p.startsWith("/") ? p : "/" + p}`;

async function fetchReviewList({ page, size, q }) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  // 서버 기본값이 10이므로, 10이 아닐 때만 size를 붙입니다.
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
  // Normalize page index: support both 0-based (e.g., Spring Data) and 1-based APIs
  const serverPage = typeof result.page === "number" ? result.page : undefined;
  let uiPage = page;
  if (typeof serverPage === "number") {
    // If the API is 0-based, serverPage will equal (client page - 1)
    // If it's 1-based, serverPage will equal client page
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
      // TODO: 실제 삭제 엔드포인트 확인 필요. 가정: DELETE /question/{answerId}
      const res = await fetch(apiUrl(`/question/${answerId}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("DELETE_FAILED");
      const d = await res.json().catch(() => null);
      if (d?.code !== "DELETE_QUESTION_SUCCESS") throw new Error("DELETE_FAILED");

      // 현재 페이지 유지: 목록에서만 제거
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
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">나의 기록</h1>

      {/* 검색 */}
      <form onSubmit={doSearch} className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="질문 검색"
          className="h-11 flex-1 rounded-md border px-3"
        />
        <button className="h-11 px-4 rounded-md bg-brand-600 text-white hover:bg-brand-700">검색</button>
      </form>

      {/* 목록 */}
      <ul className="space-y-3">
        {items.map((it) => {
          const isOpen = openId === it.questionId;

          return (
            <li key={it.questionId} className="rounded-xl border bg-white shadow-sm">
              <button
                className="w-full text-left p-4 flex items-start justify-between gap-3"
                aria-expanded={isOpen}
                aria-controls={`panel-${it.questionId}`}
                id={`disclosure-${it.questionId}`}
                onClick={() => toggle(it.questionId)}
              >
                <div>
                  <div className="font-semibold">{it.question}</div>
                  <div className="text-xs text-ink-500">카테고리: {it.category}</div>
                </div>
                <span className="shrink-0 text-ink-300">{isOpen ? "▾" : "▸"}</span>
              </button>

              {isOpen && (
                <div
                  id={`panel-${it.questionId}`}
                  role="region"
                  aria-labelledby={`disclosure-${it.questionId}`}
                  className="border-t p-4 bg-surface-soft rounded-b-xl"
                >
                  <div className="grid gap-3">
                    <div className="flex items-center gap-2 text-xs text-ink-500">
                      <span className="inline-flex items-center rounded border px-2 py-0.5 bg-white">{it.category}</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-ink-500 mb-1">내 답변</div>
                      <div className="rounded-md border bg-white p-3 whitespace-pre-wrap">{it.answer}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-ink-500 mb-1">피드백</div>
                      <div className="rounded-md border bg-white p-3 whitespace-pre-wrap">
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
                    <div className="pt-2 flex gap-2">
                      <Link
                        to={`/discussions/new?answerId=${it.answerId}`}
                        className="inline-flex h-10 items-center rounded-md border border-brand-600 px-4 text-brand-600 bg-white hover:bg-brand-50"
                      >
                        질문하기
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(it.answerId)}
                        disabled={deletingId === it.answerId}
                        className={`inline-flex h-10 items-center rounded-md border px-4 ${
                          deletingId === it.answerId
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-white text-ink-700 hover:bg-surface-soft"
                        }`}
                        aria-disabled={deletingId === it.answerId}
                      >
                        {deletingId === it.answerId ? "삭제 중…" : "삭제하기"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* 페이지네이션(번호형 간단 버전) */}
      <nav className="mt-5 flex justify-center gap-1" aria-label="Pagination">
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
            className={`h-9 min-w-9 rounded-md border px-3 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${
              meta.page === n
                ? "bg-indigo-600 text-white border-transparent"
                : "bg-white text-ink-700 hover:bg-surface-soft"
            }`}
          >
            {n}
          </button>
        ))}
      </nav>
    </div>
  );
}