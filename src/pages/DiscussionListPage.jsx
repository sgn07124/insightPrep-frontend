// src/pages/DiscussionListPage.jsx
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "@/shared/ui/Button";

const API_BASE = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (p) => `${API_BASE}${p.startsWith("/") ? p : "/" + p}`;

async function fetchDiscussions({ page = 1 }) {
  const params = new URLSearchParams();
  params.set("page", String(page)); // size는 기본 10
  const res = await fetch(apiUrl(`/post?${params.toString()}`), {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.result) {
    throw new Error(data?.message || "게시글 목록을 불러오지 못했습니다.");
  }
  const r = data.result;

  // 페이지 인덱스 정규화 (서버 0-based 가정 대응)
  const serverPage = typeof r.page === "number" ? r.page : undefined;
  let uiPage = page;
  if (typeof serverPage === "number") {
    uiPage = serverPage === page ? serverPage : serverPage + 1;
  }

  return {
    content: (r.content || []).map((it) => ({
      id: it.postId,
      title: it.title,
      question: it.question,
      category: it.category,
      status: it.status, // "OPEN" | "RESOLVED"
      createdAt: it.createdAt,
    })),
    page: uiPage,
    totalPages: r.totalPages ?? 1,
  };
}

export default function DiscussionListPage() {
  const [sp, setSp] = useSearchParams();
  const status = sp.get("status") || "OPEN"; // OPEN | RESOLVED
  const page = Number(sp.get("page") || 1);
  const [data, setData] = useState({ content: [], page, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const d = await fetchDiscussions({ page });
        if (!active) return;
        setData(d);
      } catch (e) {
        console.error("/post 목록 조회 실패:", e);
        if (!active) return;
        setError("목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setData({ content: [], page, totalPages: 1 });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [page]);

  const setStatus = (s) => setSp({ status: s, page: "1" });

  const list = data.content.filter((it) => it.status === status);

  return (
    <div className="container-page mx-auto max-w-4xl px-4">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink-900">토론 게시판</h1>
          <p className="mt-1 text-sm text-ink-600">질문을 공유하고 함께 토론해 보세요.</p>
        </div>
        <div className="inline-flex rounded-xl border border-surface-border bg-white shadow-card overflow-hidden">
          <button
            onClick={() => setStatus("OPEN")}
            className={`flex-1 px-4 h-10 text-sm font-medium transition-colors ${
              status === "OPEN"
                ? "bg-brand-600 text-white"
                : "bg-white text-ink-700 hover:bg-surface-soft"
            } border-r border-surface-border`}
            aria-pressed={status === "OPEN"}
            type="button"
          >
            토론 중
          </button>
          <button
            onClick={() => setStatus("RESOLVED")}
            className={`flex-1 px-4 h-10 text-sm font-medium transition-colors whitespace-nowrap ${
              status === "RESOLVED"
                ? "bg-brand-600 text-white"
                : "bg-white text-ink-700 hover:bg-surface-soft"
            }`}
            aria-pressed={status === "RESOLVED"}
            type="button"
          >
            해결 완료
          </button>
        </div>
      </header>

      {/* Error / Loading */}
      {error && (
        <div className="mb-4 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-danger-700">
          {error}
        </div>
      )}

      {/* List */}
      <section className="rounded-2xl border border-surface-border bg-surface-card shadow-card overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-ink-600">불러오는 중…</div>
        ) : list.length === 0 ? (
          <div className="p-10 text-center text-ink-600 text-sm">해당 상태의 게시글이 없습니다.</div>
        ) : (
          <ul className="divide-y divide-surface-border">
            {list.map((it) => (
              <li key={it.id} className="p-4 md:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      to={`/discussions/${it.id}`}
                      className="font-semibold text-ink-900 hover:underline block truncate"
                      title={it.title}
                    >
                      {it.title}
                    </Link>
                    <div className="mt-1 text-sm text-ink-700 line-clamp-2">{it.question}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-500">
                      <span className="inline-flex items-center rounded border border-surface-border bg-white px-2 py-0.5">
                        {it.category}
                      </span>
                      <span className="shrink-0">{it.createdAt ? new Date(it.createdAt).toLocaleDateString() : ""}</span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-xs px-2 py-1 rounded ${
                      it.status === "OPEN" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {it.status === "OPEN" ? "토론 중" : "해결 완료"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pagination */}
      <nav className="mt-6 flex justify-center items-center gap-2" aria-label="Pagination">
        <Button
          as="button"
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => setSp({ status, page: String(page - 1) })}
        >
          이전
        </Button>
        <span className="px-3 h-9 inline-flex items-center text-sm text-ink-600">
          {page} / {data.totalPages}
        </span>
        <Button
          as="button"
          size="sm"
          variant="outline"
          disabled={page >= data.totalPages}
          onClick={() => setSp({ status, page: String(page + 1) })}
        >
          다음
        </Button>
      </nav>
    </div>
  );
}