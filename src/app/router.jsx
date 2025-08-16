import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import AuthLayout from "./layout/AuthLayout";

// 페이지 스켈레톤 (있는 파일로 교체해도 됩니다)
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import InterviewPage from "@/pages/InterviewPage";
import ReviewListPage from "@/pages/ReviewListPage";
import DiscussionListPage from "@/pages/DiscussionListPage";
import DiscussionDetailPage from "@/pages/DiscussionDetailPage";
import DiscussionNewPage from "@/pages/DiscussionNewPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import { AuthProvider } from "@/features/auth/AuthProvider";

export const router = createBrowserRouter([
  {
    element: <AuthProvider><AppLayout /></AuthProvider>, // AuthProvider로 감싸기
    children: [
      { path: "/", element: <LandingPage /> },

      // 🔒 로그인 필요
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/interview", element: <InterviewPage /> },
          { path: "/review", element: <ReviewListPage /> },
          { path: "/discussions/new", element: <DiscussionNewPage /> },
          { path: "/discussions", element: <DiscussionListPage /> },
          { path: "/discussions/:id", element: <DiscussionDetailPage /> },
        ]
      },

      // 로그인 필요 없음
            { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    element: <AuthProvider><AuthLayout /></AuthProvider>,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
