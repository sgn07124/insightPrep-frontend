import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-extrabold">InsightPrep</h1>
      <p className="text-gray-600">Vite + React + Tailwind 정상 동작 확인</p>
      <Link
        to="/login"
        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
      >
        로그인 페이지로
      </Link>
    </div>
  );
}