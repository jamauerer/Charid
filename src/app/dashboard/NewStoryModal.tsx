"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ModalPortal } from "@/components/ModalPortal";
import { StoryForm } from "./StoryForm";

type NewStoryModalProps = {
  /** Setting workspace — story create from a setting page. */
  worldId?: string;
  /** Project workspace — uses auto-provisioned setting internally. */
  projectId?: string;
};

export function NewStoryModal({ worldId, projectId }: NewStoryModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const subtitle = projectId
    ? "Add a story to this project"
    : "Plan a story within this setting";

  function handleSuccess(story: { id: string; world_id: string }) {
    setOpen(false);
    router.push(
      `/dashboard/worlds/${story.world_id}/stories/${story.id}?welcome=1`
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r bg-[var(--brand-accent)] px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm shadow-violet-500/15 transition hover:bg-[var(--brand-accent-hover)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
        </svg>
        New Story
      </button>

      {open && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <button
              type="button"
              aria-label="Close dialog"
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />
            <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
              <div className="relative z-10 flex w-full max-w-lg max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] shadow-lg sm:max-h-[calc(100dvh-3rem)]">
                <div className="shrink-0 flex items-center justify-between border-b border-[var(--brand-border)] px-5 py-4">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--brand-text-secondary)]">
                      New Story
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--brand-text-secondary)]">
                      {subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-md p-1.5 text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--brand-text-secondary)]"
                    aria-label="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5"
                      aria-hidden
                    >
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                    </svg>
                  </button>
                </div>
                <div className="overflow-y-auto p-5">
                  <StoryForm
                    worldId={worldId}
                    projectId={projectId}
                    onSuccess={handleSuccess}
                  />
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
