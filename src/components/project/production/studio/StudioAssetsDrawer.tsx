"use client";

import Link from "next/link";
import type {
  ProjectCharacterEntry,
  ProjectSceneRollupEntry,
  ProjectStoryEntry,
} from "@/app/actions/projects";

type StudioAssetsDrawerProps = {
  open: boolean;
  onToggle: () => void;
  stories: ProjectStoryEntry[];
  sceneRollup: ProjectSceneRollupEntry[];
  characters: ProjectCharacterEntry[];
};

export function StudioAssetsDrawer({
  open,
  onToggle,
  stories,
  sceneRollup,
  characters,
}: StudioAssetsDrawerProps) {
  return (
    <details
      open={open}
      onToggle={(event) => {
        if (event.currentTarget.open !== open) onToggle();
      }}
      className="charid-studio-assets shrink-0 border-t border-[var(--brand-border)] bg-[var(--brand-surface)]"
    >
      <summary className="cursor-pointer list-none px-3 py-1.5 text-[11px] font-medium text-[var(--brand-text-secondary)] marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden>{open ? "▾" : "▸"}</span>
          Assets
        </span>
      </summary>
      <div className="grid gap-3 border-t border-[var(--brand-border)] px-3 py-2 sm:grid-cols-2 lg:grid-cols-4">
        <AssetSection title="Characters" count={characters.length}>
          {characters.slice(0, 6).map(({ character }) => (
            <Link key={character.id} href={`/dashboard/characters/${character.id}`} className="charid-studio-asset-link">
              {character.name}
            </Link>
          ))}
        </AssetSection>
        <AssetSection title="Scenes" count={sceneRollup.length}>
          {sceneRollup.slice(0, 6).map((entry) => (
            <Link
              key={entry.sceneId}
              href={`/dashboard/worlds/${entry.worldId}/stories/${entry.storyId}/scenes/${entry.sceneId}`}
              className="charid-studio-asset-link"
            >
              {entry.sceneTitle}
            </Link>
          ))}
        </AssetSection>
        <AssetSection title="Stories" count={stories.length}>
          {stories.slice(0, 4).map(({ story, world }) => (
            <Link
              key={story.id}
              href={`/dashboard/worlds/${world.id}/stories/${story.id}`}
              className="charid-studio-asset-link"
            >
              {story.title}
            </Link>
          ))}
        </AssetSection>
        <AssetSection title="Reference images" count={0}>
          <span className="charid-studio-asset-item text-[var(--brand-text-muted)]">
            Use the Reference tool when available.
          </span>
        </AssetSection>
      </div>
    </details>
  );
}

function AssetSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
        {title} {count > 0 && <span className="font-normal">({count})</span>}
      </p>
      <div className="mt-1 flex flex-col gap-0.5 text-[11px]">{children}</div>
    </section>
  );
}
