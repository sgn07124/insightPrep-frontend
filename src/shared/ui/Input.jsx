import React from "react";

/**
 * Design-system Input (Tailwind v4)
 *
 * Props
 * - id (required)
 * - label?: string
 * - required?: boolean (adds asterisk and aria-required)
 * - description?: string (helper text shown when no error)
 * - type?: string = "text"
 * - value?: any
 * - onChange?: (e) => void
 * - placeholder?: string
 * - error?: string (error message)
 * - disabled?: boolean
 * - readOnly?: boolean
 * - fullWidth?: boolean
 * - size?: 'sm' | 'md' | 'lg' = 'md'
 * - variant?: 'outline' | 'filled' = 'outline'
 * - startIcon?: ReactNode (left icon)
 * - endIcon?: ReactNode (right icon)
 * - inputClassName?: string (class applied to <input>)
 * - className?: string (class applied to wrapper)
 */

const sizeStyles = {
  sm: {
    input: "h-9 text-sm px-3",
    withStart: "pl-9",
    withEnd: "pr-9",
    iconBox: "w-9",
  },
  md: {
    input: "h-10 text-base px-3.5",
    withStart: "pl-10",
    withEnd: "pr-10",
    iconBox: "w-10",
  },
  lg: {
    input: "h-12 text-lg px-4",
    withStart: "pl-12",
    withEnd: "pr-12",
    iconBox: "w-12",
  },
};

const variants = {
  outline: "bg-surface-card border border-surface-border focus:ring-2 focus:ring-brand-600/40 focus:border-brand-600",
  filled:
    "bg-surface-soft border border-transparent focus:ring-2 focus:ring-brand-600/40 focus:border-brand-600",
};

const Input = React.forwardRef(
  (
    {
      id,
      label,
      required = false,
      description,
      type = "text",
      value,
      onChange,
      placeholder,
      error,
      disabled = false,
      readOnly = false,
      fullWidth = false,
      size = "md",
      variant = "outline",
      startIcon,
      endIcon,
      inputClassName = "",
      className = "",
      ...rest
    },
    ref
  ) => {
    const sizeCfg = sizeStyles[size] ?? sizeStyles.md;
    const hasStart = Boolean(startIcon);
    const hasEnd = Boolean(endIcon);

    const describedBy = [];
    if (error) describedBy.push(`${id}-error`);
    if (description && !error) describedBy.push(`${id}-desc`);

    const baseInput = [
      "w-full rounded-xl outline-none transition-colors duration-200",
      "text-ink-800 placeholder:text-ink-400",
      disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "",
      readOnly ? "bg-surface-soft text-ink-600" : "",
      error ? "border-danger-600 focus:ring-danger-600/30 focus:border-danger-600" : variants[variant],
      sizeCfg.input,
      hasStart ? sizeCfg.withStart : "",
      hasEnd ? sizeCfg.withEnd : "",
      inputClassName,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`${fullWidth ? "w-full" : "w-auto"} ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className={`mb-1 block text-sm font-medium ${disabled ? "text-ink-400" : "text-ink-700"}`}
          >
            {label}
            {required && <span className="ml-1 text-danger-600">*</span>}
          </label>
        )}

        <div className="relative">
          {hasStart && (
            <span className={`absolute inset-y-0 left-0 flex items-center justify-center ${sizeCfg.iconBox} text-ink-500`}>
              {startIcon}
            </span>
          )}

          <input
            id={id}
            ref={ref}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={error ? "true" : undefined}
            aria-required={required || undefined}
            aria-describedby={describedBy.length ? describedBy.join(" ") : undefined}
            className={baseInput}
            {...rest}
          />

          {hasEnd && (
            <span className={`pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center ${sizeCfg.iconBox} text-ink-500`}>
              {endIcon}
            </span>
          )}
        </div>

        {error ? (
          <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-danger-600">
            {error}
          </p>
        ) : (
          description && (
            <p id={`${id}-desc`} className="mt-1 text-sm text-ink-500">
              {description}
            </p>
          )
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
