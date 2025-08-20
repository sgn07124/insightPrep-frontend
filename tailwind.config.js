// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 주 브랜드 컬러
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5", // 기본 버튼/링크
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        // 본문/제목/보조 텍스트
        ink: {
          900: "#0b0f19",
          800: "#1f2937",
          700: "#374151", // 본문 기본
          600: "#4b5563",
          500: "#6b7280",
          400: "#9ca3af",
          300: "#d1d5db",
        },
        // 배경/표면
        surface: {
          DEFAULT: "#f7f7fb",      // 페이지 배경
          soft:    "#f3f4f6",      // 섹션/hover 배경
          card:    "#ffffff",      // 카드 표면
          border:  "#e5e7eb",
        },
        danger: {
          600: "#dc2626",
          700: "#b91c1c",
        },
        success: {
          600: "#16a34a",
          700: "#15803d",
        },
        warning: {
          600: "#d97706",
          700: "#b45309",
        },
      },
      fontFamily: {
        // OS 기본 + 한국어 가독성 좋은 Pretendard 우선권 부여 (웹폰트는 추후)
        sans: ["Pretendard", "Inter", "system-ui", "Segoe UI",
               "Apple SD Gothic Neo", "Noto Sans KR", "Arial", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        card: "0 4px 14px rgba(15, 23, 42, 0.06)",
        soft: "0 1px 2px rgba(15, 23, 42, 0.06)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(.22,.8,.23,1)",
      },
    },
  },
  plugins: [],
};