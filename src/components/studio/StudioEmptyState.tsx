import type { ReactNode } from "react";

type StudioEmptyStateProps = {
  headline: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function StudioEmptyState({
  headline,
  description,
  children,
  className = "",
}: StudioEmptyStateProps) {
  return (
    <div
      className={`rounded-lg border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-6 text-center ${className}`}
    >
      <p className="text-sm font-medium text-[var(--foreground)]">{headline}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-[var(--brand-text-secondary)]">
          {description}
        </p>
      )}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
