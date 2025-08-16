

/**
 * Example usage:
 * <EmptyState
 *   icon={<SomeIcon />}
 *   title="No results found"
 *   description="Try adjusting your search or filter to find what you're looking for."
 *   action={<button className="btn btn-primary">Create Item</button>}
 * />
 */
import React from "react";

/**
 * @param {Object} props
 * @param {React.ReactNode=} props.icon
 * @param {string} props.title
 * @param {string=} props.description
 * @param {React.ReactNode=} props.action
 * @param {string=} props.className
 */
const EmptyState = ({ icon, title, description, action, className = "" }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center gap-4 min-h-48 ${className}`}
    >
      {icon && (
        <div className="text-gray-400" style={{ fontSize: "3rem", lineHeight: 1 }}>
          {icon}
        </div>
      )}
      <div className="text-lg font-semibold text-ink-900">{title}</div>
      {description && (
        <div className="text-sm text-ink-600">{description}</div>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;