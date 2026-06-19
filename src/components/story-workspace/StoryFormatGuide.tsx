"use client";

import { useEffect, useState } from "react";
import type { StoryProjectType } from "@/types/story";

const STORAGE_PREFIX = "charid-format-guide-dismissed";

type GuideContent = {
  title: string;
  body: string;
};

function guideForProjectType(projectType: StoryProjectType): GuideContent {
  switch (projectType) {
    case "graphic_novel":
    case "childrens_book":
      return {
        title: "How this story is built",
        body: "Scenes describe what happens — they may become pages and panels later. Chapters are optional and can group issues, acts, or story sections.",
      };
    case "novel":
      return {
        title: "How this story is built",
        body: "Scenes are story beats. Chapters hold the written prose. Many scenes can belong to one chapter.",
      };
    case "film_animation":
      return {
        title: "How this story is built",
        body: "Scenes are the primary structure. Chapters are optional. Think in terms of ordered scenes.",
      };
    case "other":
    default:
      return {
        title: "How this story is built",
        body: "Start with scenes. Organize into chapters later when the story becomes clearer.",
      };
  }
}

type StoryFormatGuideProps = {
  storyId: string;
  projectType: StoryProjectType;
};

export function StoryFormatGuide({ storyId, projectType }: StoryFormatGuideProps) {
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  const guide = guideForProjectType(projectType);
  const storageKey = `${STORAGE_PREFIX}-${storyId}`;

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(storageKey) === "1");
    } catch {
      setDismissed(false);
    }
  }, [storageKey]);

  function dismiss() {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  if (dismissed === null || dismissed) {
    return null;
  }

  return (
    <div className="mb-5 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-neutral-900">{guide.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600">{guide.body}</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md px-2 py-1 text-xs text-neutral-500 transition hover:bg-[var(--brand-surface-elevated)] hover:text-neutral-700"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
