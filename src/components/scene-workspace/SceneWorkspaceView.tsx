"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteScene } from "@/app/actions/scenes";
import type { StoryProjectContext } from "@/app/actions/projects";
import type { StoryCharacterEntry } from "@/app/actions/stories";
import type { SceneWithCast } from "@/types/scene";
import { SceneCreateStudio } from "@/components/scene-workspace/SceneCreateStudio";
import type { StoryLocationOption } from "@/components/scene-workspace/SceneCard";
import { CreatorContextTrail } from "@/components/studio/CreatorContextTrail";
import { CREATOR_STORY } from "@/lib/creator-vocabulary";
import {
  studioBtnSecondary,
  studioPanel,
  studioWarmChip,
} from "@/lib/visual-identity";

type SceneWorkspaceViewProps = {
  worldId: string;
  storyId: string;
  storyTitle: string;
  scene: SceneWithCast;
  cast: StoryCharacterEntry[];
  locations?: StoryLocationOption[];
  projectContext?: StoryProjectContext | null;
  worldName?: string;
  hasActiveSuggestions?: boolean;
};

export function SceneWorkspaceView({
  worldId,
  storyId,
  storyTitle,
  scene,
  cast,
  locations = [],
  projectContext = null,
  worldName,
  hasActiveSuggestions = false,
}: SceneWorkspaceViewProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [editSession, setEditSession] = useState(0);
  const [pending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const storyHref = `/dashboard/worlds/${worldId}/stories/${storyId}`;
  const suggestionsHref = `${storyHref}#story-scene-suggestions`;

  function openEdit() {
    setEditSession((s) => s + 1);
    setEditOpen(true);
  }

  function handleDelete() {
    if (
      !window.confirm(
        `Delete "${scene.title}"? This cannot be undone.`
      )
    ) {
      return;
    }
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteScene(storyId, scene.id, worldId);
      if (result.error) {
        setDeleteError(result.error);
        return;
      }
      router.push(`${storyHref}#story-timeline-section`);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <CreatorContextTrail
        className="mb-6"
        project={
          projectContext
            ? {
                label: projectContext.title,
                href: `/dashboard/projects/${projectContext.id}`,
              }
            : null
        }
        story={{ label: storyTitle, href: storyHref }}
        current={{ label: scene.title }}
        world={
          worldName
            ? {
                label: worldName,
                href: `/dashboard/worlds/${worldId}`,
              }
            : undefined
        }
      />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--brand-text-secondary)] sm:text-3xl">
            {scene.title}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openEdit}
            className={studioBtnSecondary}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="inline-flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-1.5 text-sm font-medium text-[var(--status-danger-text)] transition hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-60"
          >
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      {hasActiveSuggestions && (
        <div className="mb-6 rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-4 py-3">
          <p className="text-sm font-medium text-neutral-900/90">
            {CREATOR_STORY.reviewActiveSuggestionsLabel}
          </p>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            {CREATOR_STORY.reviewActiveSuggestionsHint}
          </p>
          <Link
            href={suggestionsHref}
            className="mt-2 inline-block text-sm font-medium text-[var(--brand-text-secondary)] underline-offset-2 transition hover:text-neutral-900 hover:underline"
          >
            Review on story workspace →
          </Link>
        </div>
      )}

      {deleteError && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {deleteError}
        </p>
      )}

      <div className={`${studioPanel} mb-6 p-5 sm:p-6`}>
        <div className="space-y-5">
          <div>
            <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-secondary)]">
              {CREATOR_STORY.sceneWhatHappensLabel}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-[var(--brand-text-secondary)]">
              {scene.summary}
            </p>
          </div>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-secondary)]">
              Characters
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {scene.characters.length === 0 ? (
                <span className="text-sm text-[var(--brand-text-secondary)]">None selected</span>
              ) : (
                scene.characters.map((c) => (
                  <span key={c.id} className={studioWarmChip}>
                    {c.name}
                  </span>
                ))
              )}
            </div>
          </div>

          {scene.location_display && (
            <div>
              <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-secondary)]">
                {CREATOR_STORY.sceneLocationLabel}
              </h2>
              <p className="mt-2 text-sm text-[var(--brand-text-secondary)]">
                {scene.location_display}
              </p>
            </div>
          )}
        </div>
      </div>

      {editOpen && (
        <SceneCreateStudio
          key={`edit-scene-${editSession}`}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          worldId={worldId}
          storyId={storyId}
          cast={cast}
          locations={locations}
          scene={scene}
        />
      )}
    </div>
  );
}
