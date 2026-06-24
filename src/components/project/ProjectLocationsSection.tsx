import Link from "next/link";
import type { ProjectLocationRollupEntry } from "@/app/actions/projects";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import type { ProjectWorldEntry } from "@/app/actions/projects";
import { ProjectWorldsSection } from "@/components/project/ProjectWorldsSection";

type ProjectLocationsSectionProps = {
  locations: ProjectLocationRollupEntry[];
  worlds: ProjectWorldEntry[];
};

export function ProjectLocationsSection({
  locations,
  worlds,
}: ProjectLocationsSectionProps) {
  return (
    <div className="space-y-6">
      {locations.length === 0 ? (
        <StudioEmptyState
          headline="No locations yet"
          description="Places live in your project setting. Add locations from a setting workspace or story."
        />
      ) : (
        <ul className="space-y-2">
          {locations.map((entry) => (
            <li key={entry.locationId}>
              <Link
                href={`/dashboard/worlds/${entry.worldId}#world-locations`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 transition hover:border-neutral-300 hover:bg-[var(--brand-surface-elevated)]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--foreground)]">
                    {entry.locationName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[var(--brand-text-muted)]">
                    {entry.worldName} · {entry.locationType.replace(/_/g, " ")}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-[var(--brand-text-secondary)]">
                  Edit setting →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          Settings
        </h3>
        <ProjectWorldsSection entries={worlds} />
      </div>
    </div>
  );
}
