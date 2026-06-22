import Link from "next/link";
import type { ProjectRelationshipEntry } from "@/app/actions/projects";
import { CharacterPortraitImage } from "@/components/character-bible/CharacterPortraitImage";

type ProjectRelationshipsSectionProps = {
  entries: ProjectRelationshipEntry[];
  photoUrls: Record<string, string | null>;
};

function CharacterChip({
  id,
  name,
  photoUrl,
  focalY,
}: {
  id: string;
  name: string;
  photoUrl: string | null;
  focalY?: number | null;
}) {
  return (
    <Link
      href={`/dashboard/characters/${id}`}
      className="flex min-w-0 items-center gap-2 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-2.5 py-1.5 transition hover:border-[var(--brand-border)] hover:bg-[var(--brand-surface)]"
    >
      <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-zinc-800">
        {photoUrl ? (
          <CharacterPortraitImage photoUrl={photoUrl} focalY={focalY} alt={name} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--brand-text-secondary)]">
            ?
          </div>
        )}
      </div>
      <span className="truncate text-sm text-[var(--brand-text-secondary)]">{name}</span>
    </Link>
  );
}

export function ProjectRelationshipsSection({
  entries,
  photoUrls,
}: ProjectRelationshipsSectionProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-12 text-center">
        <p className="text-sm text-[var(--brand-text-secondary)]">No relationships in this project.</p>
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
          Add bonds between characters on their character pages — they appear
          here when both characters belong to this project.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map(({ relationship, fromCharacter, toCharacter, label }) => (
        <li
          key={relationship.id}
          className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-4"
        >
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <CharacterChip
              id={fromCharacter.id}
              name={fromCharacter.name}
              photoUrl={photoUrls[fromCharacter.id] ?? null}
              focalY={fromCharacter.portrait_focal_y}
            />
            <span className="rounded-full border border-[var(--brand-border)] bg-[var(--tag-primary-bg)] px-2.5 py-1 text-xs font-medium text-[var(--tag-primary-text)]">
              {label}
            </span>
            <CharacterChip
              id={toCharacter.id}
              name={toCharacter.name}
              photoUrl={photoUrls[toCharacter.id] ?? null}
              focalY={toCharacter.portrait_focal_y}
            />
          </div>
          {relationship.notes && (
            <p className="mt-3 text-xs leading-relaxed text-[var(--brand-text-secondary)]">
              {relationship.notes}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
