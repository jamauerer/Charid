import { StoryWorldHeader } from "@/components/story-workspace/StoryWorldHeader";
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
  embedded?: boolean;
};

export function StorySettingPanel({
  storyId,
  worldId,
  worldName,
  locations,
  mapBundle,
  moodboardBundle,
  embedded = false,
}: StorySettingPanelProps) {
  const content = (
    <>
      <StoryWorldHeader
        storyId={storyId}
        currentWorld={{ id: worldId, name: worldName }}
      />
      <div className="mt-8 space-y-8">
        <StoryLocationsPreview worldId={worldId} locations={locations} />
        <StoryMapPreview worldId={worldId} mapBundle={mapBundle} />
        <StoryMoodboardStrip
          worldId={worldId}
          moodboardBundle={moodboardBundle}
        />
      </div>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <section id="story-setting" className="mb-10 scroll-mt-6">
      {content}
    </section>
  );
}
