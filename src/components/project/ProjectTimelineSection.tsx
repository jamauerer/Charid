"use client";

import { useRouter } from "next/navigation";
import { StoryTimelinePanel } from "@/components/scene-workspace/StoryTimelinePanel";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import type { ProjectTimelineStory } from "@/app/actions/projects";
import type { SceneInsertPlacement } from "@/lib/scenes/scene-insert-order";
import Link from "next/link";

type ProjectTimelineSectionProps = {
  timelines: ProjectTimelineStory[];
};

function ProjectTimelineStoryPanel({
  storyId,
  storyTitle,
  worldId,
  scenes,
}: ProjectTimelineStory) {
  const router = useRouter();

  function handleInsert(_placement: SceneInsertPlacement) {
    router.push(
      `/dashboard/worlds/${worldId}/stories/${storyId}#story-scene-timeline`
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{storyTitle}</h3>
        <Link
          href={`/dashboard/worlds/${worldId}/stories/${storyId}#story-scene-timeline`}
          className="text-xs font-medium text-[var(--brand-text-secondary)] transition hover:text-[var(--foreground)]"
        >
          Open story timeline →
        </Link>
      </div>
      <StoryTimelinePanel
        worldId={worldId}
        storyId={storyId}
        scenes={scenes}
        onInsert={handleInsert}
      />
    </div>
  );
}

export function ProjectTimelineSection({ timelines }: ProjectTimelineSectionProps) {
  if (timelines.length === 0) {
    return (
      <StudioEmptyState
        headline="No timelines yet"
        description="Add a story and scenes to see scene ordering here."
      />
    );
  }

  return (
    <div className="space-y-8">
      {timelines.map((timeline) => (
        <ProjectTimelineStoryPanel key={timeline.storyId} {...timeline} />
      ))}
    </div>
  );
}
