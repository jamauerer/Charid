import { CREATOR_CHARACTER } from "@/lib/creator-vocabulary";
import type { BibleSectionId } from "@/lib/character-bible-recommendations";

export const BIBLE_SECTIONS: {
  id: BibleSectionId;
  label: string;
}[] = [
  { id: "identity", label: "Identity" },
  { id: "reference", label: "Reference" },
  { id: "turnaround", label: "Turnaround" },
  { id: "expressions", label: "Expressions" },
  { id: "details", label: "Details" },
];

type BibleSectionNavProps = {
  active: BibleSectionId;
  onChange: (section: BibleSectionId) => void;
};

export function BibleSectionNav({ active, onChange }: BibleSectionNavProps) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-1"
      aria-label={CREATOR_CHARACTER.sectionsNavLabel}
    >
      {BIBLE_SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => onChange(section.id)}
          className={`shrink-0 rounded-md px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
            active === section.id
              ? "bg-[var(--tag-primary-bg)] text-[var(--tag-primary-text)]"
              : "text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text-secondary)]"
          }`}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
