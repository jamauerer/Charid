"use client";

import { useEffect, useState } from "react";
import type { ProjectWorkIntent } from "@/types/project";

const STORAGE_PREFIX = "charid-project-format-guide-dismissed";

type GuideContent = {
  title: string;
  body: string;
};

function guideForWorkIntent(workIntent: ProjectWorkIntent | null): GuideContent {
  switch (workIntent) {
    case "novel":
      return {
        title: "How this novel project works",
        body: "Start with a story and scenes. Characters and style references keep everything consistent as you write.",
      };
    case "comic":
    case "picture_book":
      return {
        title: "How this illustrated project works",
        body: "Set your style references early, then build scenes beat by beat. Pages and panels come later.",
      };
    case "screenplay":
      return {
        title: "How this screenplay project works",
        body: "Scenes are the spine. Add characters and locations as they appear in your script.",
      };
    case "worldbuilding":
      return {
        title: "How this worldbuilding project works",
        body: "Start with setting and references. Stories and scenes can follow when you're ready.",
      };
    case "exploring":
    default:
      return {
        title: "How this project works",
        body: "Add a story or character when inspiration strikes. Style references help if you add art later.",
      };
  }
}

type ProjectFormatGuideProps = {
  projectId: string;
  workIntent: ProjectWorkIntent | null;
};

export function ProjectFormatGuide({
  projectId,
  workIntent,
}: ProjectFormatGuideProps) {
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  const guide = guideForWorkIntent(workIntent);
  const storageKey = `${STORAGE_PREFIX}-${projectId}`;

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
