import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { getChaptersByStoryId } from "@/app/actions/chapters";
import { getScenesByStoryId } from "@/app/actions/scenes";
import { getActiveSceneSuggestionBatch } from "@/app/actions/scene-suggestions";
import { getStoryProjectContext } from "@/app/actions/projects";
import { getStoryBibleBundle } from "@/app/actions/story-bible";
import { getStoryWorkspaceContext } from "@/app/actions/story-workspace";
import { getWorldById } from "@/app/actions/worlds";
import { EditStoryForm } from "@/app/dashboard/EditStoryForm";
import { StoryBibleView } from "@/components/story-bible/StoryBibleView";
import { StoryFinishPath } from "@/components/dashboard/StoryFinishPath";
import { StoryChaptersPanel } from "@/components/dashboard/StoryChaptersPanel";
import { StoryScenesPanel } from "@/components/scene-workspace/StoryScenesPanel";
import { StoryAdvancedPlan } from "@/components/dashboard/StoryAdvancedPlan";
import { StoryWelcomeBanner } from "@/components/dashboard/StoryWelcomeBanner";
import { StoryCastConnectionsPanel } from "@/components/story-workspace/StoryCastConnectionsPanel";
import { StorySettingPanel } from "@/components/story-workspace/StorySettingPanel";
import { StoryFormatGuide } from "@/components/story-workspace/StoryFormatGuide";
import { StoryStatusBadge } from "@/components/StoryStatusBadge";
import { CreatorContextTrail } from "@/components/studio/CreatorContextTrail";
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

  const [{ bundle, error: bibleError }, { project: projectContext }] =
    await Promise.all([
      getStoryBibleBundle(storyId),
      getStoryProjectContext(storyId, worldId),
    ]);

  if (!bundle) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <CreatorContextTrail
          project={
            projectContext
              ? {
                  label: projectContext.title,
                  href: `/dashboard/projects/${projectContext.id}`,
                }
              : null
          }
          story={{ label: story.title }}
          world={{
            label: world.name,
            href: `/dashboard/worlds/${worldId}`,
          }}
        />
        <p className="mt-6 rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]">
          {bibleError ??
            "Could not load story workspace. Run the story_bible migration in Supabase."}
        </p>
      </div>
    );
  }

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
    hasCoverImage: Boolean(story.featured_image_id ?? bundle.featuredImageId),
  });

  const migrationError =
    bibleError?.includes("story_bible") ||
    bibleError?.includes("story_image_slot_assignments")
      ? bibleError
      : context.worldbuildingError;

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <CreatorContextTrail
        className="mb-6"
        project={
          projectContext
            ? {
                label: projectContext.title,
                href: `/dashboard/projects/${projectContext.id}`,
              }
            : null
        }
        story={{ label: story.title }}
        world={{
          label: world.name,
          href: `/dashboard/worlds/${worldId}`,
        }}
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--brand-text-secondary)] sm:text-3xl">
            {story.title}
          </h1>
        </div>
        <StoryStatusBadge status={story.status} />
      </div>

      <StoryFormatGuide storyId={storyId} projectType={story.project_type} />

      {migrationError && (
        <div className="mb-4 rounded-lg border border-[color-mix(in_srgb,var(--brand-warning)_25%,var(--brand-border))] bg-[color-mix(in_srgb,var(--brand-warning)_8%,var(--brand-surface))] px-3 py-2.5 text-sm text-[var(--foreground)]">
          {migrationError}
        </div>
      )}

      <Suspense fallback={null}>
        <StoryWelcomeBanner storyTitle={story.title} />
      </Suspense>

      <StoryFinishPath finishPath={finishPath} />

      <StoryScenesPanel
        worldId={worldId}
        storyId={storyId}
        storyTitle={story.title}
        scenes={scenes}
        cast={context.cast}
        chapters={chapters}
        locations={context.locations.map(({ location }) => ({
          id: location.id,
          name: location.name,
        }))}
        suggestionBatch={suggestionBatch}
        scenesError={scenesError}
        suggestionError={suggestionError}
      />

      <StoryChaptersPanel
        worldId={worldId}
        storyId={storyId}
        chapters={chapters}
        continueChapter={finishPath.continueChapter}
      />

      <StoryCastConnectionsPanel
        storyId={storyId}
        worldId={worldId}
        worldName={world.name}
        cast={context.cast}
        castPhotoUrls={context.castPhotoUrls}
        castBonds={context.castBonds}
        bondPhotoUrls={context.bondPhotoUrls}
      />

      <StorySettingPanel
        storyId={storyId}
        worldId={worldId}
        worldName={world.name}
        locations={context.locations}
        mapBundle={context.mapBundle}
        moodboardBundle={context.moodboardBundle}
      />

      <StoryAdvancedPlan>
        <StoryBibleView
          bundle={{
            story: bundle.story,
            bible: bundle.bible,
            images: bundle.images,
            slotAssignments: bundle.slotAssignments,
            featuredImageId: bundle.featuredImageId,
            referenceGraph: bundle.referenceGraph,
            scores: bundle.scores,
            recommendations: bundle.recommendations,
          }}
          migrationError={
            bibleError?.includes("story_bible") ||
            bibleError?.includes("story_image_slot_assignments")
              ? bibleError
              : undefined
          }
          variant="advanced"
        />
      </StoryAdvancedPlan>

      <aside className={`${studioSection} mb-10`}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          Story details
        </h2>
        <EditStoryForm story={story} worldId={worldId} />
      </aside>
    </div>
  );
}
