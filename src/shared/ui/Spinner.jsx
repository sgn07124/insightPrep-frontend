import React from "react";

/**
 * Spinner (Tailwind v4, design tokens applied)
 *
 * Props:
 * - size?: "xs" | "sm" | "md" | "lg" (default "md")
 * - variant?: "brand" | "ink" | "white" | "muted" | "danger" | "success" (default "brand")
 * - label?: string — accessible label for screen readers (default "로딩 중…")
 * - className?: string — extra classes
 * - inline?: boolean — if true, returns only the svg (default true)
 *
 * Usage:
 *   <Spinner />
 *   <Spinner size="sm" />
 *   <Spinner variant="white" className="" />
 *   <div className="h-40 grid place-items-center"><Spinner inline={false} /></div>
 */

function cn(...args) {
  return args.flat().filter(Boolean).join(" ");
}

const sizeMap = {
  xs: { box: "h-3 w-3", stroke: 2 },
  sm: { box: "h-4 w-4", stroke: 3 },
  md: { box: "h-5 w-5", stroke: 4 },
  lg: { box: "h-6 w-6", stroke: 4 },
};

const colorMap = {
  brand: "text-brand-600",
  ink: "text-ink-700",
  white: "text-white",
  muted: "text-ink-400",
  danger: "text-danger-600",
  success: "text-success-600",
};

export default function Spinner({
  size = "md",
  variant = "brand",
  label = "로딩 중…",
  className,
  inline = true,
  ...rest
}) {
  const sz = sizeMap[size] || sizeMap.md;
  const color = colorMap[variant] || colorMap.brand;

  const svg = (
    <svg
      className={cn("animate-spin", sz.box, color, className)}
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
        strokeWidth={sz.stroke}
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
