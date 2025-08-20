// src/shared/ui/Card.jsx
export default function Card({ className = "", children, ...props }) {
  return (
    <div className={`rounded-2xl bg-surface-card shadow-card border border-surface-border ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return <div className={`px-5 py-4 border-b border-surface-border ${className}`}>{children}</div>;
}
export function CardContent({ className = "", children }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
export function CardFooter({ className = "", children }) {
  return <div className={`px-5 py-4 border-t border-surface-border ${className}`}>{children}</div>;
}