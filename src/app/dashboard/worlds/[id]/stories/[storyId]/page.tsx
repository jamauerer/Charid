import { redirect, notFound } from "next/navigation";
import { getChaptersByStoryId } from "@/app/actions/chapters";
import { getScenesByStoryId } from "@/app/actions/scenes";
import { getActiveSceneSuggestionBatch } from "@/app/actions/scene-suggestions";
import { getStoryProjectContext } from "@/app/actions/projects";
import { getStoryWorkspaceContext } from "@/app/actions/story-workspace";
import { getWorldById } from "@/app/actions/worlds";
import { EditStoryForm } from "@/app/dashboard/EditStoryForm";
import { StoryDeleteSection } from "@/components/story-workspace/StoryDeleteSection";
import { StoryFinishPath } from "@/components/dashboard/StoryFinishPath";
import { StoryChaptersPanel } from "@/components/dashboard/StoryChaptersPanel";
import { StoryScenesPanel } from "@/components/scene-workspace/StoryScenesPanel";
import { StorySceneSuggestionsSection } from "@/components/story-workspace/StorySceneSuggestionsSection";
import { StorySummarySection } from "@/components/story-workspace/StorySummarySection";
import { StoryCharactersPanel } from "@/components/story-workspace/StoryCharactersPanel";
import { StoryRelationshipsPanel } from "@/components/story-workspace/StoryRelationshipsPanel";
import { StorySettingPanel } from "@/components/story-workspace/StorySettingPanel";
import { StoryFormatGuide } from "@/components/story-workspace/StoryFormatGuide";
import { StoryWorkspaceHeader } from "@/components/story-workspace/StoryWorkspaceHeader";
import { CollapsibleWorkspaceSection } from "@/components/dashboard/CollapsibleWorkspaceSection";
import { resolveStoryFinishPath } from "@/lib/story-finish-path";
import { studioSection } from "@/lib/visual-identity";

type StoryDetailPageProps = {
  params: Promise<{ id: string; storyId: string }>;
};

export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { id: worldId, storyId } = await params;

  const { world, error: worldError } = await getWorldById(worldId);
  if (worldError === "You must be logged in.") {
    redirect("/login");
  }
  if (!world) {
    notFound();
  }

  const { context, error: contextError } = await getStoryWorkspaceContext(
    worldId,
    storyId
  );
  if (!context) {
    if (contextError?.includes("not found")) {
      notFound();
    }
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-[var(--status-info-text)]">
        {contextError ?? "Could not load story workspace."}
      </div>
    );
  }

  const { story } = context;

  const { project: projectContext } = await getStoryProjectContext(
    storyId,
    worldId
  );

  const { chapters } = await getChaptersByStoryId(storyId);
  const { scenes, error: scenesError } = await getScenesByStoryId(storyId);
  const { batch: suggestionBatch, error: suggestionError } =
    await getActiveSceneSuggestionBatch(storyId);

  const finishPath = resolveStoryFinishPath({
    worldId,
    storyId,
    projectType: story.project_type,
    chapters,
    characterCount: context.cast.length,
    sceneCount: scenes.length,
    locationCount: context.locations.length,
    hasCoverImage: Boolean(story.featured_image_id),
  });

  const migrationError = context.worldbuildingError;
  const storyLocations = context.locations.map(({ location }) => ({
    id: location.id,
    name: location.name,
  }));

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <StoryWorkspaceHeader
        storyTitle={story.title}
        storyStatus={story.status}
        projectTitle={projectContext?.title ?? null}
        projectHref={
          projectContext
            ? `/dashboard/projects/${projectContext.id}`
            : null
        }
      />

      {migrationError && (
        <div className="mb-4 rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2.5 text-sm text-[var(--foreground)]">
          {migrationError}
        </div>
      )}

      <StorySummarySection summary={story.summary} />

      <StoryFinishPath finishPath={finishPath} />

      <StorySceneSuggestionsSection
        worldId={worldId}
        storyId={storyId}
        storyTitle={story.title}
        initialBatch={suggestionBatch}
        cast={context.cast}
        chapters={chapters}
        locations={storyLocations}
        batchError={suggestionError}
      />

      <StoryScenesPanel
        worldId={worldId}
        storyId={storyId}
        scenes={scenes}
        cast={context.cast}
        locations={storyLocations}
        scenesError={scenesError}
      />

      <StoryCharactersPanel
        storyId={storyId}
        worldId={worldId}
        worldName={world.name}
        projectId={projectContext?.id ?? null}
        cast={context.cast}
        castPhotoUrls={context.castPhotoUrls}
      />

      <StoryRelationshipsPanel
        castBonds={context.castBonds}
        bondPhotoUrls={context.bondPhotoUrls}
      />

      <CollapsibleWorkspaceSection
        id="story-setting"
        title="Setting"
        hint="Story context — locations, map, and mood references."
      >
        <StorySettingPanel
          storyId={storyId}
          worldId={worldId}
          worldName={world.name}
          locations={context.locations}
          mapBundle={context.mapBundle}
          moodboardBundle={context.moodboardBundle}
          embedded
        />
      </CollapsibleWorkspaceSection>

      <CollapsibleWorkspaceSection
        id="story-advanced"
        title="Advanced"
        hint="Chapters, format guide, and story details."
      >
        <div className="space-y-8">
          <StoryFormatGuide storyId={storyId} projectType={story.project_type} />
          <StoryChaptersPanel
            worldId={worldId}
            storyId={storyId}
            chapters={chapters}
            continueChapter={finishPath.continueChapter}
          />
          <aside id="story-details" className={`${studioSection} scroll-mt-6`}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
              Story details
            </h2>
            <EditStoryForm story={story} worldId={worldId} />
            <StoryDeleteSection
              storyId={storyId}
              storyTitle={story.title}
              projectId={projectContext?.id ?? null}
            />
          </aside>
        </div>
      </CollapsibleWorkspaceSection>
    </div>
  );
}
