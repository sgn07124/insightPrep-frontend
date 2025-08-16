// src/app/layout/LogoutButton.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider";
import Button from "@/shared/ui/Button";

const API_BASE = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiUrl = (path) => `${API_BASE}${path.startsWith("/") ? path : "/" + path}`;

export default function LogoutButton() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogout = async () => {
    try {
      const res = await fetch(apiUrl("/auth/logout"), {
        method: "POST",
        credentials: "include",
      });

      // 일부 서버는 200, 일부는 204를 반환할 수 있음
      if (!res.ok && res.status !== 204) {
        throw new Error("LOGOUT_FAILED");
      }

      // 클라이언트 상태 초기화 및 이동
      setUser(null);
      navigate("/login", { replace: true });
    } catch (error) {
      const msg = (error?.message || "").toString();
      if (msg.includes("Failed to fetch") || !navigator.onLine) {
        alert("서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.");
      } else {
        alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <Button variant="secondary" onClick={handleLogout}>
      로그아웃
    </Button>
  );
}