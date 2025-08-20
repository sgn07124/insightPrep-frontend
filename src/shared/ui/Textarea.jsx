import React, { useId } from "react";

/**
 * Textarea (Tailwind v4, design tokens)
 *
 * Props:
 * - id?: string — id for the textarea (auto-generated if omitted)
 * - label?: string — optional label text
 * - description?: string — helper text shown when no error
 * - value?: string
 * - onChange?: (e) => void
 * - placeholder?: string
 * - rows?: number (default 4)
 * - error?: string — when provided, renders error text and applies error styles
 * - disabled?: boolean
 * - readOnly?: boolean
 * - fullWidth?: boolean — stretches to 100% width
 * - className?: string — wrapper classes
 * - textareaClassName?: string — classes for <textarea>
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

const sizes = {
  sm: "text-sm min-h-24 px-3 py-2",
  md: "min-h-28 px-3.5 py-2.5",
  lg: "text-lg min-h-36 px-4 py-3",
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
  description,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  disabled = false,
  readOnly = false,
  fullWidth = true,
  className,
  textareaClassName,
  size = "md",
  resize = "y",
  ...rest
}) {
  const autoId = useId();
  const textareaId = id || autoId;
  const descId = description && !error ? `${textareaId}-desc` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;

  const base =
    "w-full rounded-xl shadow-sm bg-surface-card text-ink-800 placeholder:text-ink-400 " +
    "border border-surface-border outline-none transition-colors duration-200 " +
    "focus:ring-2 focus:ring-brand-600/40 focus:border-brand-600 " +
    "disabled:opacity-50 disabled:cursor-not-allowed " +
    (readOnly ? "bg-surface-soft text-ink-600 " : "");

  const classes = cn(
    base,
    sizes[size] || sizes.md,
    resizeMap[resize] || resizeMap.y,
    fullWidth && "w-full",
    error && "border-danger-600 focus:ring-danger-600/30 focus:border-danger-600",
    textareaClassName
  );

  const describedBy = error ? errorId : descId;

  return (
    <div className={cn(fullWidth && "w-full", className)}>
      {label && (
        <label
          htmlFor={textareaId}
          className="mb-1 inline-block text-sm font-medium text-ink-700"
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
        readOnly={readOnly}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        {...rest}
      />

      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-sm text-danger-600">
          {error}
        </p>
      ) : (
        description && (
          <p id={descId} className="mt-1 text-sm text-ink-500">
            {description}
          </p>
        )
      )}
    </div>
  );
}