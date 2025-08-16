// src/pages/DiscussionListPage.jsx
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

// 모킹
async function fetchDiscussions({ status="OPEN", page=1 }){
  await new Promise(r=>setTimeout(r,200));
  return {
    content: [
      { id: 501, title: "equals vs ==", status: "OPEN", createdAt:"2025-08-12" },
      { id: 502, title: "HTTP/2 서버푸시 논쟁", status: "RESOLVED", createdAt:"2025-08-11" },
    ],
    page, totalPages: 5
  };
}

export default function DiscussionListPage(){
  const [sp, setSp] = useSearchParams();
  const status = sp.get("status") || "OPEN";
  const page = Number(sp.get("page") || 1);
  const [data, setData] = useState({ content: [], page, totalPages: 1 });

  useEffect(()=>{
    fetchDiscussions({ status, page }).then(setData);
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
        {data.content.map(it=>(
          <li key={it.id} className="p-4 flex items-center justify-between">
            <div>
              <Link to={`/discussions/${it.id}`} className="font-semibold hover:underline">
                {it.title}
              </Link>
              <div className="text-xs text-gray-500">{it.createdAt}</div>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${it.status==="OPEN"?"bg-amber-100 text-amber-800":"bg-emerald-100 text-emerald-800"}`}>
              {it.status==="OPEN" ? "토론 중" : "해결 완료"}
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