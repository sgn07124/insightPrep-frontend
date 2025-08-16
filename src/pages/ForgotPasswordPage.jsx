// src/pages/ForgotPasswordPage.jsx
export default function ForgotPasswordPage() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold mb-4">비밀번호 찾기</h1>
        <p className="text-sm text-gray-600 mb-4">
          가입한 이메일을 입력하세요. 비밀번호 재설정 링크를 보내드립니다.
        </p>
        <form className="space-y-3">
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="name@example.com"
          />
          <button type="submit" className="w-full bg-brand-600 text-white rounded-lg py-2">
            재설정 링크 보내기
          </button>
        </form>
      </div>
    </section>
  );
}