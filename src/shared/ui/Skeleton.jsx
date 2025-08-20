import React from "react";

/**
 * Skeleton (Tailwind v4 with design tokens)
 *
 * Props:
 * - width?: string | number — CSS width or Tailwind class
 * - height?: string | number — CSS height or Tailwind class
 * - circle?: boolean — makes it round
 * - className?: string — extra classes
 * - count?: number — number of skeleton lines (default 1)
 *
 * Usage:
 *   <Skeleton width="w-32" height="h-4" />
 *   <Skeleton circle width="3rem" height="3rem" />
 *   <Skeleton count={3} className="h-4 w-full" />
 */

function cn(...args) {
  return args.flat().filter(Boolean).join(" ");
}

export default function Skeleton({
  width,
  height,
  circle = false,
  className,
  count = 1,
}) {
  const style =
    typeof width === "number" || typeof height === "number"
      ? {
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
        }
      : undefined;

  const baseClass = cn(
    "bg-surface-border/70 animate-pulse",
    circle ? "rounded-full" : "rounded-xl"
  );

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          role="status"
          aria-label="로딩 중"
          className={cn(
            baseClass,
            typeof width === "string" ? width : width ? "" : "w-full",
            typeof height === "string" ? height : height ? "" : "h-4",
            className
          )}
          style={style}
        />
      ))}
    </>
  );
}
