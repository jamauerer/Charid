import { StoryCharacterSection } from "@/components/StoryCharacterSection";
import { StoryRelationshipStrip } from "@/components/story-workspace/StoryRelationshipStrip";
import type {
  StoryCastBond,
  StoryWorkspaceContext,
} from "@/app/actions/story-workspace";
import { studioSection, studioSectionLabel } from "@/lib/visual-identity";

type StoryCastConnectionsPanelProps = {
  storyId: string;
  worldId: string;
  worldName: string;
  projectId?: string | null;
  cast: StoryWorkspaceContext["cast"];
  castPhotoUrls: Record<string, string | null>;
  castBonds: StoryCastBond[];
  bondPhotoUrls: Record<string, string | null>;
};

export function StoryCastConnectionsPanel({
  storyId,
  worldId,
  worldName,
  projectId = null,
  cast,
  castPhotoUrls,
  castBonds,
  bondPhotoUrls,
}: StoryCastConnectionsPanelProps) {
  return (
    <section id="cast-connections" className={studioSection}>
      <div className="mb-4">
        <h2 className={studioSectionLabel}>Cast &amp; Connections</h2>
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
          Your story roster and how cast members connect — edit portraits and
          bonds on character pages.
        </p>
      </div>

      <StoryCharacterSection
        storyId={storyId}
        worldId={worldId}
        worldName={worldName}
        projectId={projectId}
        initialEntries={cast}
        photoUrls={castPhotoUrls}
      />

      <StoryRelationshipStrip bonds={castBonds} photoUrls={bondPhotoUrls} />
    </section>
  );
}
