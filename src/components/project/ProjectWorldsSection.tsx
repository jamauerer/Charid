import { WorldCard } from "@/components/WorldCard";
import type { ProjectWorldEntry } from "@/app/actions/projects";

type ProjectWorldsSectionProps = {
  entries: ProjectWorldEntry[];
};

export function ProjectWorldsSection({ entries }: ProjectWorldsSectionProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-12 text-center">
        <p className="text-sm text-[var(--brand-text-secondary)]">No worlds in this project yet.</p>
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
          Worlds are settings for this project — locations, maps, and moodboards
          stay on each world page.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {entries.map(({ world, coverUrl }) => (
        <WorldCard key={world.id} world={world} coverUrl={coverUrl} />
      ))}
    </div>
  );
}
