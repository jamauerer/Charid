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
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
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
          className="mb-1.5 block text-xs font-medium text-zinc-400"
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
          className="w-full rounded-lg border border-white/10 bg-[#141416] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500/50"
        />
      </div>

      <div>
        <label
          htmlFor="chapter-content"
          className="mb-1.5 block text-xs font-medium text-zinc-400"
        >
          Content
        </label>
        <textarea
          id="chapter-content"
          name="content"
          rows={20}
          defaultValue={displayChapter.content}
          placeholder="Write your chapter here…"
          className="w-full resize-y rounded-lg border border-white/10 bg-[#141416] px-3 py-2 font-mono text-sm leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-500/50"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-500/15 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
