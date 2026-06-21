"use client";

type TimelineInsertButtonProps = {
  label: string;
  onClick: () => void;
};

export function TimelineInsertButton({ label, onClick }: TimelineInsertButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] text-lg font-medium text-[var(--brand-text-secondary)] transition hover:border-[var(--status-info-border)] hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
    >
      +
    </button>
  );
}
