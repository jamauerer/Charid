"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createChapter, type ChapterActionState } from "@/app/actions/chapters";
import { ModalPortal } from "@/components/ModalPortal";

type NewChapterModalProps = {
  worldId: string;
  storyId: string;
  triggerLabel?: string;
};

export function NewChapterModal({
  worldId,
  storyId,
  triggerLabel = "Create next chapter",
}: NewChapterModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<
    ChapterActionState,
    FormData
  >(createChapter, {});

  useEffect(() => {
    if (state.success && state.chapter) {
      setOpen(false);
      router.push(
        `/dashboard/worlds/${worldId}/stories/${storyId}/chapters/${state.chapter.id}`
      );
    }
  }, [state.success, state.chapter, worldId, storyId, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[var(--brand-accent)] px-3.5 py-1.5 text-sm font-semibold text-[var(--brand-accent-foreground)] shadow-sm transition hover:bg-[var(--brand-accent)]"
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
        {triggerLabel}
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
                      New Chapter
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--brand-text-secondary)]">
                      Start a new chapter in this story
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
                  <form action={formAction} className="space-y-4">
                    <input type="hidden" name="story_id" value={storyId} />
                    <input type="hidden" name="world_id" value={worldId} />

                    {state.error && (
                      <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
                        {state.error}
                      </p>
                    )}

                    <div>
                      <label
                        htmlFor="new-chapter-title"
                        className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]"
                      >
                        Title
                      </label>
                      <input
                        id="new-chapter-title"
                        name="title"
                        type="text"
                        required
                        maxLength={200}
                        placeholder="Chapter One"
                        autoFocus
                        className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--brand-text-secondary)] outline-none placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={pending}
                      className="w-full rounded-lg bg-[var(--brand-accent)] px-4 py-2 text-sm font-semibold text-[var(--brand-accent-foreground)] shadow-sm transition hover:bg-[var(--brand-accent)] disabled:opacity-50"
                    >
                      {pending ? "Creating..." : "Create Chapter"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
