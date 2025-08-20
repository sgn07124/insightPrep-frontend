// src/shared/ui/Button.jsx
export default function Button({
  as: Tag = "button",
  variant = "primary", // primary | outline | subtle | danger
  size = "md",         // sm | md | lg
  className = "",
  disabled,
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition-colors duration-200 ease-smooth focus:outline-none focus:ring-2 focus:ring-brand-600/40 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    outline: "border border-brand-600 text-brand-600 bg-white hover:bg-brand-50",
    subtle:  "bg-surface-soft text-ink-700 hover:bg-white border border-surface-border",
    danger:  "bg-danger-600 text-white hover:bg-danger-700",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-5 text-lg",
  };

  const cn = `${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`;
  return (
    <Tag className={cn} disabled={disabled} {...props}>
      {children}
    </Tag>
  );
}