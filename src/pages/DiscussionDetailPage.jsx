// src/pages/DiscussionDetailPage.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

// 모킹
async function fetchDiscussion(id){
  await new Promise(r=>setTimeout(r,200));
  return {
    id,
    questionId: 103,
    question: "트랜잭션 격리 수준을 설명하세요.",
    title: "Repeatable Read와 Phantom Read 차이?",
    content: "여기 본문 내용...",
    status: "OPEN",
    comments: [
      { id:1, author:{nickname:"kim"}, content:"MVCC에서 어떻게 처리되나요?", createdAt:"2025-08-12 10:20" }
    ]
  };
}
async function fetchReviewByQuestionId(questionId){
  await new Promise(r=>setTimeout(r,250));
  return {
    questionId,
    question: "트랜잭션 격리 수준을 설명하세요.",
    answer: "RR/RC/Repeatable Read/Serializable 차이를 정리했고, MVCC에서의 동작을 언급했습니다.",
    feedback: "핵심 키워드 양호. Phantom Read 예시와 GAP LOCK 언급까지 있으면 더 좋음.",
  };
}
async function addComment(id, content){
  await new Promise(r=>setTimeout(r,150));
  return { ok: true };
}

export default function DiscussionDetailPage(){
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [bundle, setBundle] = useState(null); // 질문/답변/피드백 묶음
  const [comment, setComment] = useState("");

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      const d = await fetchDiscussion(id);
      if (!mounted) return;
      setData(d);

      if (d?.questionId){
        const b = await fetchReviewByQuestionId(d.questionId);
        if (!mounted) return;
        setBundle(b);
      }
    })();
    return ()=>{ mounted = false; };
  }, [id]);

  if(!data) return <div>불러오는 중…</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-3 text-sm">
        <Link to="/discussions" className="text-brand-600 hover:underline">← 목록</Link>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded ${data.status==="OPEN"?"bg-amber-100 text-amber-800":"bg-emerald-100 text-emerald-800"}`}>
          {data.status==="OPEN"?"토론 중":"해결 완료"}
        </span>
        <h1 className="text-2xl font-bold">{data.title}</h1>
      </div>

      {/* 연결된 질문 미리보기 */}
      <div className="mb-4 rounded-lg border bg-white p-4">
        <div className="text-xs text-gray-500 mb-1">연결된 질문 (ID: {data.questionId})</div>
        <div className="font-semibold">{data.question}</div>
        <div className="mt-1 text-xs text-gray-500">
          작성자: {data.author?.nickname ?? "알 수 없음"} · {data.createdAt ?? ""}
        </div>
      </div>

      {/* 내 답변 & 피드백 */}
      <section className="mb-4 grid gap-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs font-semibold text-ink-500 mb-1">내 답변</div>
          <div className="whitespace-pre-wrap">
            {bundle?.answer ?? "답변 정보를 불러오는 중..."}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs font-semibold text-ink-500 mb-1">피드백</div>
          <div className="whitespace-pre-wrap">
            {bundle?.feedback ?? "피드백 정보를 불러오는 중..."}
          </div>
        </div>
      </section>

      <article className="mb-6 rounded-lg border bg-white p-4 whitespace-pre-wrap">
        {data.content}
      </article>

      {/* 댓글 */}
      <section className="rounded-lg border bg-white">
        <div className="p-4 border-b font-semibold">댓글</div>
        <ul className="divide-y">
          {data.comments.map(c=>(
            <li key={c.id} className="p-4">
              <div className="text-sm"><span className="font-semibold">{c.author.nickname}</span> · <span className="text-gray-500">{c.createdAt}</span></div>
              <div className="mt-1 whitespace-pre-wrap">{c.content}</div>
            </li>
          ))}
        </ul>

        <form
          className="p-4 flex gap-2"
          onSubmit={async (e)=>{ e.preventDefault(); await addComment(id, comment); setComment(""); /* TODO: 리프레시 */ }}
        >
          <input
            className="flex-1 border rounded-md px-3 h-11"
            placeholder="댓글을 입력하세요"
            value={comment}
            onChange={e=>setComment(e.target.value)}
            required
          />
          <button className="px-4 h-11 rounded-md bg-brand-600 text-white">등록</button>
        </form>
      </section>
    </div>
  );
}