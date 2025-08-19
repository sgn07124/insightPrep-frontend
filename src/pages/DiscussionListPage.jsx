// src/pages/DiscussionListPage.jsx
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (p) => `${API_BASE}${p.startsWith("/") ? p : "/" + p}`;

async function fetchDiscussions({ page = 1 }) {
  const params = new URLSearchParams();
  params.set("page", String(page)); // size는 기본 10이라 생략
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
      status: it.status, // "OPEN" | "RESOLVED" 예상
      createdAt: it.createdAt,
    })),
    page: uiPage,
    totalPages: r.totalPages ?? 1,
  };
}

export default function DiscussionListPage(){
  const [sp, setSp] = useSearchParams();
  const status = sp.get("status") || "OPEN";
  const page = Number(sp.get("page") || 1);
  const [data, setData] = useState({ content: [], page, totalPages: 1 });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await fetchDiscussions({ status, page });
        if (!active) return;
        setData(d);
      } catch (e) {
        console.error("/post 목록 조회 실패:", e);
        if (!active) return;
        setData({ content: [], page, totalPages: 1 });
      }
    })();
    return () => { active = false; };
  }, [status, page]);

  const setStatus = (s)=> setSp({ status: s, page: "1" });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">토론 게시판</h1>
        <div className="inline-flex rounded-md border overflow-hidden">
          <button
            onClick={()=>setStatus("OPEN")}
            className={`px-4 h-10 ${status==="OPEN"?"bg-brand-600 text-white":"bg-white"}`}
          >토론 중</button>
          <button
            onClick={()=>setStatus("RESOLVED")}
            className={`px-4 h-10 border-l ${status==="RESOLVED"?"bg-brand-600 text-white":"bg-white"}`}
          >해결 완료</button>
        </div>
      </div>

      <ul className="bg-white border rounded-lg divide-y">
        {data.content.filter(it => it.status === status).map(it=>(
          <li key={it.id} className="p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <Link to={`/discussions/${it.id}`} className="font-semibold hover:underline truncate block">
                {it.title}
              </Link>
              <div className="text-sm text-ink-700 truncate">{it.question}</div>
              <div className="mt-1 flex gap-2 text-xs text-gray-500">
                <span className="inline-flex items-center rounded border px-2 py-0.5 bg-white">
                  {it.category}
                </span>
                <span>{new Date(it.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 shrink-0 rounded ${it.status === "OPEN" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
              {it.status === "OPEN" ? "토론 중" : "해결 완료"}
            </span>
          </li>
        ))}
      </ul>

      {/* 간단 페이지네이션 */}
      <nav className="mt-4 flex justify-center gap-2" aria-label="Pagination">
        <button
          className="px-3 h-9 border rounded-md"
          disabled={page<=1}
          onClick={()=>setSp({ status, page: String(page-1) })}
        >이전</button>
        <span className="px-3 h-9 flex items-center">{page} / {data.totalPages}</span>
        <button
          className="px-3 h-9 border rounded-md"
          disabled={page>=data.totalPages}
          onClick={()=>setSp({ status, page: String(page+1) })}
        >다음</button>
      </nav>
    </div>
  );
}