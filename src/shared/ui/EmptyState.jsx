// src/shared/ui/EmptyState.jsx
import Button from "./Button";

export default function EmptyState({ title = "데이터가 없습니다", description, action, onAction }) {
  return (
    <div className="rounded-2xl bg-surface-card border border-surface-border shadow-soft px-6 py-10 text-center">
      <div className="text-lg font-semibold text-ink-800">{title}</div>
      {description && <p className="mt-2 text-ink-600">{description}</p>}
      {action && (
        <div className="mt-6">
          <Button onClick={onAction} variant="outline">
            {action}
          </Button>
        </div>
      )}
    </div>
  );
}