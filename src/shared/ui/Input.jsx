/Users/kimkyungho/Desktop/study/insightPrep-frontend/src/shared/ui/Input.jsx
/**
 * Reusable Input component with Tailwind v4 styles.
 *
 * Props:
 * - id: string (required) - for label htmlFor and input id
 * - label: string (optional) - label text
 * - type: string (default: "text") - input type
 * - value: any - input value
 * - onChange: function - change handler
 * - placeholder: string (optional)
 * - error: string (optional) - error message text
 * - disabled: boolean (optional)
 * - fullWidth: boolean (optional) - if true, input takes full width
 * - className: string (optional) - additional class names
 * - size: "sm" | "md" | "lg" (default: "md") - input size
 *
 * Example usage:
 * <Input
 *   id="email"
 *   label="Email Address"
 *   type="email"
 *   value={email}
 *   onChange={e => setEmail(e.target.value)}
 *   placeholder="Enter your email"
 *   error={emailError}
 *   fullWidth
 *   size="lg"
 * />
 */

import React from "react";

const sizeClasses = {
  sm: "px-2 py-1 text-sm",
  md: "px-3 py-2 text-base",
  lg: "px-4 py-3 text-lg",
};

const Input = React.forwardRef(
  (
    {
      id,
      label,
      type = "text",
      value,
      onChange,
      placeholder,
      error,
      disabled = false,
      fullWidth = false,
      className = "",
      size = "md",
      ...rest
    },
    ref
  ) => {
    const errorId = error ? `${id}-error` : undefined;

    return (
      <div className={`flex flex-col ${fullWidth ? "w-full" : "w-auto"}`}>
        {label && (
          <label
            htmlFor={id}
            className={`mb-1 font-medium ${
              disabled ? "text-gray-400" : "text-gray-700"
            }`}
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={errorId}
          className={`border rounded focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-gray-100 disabled:text-gray-400 ${
            error
              ? "border-red-500 text-red-600 placeholder:text-red-300"
              : "border-gray-300 text-gray-900 placeholder:text-gray-400"
          } ${sizeClasses[size]} ${fullWidth ? "w-full" : "w-auto"} ${className}`}
          {...rest}
        />
        {error && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

export default Input;
