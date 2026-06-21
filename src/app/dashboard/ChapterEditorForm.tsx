"use client";

import { useActionState } from "react";
import { updateChapter, type ChapterActionState } from "@/app/actions/chapters";
import type { Chapter } from "@/types/chapter";

type ChapterEditorFormProps = {
  chapter: Chapter;
  storyId: string;
  worldId: string;
};

export function ChapterEditorForm({
  chapter,
  storyId,
  worldId,
}: ChapterEditorFormProps) {
  const [state, formAction, pending] = useActionState<
    ChapterActionState,
    FormData
  >(updateChapter, {});

  const displayChapter = state.chapter ?? chapter;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="chapter_id" value={chapter.id} />
      <input type="hidden" name="story_id" value={storyId} />
      <input type="hidden" name="world_id" value={worldId} />

      {state.error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          Chapter saved.
        </p>
      )}

      <div>
        <label
          htmlFor="chapter-title"
          className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]"
        >
          Title
        </label>
        <input
          id="chapter-title"
          name="title"
          type="text"
          required
          maxLength={200}
          defaultValue={displayChapter.title}
          className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--brand-text-secondary)] outline-none focus:border-[var(--brand-accent)]"
        />
      </div>

      <div>
        <label
          htmlFor="chapter-content"
          className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]"
        >
          Content
        </label>
        <textarea
          id="chapter-content"
          name="content"
          rows={20}
          defaultValue={displayChapter.content}
          placeholder="Write your chapter here…"
          className="w-full resize-y rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 font-mono text-sm leading-relaxed text-[var(--brand-text-secondary)] outline-none placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)]"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--brand-accent)] px-4 py-2 text-sm font-semibold text-[var(--brand-accent-foreground)] shadow-sm transition hover:bg-[var(--brand-accent)] disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
