import { CREATOR_WORLD } from "@/lib/creator-vocabulary";
import type { WorldSectionId } from "@/lib/world-bible-navigation";

export const WORLD_SECTIONS: {
  id: WorldSectionId;
  label: string;
}[] = [
  { id: "overview", label: "Overview" },
  { id: "locations", label: "Locations" },
  { id: "cultures", label: "Cultures" },
  { id: "rules", label: "Rules" },
  { id: "assets", label: "Assets" },
];

type WorldSectionNavProps = {
  active: WorldSectionId;
  onChange: (section: WorldSectionId) => void;
};

export function WorldSectionNav({ active, onChange }: WorldSectionNavProps) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-1"
      aria-label={CREATOR_WORLD.sectionsNavLabel}
    >
      {WORLD_SECTIONS.map((section) => (
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
