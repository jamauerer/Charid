import type { ProgressItem } from "@/lib/character-creator-progress";
import { studioProgressFill } from "@/lib/visual-identity";

type CreatorProgressBarProps = {
  items: ProgressItem[];
  percent: number;
};

export function CreatorProgressBar({ items, percent }: CreatorProgressBarProps) {
  return (
    <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-neutral-500">
          Shaping your vision
        </span>
        <span className="text-sm font-semibold tabular-nums text-neutral-900">
          {percent}%
        </span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[var(--brand-border)]">
        <div
          className={studioProgressFill}
          style={{ width: `${percent}%` }}
        />
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-600">
        {items.map((item) => (
          <li key={item.id}>
            <span
              className={
                item.complete ? "text-neutral-900" : "text-neutral-500"
              }
            >
              {item.label} {item.complete ? "✓" : "○"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
