/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1120px" },
    },
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1", // base
          600: "#4f46e5", // primary
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        ink: {
          900: "#0f172a",
          700: "#334155",
          500: "#64748b",
          300: "#94a3b8",
        },
        surface: {
          DEFAULT: "#ffffff",
          soft: "#f8fafc",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Noto Sans KR",
          "Segoe UI",
          "Roboto",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
      },
      boxShadow: {
        card: "0 6px 24px rgba(15, 23, 42, 0.06)",
        header: "0 1px 0 rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};