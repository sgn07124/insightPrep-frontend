

import React from "react";

/**
 * Reusable Button component (Tailwind v4)
 *
 * Props:
 * - as: React element type for polymorphic rendering (e.g., "button", "a", Link). Default: "button"
 * - variant: "primary" | "secondary" | "outline" | "danger" | "ghost"
 * - size: "sm" | "md" | "lg"
 * - loading: boolean — shows spinner and disables interactions
 * - disabled: boolean
 * - leftIcon / rightIcon: ReactNode — optional icons
 * - fullWidth: boolean — stretches to 100% width
 * - className: string — extra classes
 * - children: ReactNode
 *
 * Usage:
 *   <Button>저장</Button>
 *   <Button variant="secondary" size="sm">취소</Button>
 *   <Button as={Link} to="/login">로그인</Button>
 *   <Button loading leftIcon={<Icon/>}>전송 중</Button>
 */

function cn(...args) {
  return args
    .flat()
    .filter(Boolean)
    .join(" ");
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:opacity-50 disabled:cursor-not-allowed";

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-surface text-ink-900 hover:bg-surface-soft border",
  outline: "bg-transparent text-ink-900 border hover:bg-surface-soft",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent text-ink-900 hover:bg-surface-soft",
};

const sizes = {
  sm: "h-9 px-3 text-sm rounded-md",
  md: "h-10 px-4 rounded-md",
  lg: "h-11 px-5 text-lg rounded-lg",
};

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-current"
      viewBox="0 0 24 24"
      aria-hidden="true"
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
}

export default function Button({
  as,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  type, // for <button>
  ...rest
}) {
  const Component = as || "button";
  const isDisabled = disabled || loading;

  const classes = cn(
    base,
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    fullWidth && "w-full",
    className
  );

  const content = (
    <>
      {loading && <Spinner />}
      {!loading && leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </>
  );

  // Ensure default type="button" when rendering a native button
  const componentProps =
    Component === "button"
      ? { type: type || "button", disabled: isDisabled, ...rest }
      : { "aria-disabled": isDisabled, ...rest };

  return (
    <Component
      className={classes}
      aria-busy={loading ? "true" : undefined}
      {...componentProps}
    >
      {content}
    </Component>
  );
}