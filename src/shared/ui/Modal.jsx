

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Accessible Modal (Tailwind v4, no deps)
 *
 * Props:
 * - open: boolean (required) — controls visibility
 * - onClose: () => void (required) — called when the modal should close
 * - title?: string | ReactNode — heading
 * - children?: ReactNode — body content
 * - footer?: ReactNode — footer area (actions)
 * - size?: "sm" | "md" | "lg" (default "md")
 * - closeOnOverlay?: boolean (default true)
 * - closeOnEsc?: boolean (default true)
 * - initialFocusRef?: React.RefObject<HTMLElement> — element to focus on open
 *
 * Usage:
 *   const [open, setOpen] = useState(false);
 *   <Modal open={open} onClose={()=>setOpen(false)} title="설정">
 *     본문...
 *   </Modal>
 */

function cn(...args) {
  return args.flat().filter(Boolean).join(" ");
}

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

const overlayBase =
  "fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4";

const panelBase =
  "w-full rounded-xl bg-white shadow-card outline-none focus-visible:ring-2 focus-visible:ring-brand-300";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
  closeOnEsc = true,
  initialFocusRef,
}) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const previouslyFocusedEl = useRef(null);

  // Prevent background scroll when open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Manage focus: save previous focus, set initial focus, trap tab within panel
  useEffect(() => {
    if (!open) return;

    previouslyFocusedEl.current = document.activeElement;

    // Focus target: initialFocusRef -> first focusable in panel -> panel itself
    const focusFirst = () => {
      const target =
        initialFocusRef?.current ||
        panelRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
      (target || panelRef.current)?.focus();
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && closeOnEsc) {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key === "Tab") {
        // simple focus trap
        const focusable = panelRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    focusFirst();
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      // restore focus
      previouslyFocusedEl.current && previouslyFocusedEl.current.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const overlayClick = (e) => {
    if (!closeOnOverlay) return;
    if (e.target === overlayRef.current) onClose?.();
  };

  const modal = (
    <div
      className={overlayBase}
      ref={overlayRef}
      onMouseDown={overlayClick}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={cn(panelBase, sizeMap[size] || sizeMap.md)}
        ref={panelRef}
        tabIndex={-1}
        onMouseDown={(e) => {
          // prevent panel mouseDown from bubbling to overlay (so clicks inside don't close)
          e.stopPropagation();
        }}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b">
            {title ? (
              <h2 id="modal-title" className="text-lg font-bold">
                {title}
              </h2>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-surface-soft"
              aria-label="닫기"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M6.4 5L5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6 6.4 5z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-5 py-4">{children}</div>

        {/* Footer */}
        {footer && <div className="px-5 pb-5 pt-3 border-t">{footer}</div>}
      </div>
    </div>
  );

  // Portal to body
  return createPortal(modal, document.body);
}