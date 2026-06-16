import type { StoryStatus } from "@/types/story";

const STATUS_STYLES: Record<StoryStatus, string> = {
  Idea: "bg-zinc-500/15 text-zinc-400",
  Planning: "bg-violet-500/15 text-violet-300",
  "In Progress": "bg-amber-500/15 text-amber-300",
  Complete: "bg-emerald-500/15 text-emerald-300",
};

type StoryStatusBadgeProps = {
  status: StoryStatus;
  className?: string;
};

export function StoryStatusBadge({ status, className = "" }: StoryStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[status]} ${className}`}
    >
      {status}
    </span>
  );
}
