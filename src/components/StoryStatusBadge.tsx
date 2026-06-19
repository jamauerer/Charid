import type { StoryStatus } from "@/types/story";
import { dsStatusInfo, dsStatusSuccess, dsChip } from "@/lib/design-system";

const STATUS_STYLES: Record<StoryStatus, string> = {
  Idea: dsChip,
  Planning: dsStatusInfo,
  "In Progress": dsStatusInfo,
  Complete: dsStatusSuccess,
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
