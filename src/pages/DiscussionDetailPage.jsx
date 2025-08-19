// src/pages/DiscussionDetailPage.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (p) => `${API_BASE}${p.startsWith("/") ? p : "/" + p}`;

async function addComment(postId, content){
  const res = await fetch(apiUrl(`/post/${postId}/comments`), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || '댓글 등록에 실패했습니다.');
  return data;
}

export default function DiscussionDetailPage(){
  const { id } = useParams();
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
        if (!res.ok || !data?.result) throw new Error(data?.message || "상세를 불러오지 못했습니다.");
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
          commentCount: typeof r.commentCount === 'number' ? r.commentCount : 0,
          comments: [], // TODO: 댓글 API 연결 시 교체
        });
        loadComments(1);
      } catch (e) {
        console.error("/post/{id} 상세 조회 실패:", e);
        if (!mounted) return;
        setData(null);
      }
    })();
    return () => { mounted = false; };
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
        method: 'GET',
        credentials: 'include',
      });
      const d = await res.json().catch(() => null);
      if (!res.ok || !d?.result) throw new Error(d?.message || '댓글을 불러오지 못했습니다.');
      const r = d.result;
      const list = (r.content || []).map(it => ({
        id: it.commentId,
        authorId: it.authorId,
        authorNickname: it.authorNickname,
        content: it.content,
        createdAt: it.createdAt,
        mine: !!it.mine,
      }));
      setData(prev => prev ? { ...prev, comments: list, commentCount: typeof r.totalElements === 'number' ? r.totalElements : (prev.commentCount ?? list.length) } : prev);
    } catch (e) {
      setCError('댓글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setCLoading(false);
    }
  }

  async function updateComment(commentId, content){
    const res = await fetch(apiUrl(`/post/${data.id}/comments/${commentId}`), {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    const d = await res.json().catch(()=>null);
    if (!res.ok) throw new Error(d?.message || '댓글 수정에 실패했습니다.');
    return d;
  }

  async function deleteComment(commentId){
    const res = await fetch(apiUrl(`/post/${data.id}/comments/${commentId}`), {
      method: 'DELETE',
      credentials: 'include',
    });
    const d = await res.json().catch(()=>null);
    if (!res.ok) throw new Error(d?.message || '댓글 삭제에 실패했습니다.');
    return d;
  }

  async function markResolved(){
    if(!data) return;
    if(!window.confirm('이 글을 해결 완료 상태로 변경할까요?')) return;
    try{
      setResolving(true);
      const res = await fetch(apiUrl(`/post/${data.id}/resolve`), {
        method: 'PATCH',
        credentials: 'include',
      });
      const d = await res.json().catch(()=>null);
      if(!res.ok || d?.code !== 'SUCCESS') throw new Error(d?.message || '변경 실패');
      setData(prev => prev ? { ...prev, status: 'RESOLVED' } : prev);
    }catch(e){
      alert('상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }finally{
      setResolving(false);
    }
  }

  if(!data) return <div>불러오는 중…</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-3 text-sm">
        <Link to="/discussions" className="text-brand-600 hover:underline">← 목록</Link>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded ${data.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
          {data.status === 'OPEN' ? '토론 중' : '해결 완료'}
        </span>
        <h1 className="text-2xl font-bold mr-2">{data.title}</h1>
        {data.myPost && (
          <div className="ml-auto flex items-center gap-2">
            {data.status !== 'RESOLVED' && (
              <button
                type="button"
                onClick={markResolved}
                disabled={resolving}
                className={`h-9 px-3 rounded-md border ${
                  resolving
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'border-brand-600 text-brand-700 bg-white hover:bg-brand-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-600/50'
                }`}
              >
                {resolving ? '변경 중…' : '해결 완료로 변경'}
              </button>
            )}
            <Link
              to={`/review?open=${data.questionId}`}
              className="h-9 px-3 inline-flex items-center rounded-md border border-brand-600 text-brand-600 bg-white hover:bg-brand-50"
            >
              질문으로 이동
            </Link>
          </div>
        )}
      </div>

      <div className="mb-4 rounded-lg border bg-white p-4">
        <div className="text-xs text-gray-500 mb-1">카테고리: {data.category}</div>
        <div className="font-semibold">{data.question}</div>
        <div className="mt-1 text-xs text-gray-500">
          작성자: {data.authorNickname ?? "알 수 없음"} · {data.createdAt ? new Date(data.createdAt).toLocaleString() : ""}
        </div>
      </div>

      <section className="mb-4 grid gap-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs font-semibold text-ink-500 mb-1">내 답변</div>
          <div className="whitespace-pre-wrap">{data.answer ?? "(답변 없음)"}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-ink-500">피드백</div>
            {typeof data.score === 'number' && (
              <span className="text-xs inline-flex items-center px-2 py-0.5 rounded bg-surface">점수: {data.score}</span>
            )}
          </div>
          <div className="mt-2 whitespace-pre-wrap">
            {data.improvement ? (
              <>
                <div className="text-xs font-semibold text-ink-500 mb-1">개선점</div>
                <div className="rounded-md border bg-white p-3 mb-3">{data.improvement}</div>
                <div className="text-xs font-semibold text-ink-500 mb-1">모범 답안</div>
                <div className="rounded-md border bg-white p-3 whitespace-pre-wrap">{data.modelAnswer}</div>
              </>
            ) : (
              <span className="text-ink-500 text-sm">(피드백 없음)</span>
            )}
          </div>
        </div>
      </section>

      <article className="mb-6 rounded-lg border bg-white p-4 whitespace-pre-wrap">
        {data.content}
      </article>

      <section className="rounded-lg border bg-white">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">댓글 <span className="text-sm text-gray-500">({data.commentCount ?? 0})</span></div>
          <button
            type="button"
            onClick={() => { setEditingId(null); setEditText(""); loadComments(1); }}
            disabled={cLoading}
            className={`h-9 px-3 rounded-md border ${cLoading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-surface-soft'}`}
          >
            {cLoading ? '새로고침 중…' : '새로고침'}
          </button>
        </div>
        {cError && <div className="p-4 text-sm text-red-600">{cError}</div>}
        {(!data.comments || data.comments.length === 0) ? (
          <div className="p-4 text-sm text-ink-500">아직 댓글이 없습니다.</div>
        ) : (
          <ul className="divide-y">
            {data.comments.map(c => (
              <li key={c.id} className="p-4">
                <div className="text-sm flex items-center gap-2">
                  <span className="font-semibold truncate">{c.authorNickname}</span>
                  {c.mine && (
                    <span className="text-[11px] inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">내 댓글</span>
                  )}
                  <span className="text-gray-500 ml-auto shrink-0">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span>
                </div>

                {editingId === c.id ? (
                  <div className="mt-2">
                    <textarea
                      className="w-full border rounded-md p-2 min-h-[80px]"
                      value={editText}
                      onChange={(e)=>setEditText(e.target.value)}
                      disabled={updatingId === c.id}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        disabled={updatingId === c.id}
                        className={`h-9 px-3 rounded-md border ${updatingId === c.id ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'border-brand-600 text-brand-600 bg-white hover:bg-brand-50'}`}
                        onClick={async ()=>{
                          if(!editText.trim()) return;
                          try{
                            setUpdatingId(c.id);
                            await updateComment(c.id, editText.trim());
                            setEditingId(null);
                            setEditText("");
                            await loadComments(1);
                          }catch(e){
                            alert('댓글 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.');
                          }finally{
                            setUpdatingId(null);
                          }
                        }}
                      >{updatingId === c.id ? '저장 중…' : '저장'}</button>
                      <button
                        type="button"
                        className="h-9 px-3 rounded-md border bg-white hover:bg-surface-soft"
                        onClick={()=>{ setEditingId(null); setEditText(""); }}
                      >취소</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-1 whitespace-pre-wrap">{c.content}</div>
                    {c.mine && (
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          className="h-9 px-3 rounded-md border border-brand-600 text-brand-600 bg-white hover:bg-brand-50"
                          onClick={()=>{ setEditingId(c.id); setEditText(c.content); }}
                        >수정</button>
                        <button
                          type="button"
                          disabled={deletingId === c.id}
                          className={`h-9 px-3 rounded-md border ${deletingId === c.id ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-surface-soft'}`}
                          onClick={async ()=>{
                            if(!window.confirm('댓글을 삭제할까요?')) return;
                            try{
                              setDeletingId(c.id);
                              await deleteComment(c.id);
                              await loadComments(1);
                            }catch(e){
                              alert('댓글 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.');
                            }finally{
                              setDeletingId(null);
                            }
                          }}
                        >{deletingId === c.id ? '삭제 중…' : '삭제'}</button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <form
          className="p-4 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!comment.trim()) return;
            try {
              setPosting(true);
              await addComment(id, comment.trim());
              setComment("");
              await loadComments(1);
            } catch (err) {
              alert('댓글 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.');
            } finally {
              setPosting(false);
            }
          }}
        >
          <input
            className="flex-1 border rounded-md px-3 h-11"
            placeholder="댓글을 입력하세요"
            value={comment}
            onChange={e=>setComment(e.target.value)}
            required
            disabled={posting}
          />
          <button
            disabled={posting}
            className={`px-4 h-11 rounded-md border ${
              posting ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'border-brand-600 text-brand-600 bg-white hover:bg-brand-50'
            }`}
          >
            {posting ? '등록 중…' : '등록'}
          </button>
        </form>
      </section>
    </div>
  );
}