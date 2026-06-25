import Link from "next/link";
import {
  formatProductionUnitStatus,
  type ProductionUnitStatus,
} from "@/lib/production-reading-order";

type ProductionUnitCardProps = {
  href: string;
  title: string;
  subtitle: string;
  meta: string;
  status: ProductionUnitStatus;
  indexLabel: string;
};

export function ProductionUnitCard({
  href,
  title,
  subtitle,
  meta,
  status,
  indexLabel,
}: ProductionUnitCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 transition hover:border-[var(--brand-accent)] hover:bg-[var(--brand-surface-elevated)]"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="rounded-md bg-[var(--brand-surface-elevated)] px-2 py-0.5 text-xs font-semibold tabular-nums text-[var(--foreground)]">
          {indexLabel}
        </span>
        <span className="rounded-full border border-[var(--brand-border)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--brand-text-muted)]">
          {formatProductionUnitStatus(status)}
        </span>
      </div>
      <p className="truncate text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--brand-accent)]">
        {title}
      </p>
      <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">{subtitle}</p>
      <p className="mt-2 text-xs text-[var(--brand-text-muted)]">{meta}</p>
    </Link>
  );
}
