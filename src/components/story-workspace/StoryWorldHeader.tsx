"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { changeStoryWorld } from "@/app/actions/stories";
import { getWorldSelectOptions } from "@/app/actions/worlds";
import { WorldForm } from "@/app/dashboard/WorldForm";
import { FormModalShell } from "@/components/dashboard/FormModalShell";
import { selectClassName } from "@/components/CharacterFormFields";
import type { World } from "@/types/world";
import { studioBtnPrimarySm, studioBtnSecondary } from "@/lib/visual-identity";

type StoryWorldHeaderProps = {
  storyId: string;
  currentWorld: { id: string; name: string };
};

export function StoryWorldHeader({
  storyId,
  currentWorld,
}: StoryWorldHeaderProps) {
  const router = useRouter();
  const [changeOpen, setChangeOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [worlds, setWorlds] = useState<{ id: string; name: string }[]>([]);
  const [selectedWorldId, setSelectedWorldId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openChangeModal() {
    setError(null);
    setSelectedWorldId("");
    setChangeOpen(true);
    getWorldSelectOptions().then(setWorlds);
  }

  function navigateToStory(worldId: string) {
    router.push(`/dashboard/worlds/${worldId}/stories/${storyId}`);
    router.refresh();
  }

  function handleChangeWorld() {
    if (!selectedWorldId) {
      setError("Choose a world.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await changeStoryWorld(storyId, selectedWorldId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setChangeOpen(false);
      if (result.worldId) {
        navigateToStory(result.worldId);
      }
    });
  }

  function handleWorldCreated(world: World) {
    startTransition(async () => {
      setError(null);
      const result = await changeStoryWorld(storyId, world.id);
      setCreateOpen(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      navigateToStory(world.id);
    });
  }

  const otherWorlds = worlds.filter((world) => world.id !== currentWorld.id);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-[var(--brand-text-secondary)]">
            <Link
              href={`/dashboard/worlds/${currentWorld.id}`}
              className="transition hover:text-neutral-600"
            >
              {currentWorld.name}
            </Link>
          </p>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            Places and visuals for this story — edit locations, map, and mood on
            the world page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/worlds/${currentWorld.id}`}
            className={studioBtnPrimarySm}
          >
            Open world
          </Link>
          <button
            type="button"
            onClick={openChangeModal}
            className={studioBtnSecondary}
          >
            Change world
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setCreateOpen(true);
            }}
            className={studioBtnSecondary}
          >
            Create world
          </button>
        </div>
      </div>

      {error && !changeOpen && !createOpen && (
        <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {error}
        </p>
      )}

      {changeOpen && (
        <FormModalShell
          title="Change World"
          subtitle="Move this story to another world. Characters not in the new world will be unlinked from the story."
          onClose={() => setChangeOpen(false)}
          maxWidth="md"
        >
          {otherWorlds.length === 0 ? (
            <p className="text-sm text-[var(--brand-text-secondary)]">
              You don&apos;t have another world yet. Create one to move this
              story.
            </p>
          ) : (
            <div>
              <label
                htmlFor="story-world-select"
                className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]"
              >
                World
              </label>
              <select
                id="story-world-select"
                value={selectedWorldId}
                onChange={(e) => setSelectedWorldId(e.target.value)}
                className={selectClassName}
              >
                <option value="">Select a world…</option>
                {otherWorlds.map((world) => (
                  <option key={world.id} value={world.id}>
                    {world.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
              {error}
            </p>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setChangeOpen(false)}
              className="rounded-lg border border-[var(--brand-border)] px-4 py-2 text-sm font-medium text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface)]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending || otherWorlds.length === 0}
              onClick={handleChangeWorld}
              className="rounded-lg bg-gradient-to-r bg-[var(--brand-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Moving…" : "Move story"}
            </button>
          </div>
        </FormModalShell>
      )}

      {createOpen && (
        <FormModalShell
          title="Create New World"
          subtitle="Creates a world and moves this story into it"
          onClose={() => setCreateOpen(false)}
        >
          <WorldForm onCreated={handleWorldCreated} onSuccess={() => {}} />
        </FormModalShell>
      )}
    </>
  );
}
