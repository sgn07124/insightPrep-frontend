import React from "react";

/**
 * Spinner (Tailwind v4, no deps)
 *
 * Props:
 * - size?: "xs" | "sm" | "md" | "lg" (default "md")
 * - label?: string — accessible label for screen readers (default "로딩 중…")
 * - className?: string — extra classes
 * - inline?: boolean — if true, no wrapper for centering (default true)
 *
 * Usage:
 *   <Spinner />
 *   <Spinner size="sm" />
 *   <Spinner size="lg" label="데이터 불러오는 중" />
 *   <div className="h-40 grid place-items-center"><Spinner inline={false} /></div>
 */

function cn(...args) {
  return args.flat().filter(Boolean).join(" ");
}

const sizeMap = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export default function Spinner({
  size = "md",
  label = "로딩 중…",
  className,
  inline = true,
  ...rest
}) {
  const svg = (
    <svg
      className={cn("animate-spin text-current", sizeMap[size] || sizeMap.md, className)}
      viewBox="0 0 24 24"
      role="status"
      aria-label={label}
      aria-live="polite"
      {...rest}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );

  if (inline) return svg;

  return (
    <div className="grid place-items-center" aria-busy="true">
      {svg}
      <span className="sr-only">{label}</span>
    </div>
  );
}
