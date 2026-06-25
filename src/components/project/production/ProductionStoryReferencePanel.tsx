"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type {
  ProjectCharacterEntry,
  ProjectSceneRollupEntry,
  ProjectStoryEntry,
} from "@/app/actions/projects";

type ProductionStoryReferencePanelProps = {
  stories: ProjectStoryEntry[];
  sceneRollup: ProjectSceneRollupEntry[];
  characters: ProjectCharacterEntry[];
};

export function ProductionStoryReferencePanel({
  stories,
  sceneRollup,
  characters,
}: ProductionStoryReferencePanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="production-story-reference shrink-0 border-t border-[var(--brand-border)] bg-[var(--brand-surface)]"
    >
      <summary className="cursor-pointer list-none px-4 py-2 text-xs font-medium text-[var(--brand-text-secondary)] marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden>{open ? "▾" : "▸"}</span>
          Story Reference
          <span className="rounded bg-[var(--brand-surface-elevated)] px-1.5 py-0.5 text-[10px] font-normal uppercase tracking-wide text-[var(--brand-text-muted)]">
            Read-only
          </span>
        </span>
      </summary>
      <div className="border-t border-[var(--brand-border)] px-4 py-3">
        <p className="mb-3 text-xs text-[var(--brand-text-muted)]">
          Your story lives in the Story Layer. Production references it here — open an
          item in Story to edit.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StoryReferenceSection title="Stories">
            {stories.length === 0 ? (
              <EmptyHint />
            ) : (
              <ul className="space-y-1">
                {stories.map(({ story, world }) => (
                  <li key={story.id}>
                    <Link href={`/dashboard/worlds/${world.id}/stories/${story.id}`} className="story-ref-link">
                      {story.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </StoryReferenceSection>
          <StoryReferenceSection title="Characters">
            {characters.length === 0 ? (
              <EmptyHint />
            ) : (
              <ul className="space-y-1">
                {characters.slice(0, 10).map(({ character }) => (
                  <li key={character.id}>
                    <Link href={`/dashboard/characters/${character.id}`} className="story-ref-link">
                      {character.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </StoryReferenceSection>
          <StoryReferenceSection title="Scenes">
            {sceneRollup.length === 0 ? (
              <EmptyHint />
            ) : (
              <ul className="space-y-1">
                {sceneRollup.slice(0, 10).map((entry) => (
                  <li key={entry.sceneId}>
                    <Link
                      href={`/dashboard/worlds/${entry.worldId}/stories/${entry.storyId}/scenes/${entry.sceneId}`}
                      className="story-ref-link"
                    >
                      {entry.sceneTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </StoryReferenceSection>
          <StoryReferenceSection title="Assets">
            <p className="text-xs text-[var(--brand-text-muted)]">
              Style references and gallery assets — coming soon.
            </p>
          </StoryReferenceSection>
          <StoryReferenceSection title="Timeline">
            <p className="text-xs text-[var(--brand-text-muted)]">
              Story timeline view — coming soon.
            </p>
          </StoryReferenceSection>
          <StoryReferenceSection title="Reference Images">
            <p className="text-xs text-[var(--brand-text-muted)]">
              Visual references for this book — coming soon.
            </p>
          </StoryReferenceSection>
        </div>
      </div>
    </details>
  );
}

function StoryReferenceSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
        {title}
      </h3>
      <div className="mt-1.5">{children}</div>
    </section>
  );
}

function EmptyHint() {
  return <p className="text-xs text-[var(--brand-text-muted)]">None yet.</p>;
}
