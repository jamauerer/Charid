import type { ReactNode } from "react";

type ProductionPlaceholderSectionProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  placeholder?: boolean;
};

export function ProductionPlaceholderSection({
  title,
  description,
  children,
  placeholder = false,
}: ProductionPlaceholderSectionProps) {
  return (
    <section
      className={`rounded-xl border px-4 py-4 ${
        placeholder
          ? "border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)]"
          : "border-[var(--brand-border)] bg-[var(--brand-surface)]"
      }`}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm text-[var(--brand-text-secondary)]">{description}</p>
      )}
      {children && <div className="mt-3">{children}</div>}
    </section>
  );
}
