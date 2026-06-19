import { StoryWorldHeader } from "@/components/story-workspace/StoryWorldHeader";
import { studioSection, studioSectionLabel } from "@/lib/visual-identity";
import { StoryLocationsPreview } from "@/components/story-workspace/StoryLocationsPreview";
import { StoryMapPreview } from "@/components/story-workspace/StoryMapPreview";
import { StoryMoodboardStrip } from "@/components/story-workspace/StoryMoodboardStrip";
import type { WorldLocationWithCover } from "@/types/world-location";
import type { WorldMapBundle } from "@/types/world-map";
import type { WorldMoodboardBundle } from "@/types/world-moodboard";

type StorySettingPanelProps = {
  storyId: string;
  worldId: string;
  worldName: string;
  locations: WorldLocationWithCover[];
  mapBundle: WorldMapBundle | null;
  moodboardBundle: WorldMoodboardBundle | null;
};

export function StorySettingPanel({
  storyId,
  worldId,
  worldName,
  locations,
  mapBundle,
  moodboardBundle,
}: StorySettingPanelProps) {
  return (
    <section id="story-setting" className={studioSection}>
      <div className="mb-6">
        <h2 className={studioSectionLabel}>Setting</h2>
        <div className="mt-4">
          <StoryWorldHeader
            storyId={storyId}
            currentWorld={{ id: worldId, name: worldName }}
          />
        </div>
      </div>

      <div className="space-y-8">
        <StoryLocationsPreview worldId={worldId} locations={locations} />
        <StoryMapPreview worldId={worldId} mapBundle={mapBundle} />
        <StoryMoodboardStrip
          worldId={worldId}
          moodboardBundle={moodboardBundle}
        />
      </div>
    </section>
  );
}
