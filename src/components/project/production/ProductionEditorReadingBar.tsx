"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type JumpOption = {
  id: string;
  label: string;
  href: string;
};

type ProductionEditorReadingBarProps = {
  currentIndex: number;
  total: number;
  prevHref: string | null;
  nextHref: string | null;
  jumpOptions: JumpOption[];
};

export function ProductionEditorReadingBar({
  currentIndex,
  total,
  prevHref,
  nextHref,
  jumpOptions,
}: ProductionEditorReadingBarProps) {
  const router = useRouter();
  const [jumpValue, setJumpValue] = useState(jumpOptions[currentIndex]?.id ?? "");

  useEffect(() => {
    setJumpValue(jumpOptions[currentIndex]?.id ?? "");
  }, [currentIndex, jumpOptions]);

  const position = total > 0 ? currentIndex + 1 : 0;

  function handleJump(nextId: string) {
    if (!nextId) return;
    const option = jumpOptions.find((entry) => entry.id === nextId);
    if (option?.href) router.push(option.href);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {prevHref ? (
        <a href={prevHref} className="production-editor-nav-btn" title="Previous page">
          ‹ Prev
        </a>
      ) : (
        <span className="production-editor-nav-btn production-editor-nav-btn-disabled">‹ Prev</span>
      )}

      {jumpOptions.length > 1 ? (
        <select
          value={jumpValue}
          onChange={(event) => {
            setJumpValue(event.target.value);
            handleJump(event.target.value);
          }}
          className="production-editor-nav-select"
          aria-label="Jump to page"
        >
          {jumpOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <span className="text-xs tabular-nums text-[var(--brand-text-secondary)]">
          Page {position} of {total}
        </span>
      )}

      {nextHref ? (
        <a href={nextHref} className="production-editor-nav-btn" title="Next page">
          Next ›
        </a>
      ) : (
        <span className="production-editor-nav-btn production-editor-nav-btn-disabled">Next ›</span>
      )}
    </div>
  );
}
