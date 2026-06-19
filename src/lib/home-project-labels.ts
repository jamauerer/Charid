import type { ProjectWithCounts } from "@/types/project";
import {
  PROJECT_WORK_INTENT_LABELS,
  type ProjectWorkIntent,
} from "@/types/project";

export function projectWorkTypeLabel(
  workIntent: ProjectWorkIntent | null
): string {
  if (!workIntent) return "Creative project";
  return PROJECT_WORK_INTENT_LABELS[workIntent];
}

export function projectProgressLabel(project: ProjectWithCounts): string {
  const total =
    project.story_count + project.character_count + project.world_count;

  if (total === 0) return "Getting started";
  if (project.story_count > 0 && total <= 2) return "Story taking shape";
  if (total >= 5) return "In full swing";
  return "In progress";
}

export function formatLastActive(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
