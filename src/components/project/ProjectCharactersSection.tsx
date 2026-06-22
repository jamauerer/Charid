import Link from "next/link";
import type { ProjectCharacterEntry } from "@/app/actions/projects";
import { CharacterPortraitImage } from "@/components/character-bible/CharacterPortraitImage";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { STUDIO_EMPTY_COPY } from "@/lib/studio-empty-copy";
import { studioCardSurface, studioEmptyArt } from "@/lib/visual-identity";

type ProjectCharactersSectionProps = {
  entries: ProjectCharacterEntry[];
};

export function ProjectCharactersSection({
  entries,
}: ProjectCharactersSectionProps) {
  if (entries.length === 0) {
    return (
      <StudioEmptyState
        headline={STUDIO_EMPTY_COPY.character.headline}
        description={STUDIO_EMPTY_COPY.character.description}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {entries.map(({ character, photoUrl }) => (
        <Link
          key={character.id}
          href={`/dashboard/characters/${character.id}`}
          className={`block ${studioCardSurface}`}
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-[var(--studio-empty-fill)]">
            {photoUrl ? (
              <CharacterPortraitImage
                photoUrl={photoUrl}
                focalY={character.portrait_focal_y}
                alt={character.name}
                className="transition duration-500 group-hover/card:scale-[1.02]"
              />
            ) : (
              <div className={studioEmptyArt}>
                <span className="text-[10px] uppercase tracking-wide text-[var(--brand-text-muted)]">
                  Portrait
                </span>
              </div>
            )}
          </div>
          <div className="px-4 py-3">
            <h3 className="truncate text-sm font-semibold text-[var(--foreground)]">
              {character.name}
            </h3>
            {character.species && (
              <p className="mt-0.5 truncate text-xs text-[var(--brand-text-secondary)]">
                {character.species}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
