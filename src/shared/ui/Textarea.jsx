

import React, { useId } from "react";

/**
 * Reusable Textarea (Tailwind v4)
 *
 * Props:
 * - id?: string — id for the textarea (auto-generated if omitted)
 * - label?: string — optional label text
 * - value?: string
 * - onChange?: (e) => void
 * - placeholder?: string
 * - rows?: number (default 4)
 * - error?: string — when provided, renders error text and applies error styles
 * - disabled?: boolean
 * - fullWidth?: boolean — stretches to 100% width
 * - className?: string — additional classes
 * - size?: "sm" | "md" | "lg" (default "md")
 * - resize?: "none" | "x" | "y" | "both" (default "y")
 *
 * Usage:
 *   <Textarea label="설명" value={text} onChange={e=>setText(e.target.value)} />
 *   <Textarea label="메모" error="필수 항목입니다." />
 */

function cn(...args) {
  return args.flat().filter(Boolean).join(" ");
}

const base =
  "border rounded-md px-3 py-2 w-full bg-white text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed";

const sizes = {
  sm: "text-sm min-h-24",
  md: "min-h-28",
  lg: "text-lg min-h-36",
};

const resizeMap = {
  none: "resize-none",
  x: "resize-x",
  y: "resize-y",
  both: "resize",
};

export default function Textarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  disabled = false,
  fullWidth = true,
  className,
  size = "md",
  resize = "y",
  ...rest
}) {
  const autoId = useId();
  const textareaId = id || autoId;
  const errorId = error ? `${textareaId}-error` : undefined;

  const classes = cn(
    base,
    sizes[size] || sizes.md,
    resizeMap[resize] || resizeMap.y,
    fullWidth && "w-full",
    error && "border-red-500 focus:ring-red-300 focus:border-red-500",
    className
  );

  return (
    <div className={cn(fullWidth && "w-full")}>
      {label && (
        <label
          htmlFor={textareaId}
          className="mb-1 inline-block text-sm font-semibold text-ink-700"
        >
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        className={classes}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />

      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}