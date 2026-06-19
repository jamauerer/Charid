import { CREATOR_STORY } from "@/lib/creator-vocabulary";
import type { StorySectionId } from "@/lib/story-bible-navigation";

export const STORY_SECTIONS: {
  id: StorySectionId;
  label: string;
}[] = [
  { id: "overview", label: "Overview" },
  { id: "timeline", label: "Timeline" },
  { id: "major_events", label: "Major Events" },
  { id: "characters", label: "Characters" },
  { id: "locations", label: "Locations" },
  { id: "assets", label: "Assets" },
  { id: "metrics", label: "Metrics" },
  { id: "recommendations", label: "Recommendations" },
];

type StorySectionNavProps = {
  active: StorySectionId;
  onChange: (section: StorySectionId) => void;
};

export function StorySectionNav({ active, onChange }: StorySectionNavProps) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-1"
      aria-label={CREATOR_STORY.sectionsNavLabel}
    >
      {STORY_SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => onChange(section.id)}
          className={`shrink-0 rounded-md px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
            active === section.id
              ? "bg-violet-600/20 text-violet-200"
              : "text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text-secondary)]"
          }`}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
