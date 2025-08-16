

import React from "react";

/**
 * Card Component (Tailwind v4)
 *
 * Props:
 * - children: ReactNode — main content inside the card
 * - title?: string | ReactNode — optional card title
 * - footer?: ReactNode — optional footer area
 * - className?: string — extra classes for outer wrapper
 * - bodyClassName?: string — extra classes for body area
 * - hover?: boolean — adds hover shadow effect
 *
 * Usage:
 *   <Card title="제목" footer={<button>확인</button>}>
 *     내용...
 *   </Card>
 */

function cn(...args) {
  return args.flat().filter(Boolean).join(" ");
}

export default function Card({
  children,
  title,
  footer,
  className,
  bodyClassName,
  hover = false,
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-ink-100 bg-white shadow-sm",
        hover && "transition-shadow hover:shadow-md",
        className
      )}
    >
      {title && (
        <div className="px-5 py-3 border-b border-ink-100">
          <h3 className="text-base font-semibold text-ink-900">{title}</h3>
        </div>
      )}
      <div className={cn("px-5 py-4", bodyClassName)}>{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-ink-100">{footer}</div>
      )}
    </div>
  );
}