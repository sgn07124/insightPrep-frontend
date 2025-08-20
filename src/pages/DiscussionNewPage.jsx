// src/pages/DiscussionNewPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

const API_BASE = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (p) => `${API_BASE}${p.startsWith("/") ? p : "/" + p}`;

async function fetchAnswerPreview(answerId){
  const res = await fetch(apiUrl(`/question/${answerId}/preview`), {
    method: 'GET',
    credentials: 'include',
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.result) {
    throw new Error(data?.message || '연결 프리뷰를 불러오지 못했습니다.');
  }
  const q = data.result.question ?? '';
  const a = data.result.answer ?? '';
  return { answerId, question: q, answer: a };
}
async function createDiscussion({ answerId, title, content }){
  const res = await fetch(apiUrl('/post'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answerId, title, content })
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || '게시글 등록에 실패했습니다.');
  const id = data?.result?.postId ?? data?.postId ?? data?.id;
  if (typeof id !== 'number') throw new Error('생성된 글 ID를 확인할 수 없습니다.');
  return { id };
}

export default function DiscussionNewPage(){
  const [sp] = useSearchParams();
  const answerId = Number(sp.get("answerId"));
  const qpQuestion = sp.get("question");
  const qpAnswer = sp.get("answer");
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!answerId) { setLoading(false); return; }
    if (qpQuestion || qpAnswer) {
      setPreview({ answerId, question: qpQuestion || "", answer: qpAnswer || "" });
      setLoading(false);
      return;
    }
    fetchAnswerPreview(answerId).then((res) => { setPreview(res); setLoading(false); });
  }, [answerId, qpQuestion, qpAnswer]);

  const onSubmit = async (e)=>{
    e.preventDefault();
    setError('');
    if (!answerId) { setError('연결된 답변이 없습니다. /review에서 다시 시도해 주세요.'); return; }
    try {
      setSubmitting(true);
      const { id } = await createDiscussion({ answerId, title, content });
      navigate(`/discussions/${id}`);
    } catch (err) {
      setError(err?.message || '게시글 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
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
          <div className="text-xs text-gray-500 mb-1">연결된 질문</div>
          <div className="font-semibold mb-1 whitespace-pre-wrap">{preview.question || '(질문 내용 없음)'}</div>
          {preview.answer && (
            <div className="text-sm text-ink-700 whitespace-pre-wrap">내 답변: {preview.answer}</div>
          )}
        </div>
      ) : (
        <div className="mb-4 text-sm text-red-600">답변 연결이 없습니다. (/review에서 진입 권장)</div>
      )}

      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

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
        <button
          disabled={submitting}
          className={`h-11 rounded-md px-4 ${
            submitting
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'border border-brand-600 text-brand-600 bg-white hover:bg-brand-50'
          }`}
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              등록 중…
            </span>
          ) : '등록하기'}
        </button>
      </form>
    </div>
  );
}