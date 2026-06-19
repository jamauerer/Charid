"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateSceneSuggestions } from "@/app/actions/scene-suggestions";
import type { StoryCharacterEntry } from "@/app/actions/stories";
import type { Chapter } from "@/types/chapter";
import { CREATOR_STORY } from "@/lib/creator-vocabulary";
import { studioBtnSecondary } from "@/lib/visual-identity";

type SceneChapterSuggestPanelProps = {
  worldId: string;
  storyId: string;
  chapter: Chapter;
  cast: StoryCharacterEntry[];
};

export function SceneChapterSuggestPanel({
  worldId,
  storyId,
  chapter,
  cast,
}: SceneChapterSuggestPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      await generateSceneSuggestions({
        worldId,
        storyId,
        chapterId: chapter.id,
      });
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3">
      <p className="text-sm text-[var(--brand-text-secondary)]">
        {CREATOR_STORY.chapterToScenesLabel}
      </p>
      <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
        {CREATOR_STORY.chapterToScenesHint}
      </p>
      <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
        Chapter: <span className="text-[var(--brand-text-secondary)]">{chapter.title}</span>
      </p>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={pending || cast.length === 0}
        className={`${studioBtnSecondary} mt-3 text-xs`}
      >
        {pending ? "Generating…" : CREATOR_STORY.generateSceneSuggestionsLabel}
      </button>
    </div>
  );
}
