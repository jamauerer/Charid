"use client";

import { studioCreativeEmptyCover } from "@/lib/visual-identity";
import { EMPTY_PLACEHOLDER_COPY } from "@/lib/studio-empty-copy";

type CardCoverPlaceholderProps = {
  title?: string;
  description?: string;
  compact?: boolean;
};

export function CardCoverPlaceholder({
  title = EMPTY_PLACEHOLDER_COPY.cover.title,
  description = EMPTY_PLACEHOLDER_COPY.cover.description,
  compact = false,
}: CardCoverPlaceholderProps) {
  return (
    <div className={`${studioCreativeEmptyCover} ${compact ? "min-h-[5rem] py-4" : ""}`}>
      <p className="text-xs font-medium text-neutral-600">{title}</p>
      {description && !compact && (
        <p className="max-w-[14rem] text-[10px] leading-relaxed text-neutral-500">
          {description}
        </p>
      )}
    </div>
  );
}
