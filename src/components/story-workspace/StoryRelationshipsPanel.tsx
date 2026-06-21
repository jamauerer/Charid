"use client";

import type { StoryCastBond } from "@/app/actions/story-workspace";
import { StoryRelationshipStrip } from "@/components/story-workspace/StoryRelationshipStrip";
import { studioSection, studioSectionLabel } from "@/lib/visual-identity";

type StoryRelationshipsPanelProps = {
  castBonds: StoryCastBond[];
  bondPhotoUrls: Record<string, string | null>;
};

export function StoryRelationshipsPanel({
  castBonds,
  bondPhotoUrls,
}: StoryRelationshipsPanelProps) {
  return (
    <section id="story-relationships" className={studioSection}>
      <div className="mb-4">
        <h2 className={studioSectionLabel}>Relationships</h2>
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
          How your cast connects — add or edit bonds on character pages.
        </p>
      </div>
      <StoryRelationshipStrip bonds={castBonds} photoUrls={bondPhotoUrls} />
    </section>
  );
}
