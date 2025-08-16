

import React, { useId } from "react";

/**
 * Reusable Select (Tailwind v4)
 *
 * Props:
 * - id?: string — id for the control (auto-generated if omitted)
 * - label?: string — optional label text
 * - value?: string | number
 * - onChange?: (e) => void
 * - placeholder?: string — renders a disabled placeholder option when provided
 * - options?: Array<{ value: string | number; label: string; disabled?: boolean }>
 * - error?: string — when provided, renders error text and applies error styles
 * - disabled?: boolean
 * - fullWidth?: boolean — stretches to 100% width
 * - className?: string — extra classes
 * - size?: "sm" | "md" | "lg" (default "md")
 *
 * Usage:
 *   <Select
 *     label="카테고리"
 *     value={category}
 *     onChange={(e) => setCategory(e.target.value)}
 *     options={[
 *       { value: "db", label: "데이터베이스" },
 *       { value: "network", label: "네트워크" },
 *     ]}
 *   />
 */

function cn(...args) {
  return args.flat().filter(Boolean).join(" ");
}

const base =
  "appearance-none border rounded-md bg-white text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed pr-9"; // space for caret

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-3",
  lg: "h-11 px-3 text-lg rounded-lg",
};

export default function Select({
  id,
  label,
  value,
  onChange,
  placeholder,
  options = [],
  error,
  disabled = false,
  fullWidth = true,
  className,
  size = "md",
  ...rest
}) {
  const autoId = useId();
  const selectId = id || autoId;
  const errorId = error ? `${selectId}-error` : undefined;

  const classes = cn(
    base,
    sizes[size] || sizes.md,
    fullWidth && "w-full",
    error && "border-red-500 focus:ring-red-300 focus:border-red-500",
    className
  );

  return (
    <div className={cn(fullWidth && "w-full", "relative")}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1 inline-block text-sm font-semibold text-ink-700"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          className={classes}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={String(opt.value)}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </option>
          ))}
        </select>

        {/* Caret icon */}
        <span
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-ink-400"
          aria-hidden="true"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>

      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}