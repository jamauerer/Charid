"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteStory } from "@/app/actions/stories";
import { ConfirmDialog } from "@/components/studio/ConfirmDialog";

type StoryDeleteSectionProps = {
  storyId: string;
  storyTitle: string;
  projectId?: string | null;
};

export function StoryDeleteSection({
  storyId,
  storyTitle,
  projectId = null,
}: StoryDeleteSectionProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteStory(storyId);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (projectId) {
        router.push(`/dashboard/projects/${projectId}`);
      } else {
        router.push("/dashboard/stories");
      }
    });
  }

  return (
    <>
      <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--status-danger-text)]">
          Danger Zone
        </h3>
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
          Permanently delete this story and its scenes, chapters, and images.
        </p>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={pending}
          className="mt-3 inline-flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-1.5 text-sm font-medium text-[var(--status-danger-text)] transition hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-60"
        >
          {pending ? "Deleting…" : "Delete story"}
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete story"
        description={`Delete "${storyTitle}"? This cannot be undone.`}
        confirmLabel={pending ? "Deleting…" : "Delete story"}
        pending={pending}
        error={error}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!pending) {
            setConfirmOpen(false);
            setError(null);
          }
        }}
      />
    </>
  );
}
