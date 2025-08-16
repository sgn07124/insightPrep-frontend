export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-gray-600 mb-6">페이지를 찾을 수 없습니다.</p>
      <a
        href="/"
        className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700"
      >
        홈으로 돌아가기
      </a>
    </div>
  );
}