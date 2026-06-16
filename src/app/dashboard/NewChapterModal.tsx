"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createChapter, type ChapterActionState } from "@/app/actions/chapters";
import { ModalPortal } from "@/components/ModalPortal";

type NewChapterModalProps = {
  worldId: string;
  storyId: string;
};

export function NewChapterModal({ worldId, storyId }: NewChapterModalProps) {
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
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm shadow-violet-500/15 transition hover:from-violet-500 hover:to-indigo-500"
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
        New Chapter
      </button>

      {open && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <button
              type="button"
              aria-label="Close dialog"
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
              <div className="relative z-10 flex w-full max-w-lg max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#141416] shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
                <div className="shrink-0 flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-100">
                      New Chapter
                    </h2>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Start a new chapter in this story
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-300"
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
                      <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                        {state.error}
                      </p>
                    )}

                    <div>
                      <label
                        htmlFor="new-chapter-title"
                        className="mb-1.5 block text-xs font-medium text-zinc-400"
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
                        className="w-full rounded-lg border border-white/10 bg-[#141416] px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-500/50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={pending}
                      className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-500/15 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
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
