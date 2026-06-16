import type { StoryProjectType } from "@/types/story";
import { STORY_PROJECT_TYPE_LABELS } from "@/types/story";

const TYPE_STYLES: Record<StoryProjectType, string> = {
  novel: "bg-sky-500/15 text-sky-300",
  graphic_novel: "bg-fuchsia-500/15 text-fuchsia-300",
  film_animation: "bg-orange-500/15 text-orange-300",
  childrens_book: "bg-pink-500/15 text-pink-300",
  other: "bg-zinc-500/15 text-zinc-400",
};

type StoryProjectTypeBadgeProps = {
  projectType: StoryProjectType;
  className?: string;
};

export function StoryProjectTypeBadge({
  projectType,
  className = "",
}: StoryProjectTypeBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_STYLES[projectType]} ${className}`}
    >
      {STORY_PROJECT_TYPE_LABELS[projectType]}
    </span>
  );
}
