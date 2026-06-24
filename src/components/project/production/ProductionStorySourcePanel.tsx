"use client";

import Link from "next/link";
import type {
  ProjectCharacterEntry,
  ProjectSceneRollupEntry,
  ProjectStoryEntry,
} from "@/app/actions/projects";

type ProductionStorySourcePanelProps = {
  stories: ProjectStoryEntry[];
  sceneRollup: ProjectSceneRollupEntry[];
  characters: ProjectCharacterEntry[];
};

export function ProductionStorySourcePanel({
  stories,
  sceneRollup,
  characters,
}: ProductionStorySourcePanelProps) {
  return (
    <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
        Story Layer (source of truth)
      </h3>
      <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
        Production organizes your story — it does not replace it. Scene linking
        comes in a future milestone.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
            Source Stories
          </h4>
          {stories.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--brand-text-muted)]">No stories yet.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {stories.map(({ story, world }) => (
                <li key={story.id}>
                  <Link
                    href={`/dashboard/worlds/${world.id}/stories/${story.id}`}
                    className="text-sm text-[var(--foreground)] hover:underline"
                  >
                    {story.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
            Source Scenes
          </h4>
          {sceneRollup.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--brand-text-muted)]">No scenes yet.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {sceneRollup.slice(0, 8).map((entry) => (
                <li key={entry.sceneId}>
                  <Link
                    href={`/dashboard/worlds/${entry.worldId}/stories/${entry.storyId}/scenes/${entry.sceneId}`}
                    className="text-sm text-[var(--foreground)] hover:underline"
                  >
                    {entry.sceneTitle}
                  </Link>
                  <span className="ml-1 text-xs text-[var(--brand-text-muted)]">
                    · {entry.storyTitle}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
            Source Characters
          </h4>
          {characters.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--brand-text-muted)]">No characters yet.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {characters.slice(0, 8).map(({ character }) => (
                <li key={character.id}>
                  <Link
                    href={`/dashboard/characters/${character.id}`}
                    className="text-sm text-[var(--foreground)] hover:underline"
                  >
                    {character.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
