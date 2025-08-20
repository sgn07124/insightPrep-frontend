import { Link, useNavigate } from "react-router-dom";
import Button from "@/shared/ui/Button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="container-page mx-auto max-w-6xl px-4 py-24 text-center">
      <div className="mx-auto max-w-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-50 text-brand-700 font-extrabold text-2xl shadow-card">
          404
        </div>

        <h1 className="mt-4 text-2xl md:text-3xl font-extrabold tracking-tight text-ink-900">
          페이지를 찾을 수 없어요
        </h1>
        <p className="mt-2 text-ink-600">
          주소가 잘못되었거나, 이동된 페이지일 수 있어요.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button as={Link} to="/" variant="primary" size="md">
            홈으로 가기
          </Button>
          <Button
            as="button"
            variant="outline"
            size="md"
            onClick={() => navigate("/")}
            >
            이전 페이지
        </Button>
        </div>
      </div>
    </div>
  );
}