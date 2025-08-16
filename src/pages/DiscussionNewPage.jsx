// src/pages/DiscussionNewPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

// 임시 모킹 (answerId로 미리보기)
async function fetchAnswerPreview(answerId){
  await new Promise(r=>setTimeout(r,200));
  return { answerId, question: "예) 트랜잭션 격리 수준을 설명하세요.", answerPreview: "예) 격리수준은 RC/RR/Serializable..." };
}
async function createDiscussion(payload){
  await new Promise(r=>setTimeout(r,400));
  return { id: Math.floor(Math.random()*10000) };
}

export default function DiscussionNewPage(){
  const [sp] = useSearchParams();
  const answerId = Number(sp.get("answerId"));
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(()=>{
    if(!answerId){ setLoading(false); return; }
    fetchAnswerPreview(answerId).then((res)=>{ setPreview(res); setLoading(false); });
  }, [answerId]);

  const onSubmit = async (e)=>{
    e.preventDefault();
    const { id } = await createDiscussion({ answerId, title, content });
    navigate(`/discussions/${id}`);
  };

  if(loading) return <div>불러오는 중…</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 text-sm">
        <Link to="/discussions" className="text-brand-600 hover:underline">← 목록으로</Link>
      </div>
      <h1 className="text-2xl font-bold mb-3">토론 글 작성</h1>

      {preview ? (
        <div className="mb-4 rounded-lg border bg-white p-4">
          <div className="text-xs text-gray-500 mb-1">연결된 답변 (Answer ID: {preview.answerId})</div>
          <div className="font-semibold mb-1">질문: {preview.question}</div>
          {preview.answerPreview && (
            <div className="text-sm text-ink-700">내 답변(요약): {preview.answerPreview}</div>
          )}
        </div>
      ) : (
        <div className="mb-4 text-sm text-red-600">답변 연결이 없습니다. (/review에서 진입 권장)</div>
      )}

      <form className="grid gap-3" onSubmit={onSubmit}>
        <input
          className="border rounded-md px-3 h-11"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={e=>setTitle(e.target.value)}
          required
        />
        <textarea
          className="border rounded-md p-3 min-h-[200px]"
          placeholder="본문을 입력하세요"
          value={content}
          onChange={e=>setContent(e.target.value)}
          required
        />
        <button className="h-11 rounded-md bg-brand-600 text-white hover:bg-brand-700">게시하기</button>
      </form>
    </div>
  );
}