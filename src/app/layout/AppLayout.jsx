import Header from "@/app/layout/Header";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container-page mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>

      <footer className="mt-8 border-t">
        <div className="container-page mx-auto max-w-6xl px-4 py-6 text-sm text-ink-500">
          © {new Date().getFullYear()} InsightPrep
        </div>
      </footer>
    </div>
  );
}