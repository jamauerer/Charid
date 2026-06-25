"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ProductionReadingNavJumpOption = {
  id: string;
  label: string;
  href: string;
};

type ProductionReadingNavProps = {
  unitLabel: string;
  currentIndex: number;
  total: number;
  prevHref: string | null;
  nextHref: string | null;
  jumpOptions: ProductionReadingNavJumpOption[];
};

export function ProductionReadingNav({
  unitLabel,
  currentIndex,
  total,
  prevHref,
  nextHref,
  jumpOptions,
}: ProductionReadingNavProps) {
  const router = useRouter();
  const [jumpValue, setJumpValue] = useState(jumpOptions[currentIndex]?.id ?? "");

  useEffect(() => {
    setJumpValue(jumpOptions[currentIndex]?.id ?? "");
  }, [currentIndex, jumpOptions]);

  const position = total > 0 ? currentIndex + 1 : 0;

  function handleJump() {
    if (!jumpValue) return;
    const option = jumpOptions.find((entry) => entry.id === jumpValue);
    if (option?.href) router.push(option.href);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-[var(--foreground)]">
        {unitLabel} {position} of {total}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {prevHref ? (
          <a
            href={prevHref}
            className="rounded-lg border border-[var(--brand-border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--brand-surface-elevated)]"
          >
            Previous {unitLabel.toLowerCase()}
          </a>
        ) : (
          <span className="rounded-lg border border-[var(--brand-border)] px-3 py-1.5 text-xs font-medium text-[var(--brand-text-muted)] opacity-60">
            Previous {unitLabel.toLowerCase()}
          </span>
        )}

        {nextHref ? (
          <a
            href={nextHref}
            className="rounded-lg border border-[var(--brand-border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--brand-surface-elevated)]"
          >
            Next {unitLabel.toLowerCase()}
          </a>
        ) : (
          <span className="rounded-lg border border-[var(--brand-border)] px-3 py-1.5 text-xs font-medium text-[var(--brand-text-muted)] opacity-60">
            Next {unitLabel.toLowerCase()}
          </span>
        )}

        {jumpOptions.length > 1 && (
          <div className="flex items-center gap-2">
            <label htmlFor="production-jump" className="sr-only">
              Jump to {unitLabel.toLowerCase()}
            </label>
            <select
              id="production-jump"
              value={jumpValue}
              onChange={(event) => setJumpValue(event.target.value)}
              className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-2 py-1.5 text-xs text-[var(--foreground)]"
            >
              {jumpOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleJump}
              className="rounded-lg bg-[var(--brand-surface-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--brand-surface)]"
            >
              Jump
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
