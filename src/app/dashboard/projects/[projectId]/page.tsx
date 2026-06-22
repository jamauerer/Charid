import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCharacterPhotoUrl } from "@/app/actions/characters";
import {
  getProjectById,
  getProjectCharacters,
  getProjectCoverUrl,
  getProjectProgressCounts,
  getProjectRelationships,
  getProjectStories,
  getProjectStoryProgress,
  getProjectWorlds,
} from "@/app/actions/projects";
import { getWorldImages } from "@/app/actions/world-images";
import { getWorldMoodboardBundle } from "@/app/actions/world-moodboards";
import { ProjectWorkspaceView } from "@/components/project/ProjectWorkspaceView";
import { resolveProjectFinishPath } from "@/lib/project-finish-path";
import { isProjectTab, projectTabToSectionHash } from "@/lib/project-tabs";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function ProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const { projectId } = await params;
  const { tab: tabParam } = await searchParams;
  const initialScrollSection =
    tabParam && isProjectTab(tabParam)
      ? projectTabToSectionHash(tabParam)
      : null;

  const { project, error: projectError } = await getProjectById(projectId);
  if (!project) {
    if (projectError?.includes("not exposed")) {
      return (
        <div className="mx-auto max-w-[1280px] px-4 py-8">
          <div className="rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]">
            {projectError}
          </div>
        </div>
      );
    }
    notFound();
  }

  const coverUrl = await getProjectCoverUrl(project.cover_image_path);

  const [
    storiesResult,
    charactersResult,
    worldsResult,
    relationshipsResult,
    storyProgressResult,
    progressCountsResult,
  ] = await Promise.all([
    getProjectStories(projectId),
    getProjectCharacters(projectId),
    getProjectWorlds(projectId),
    getProjectRelationships(projectId),
    getProjectStoryProgress(projectId),
    getProjectProgressCounts(projectId),
  ]);

  const relationshipPhotoUrls: Record<string, string | null> = {};
  for (const entry of relationshipsResult.entries) {
    if (!(entry.fromCharacter.id in relationshipPhotoUrls)) {
      relationshipPhotoUrls[entry.fromCharacter.id] =
        await getCharacterPhotoUrl(entry.fromCharacter.photo_path);
    }
    if (!(entry.toCharacter.id in relationshipPhotoUrls)) {
      relationshipPhotoUrls[entry.toCharacter.id] =
        await getCharacterPhotoUrl(entry.toCharacter.photo_path);
    }
  }

  const primaryWorldId = worldsResult.entries[0]?.world.id ?? null;

  let moodboardBundle = null;
  let galleryImages: Awaited<ReturnType<typeof getWorldImages>>["images"] = [];

  if (primaryWorldId) {
    const [moodboardResult, galleryResult] = await Promise.all([
      getWorldMoodboardBundle(primaryWorldId),
      getWorldImages(primaryWorldId),
    ]);
    moodboardBundle = moodboardResult.bundle;
    galleryImages = galleryResult.images;
  }

  const progressCounts = progressCountsResult.counts ?? {
    characterCount: project.character_count,
    storyCount: project.story_count,
    sceneCount: 0,
    chapterCount: 0,
    locationCount: 0,
    styleReferenceCount: 0,
    hasCover: Boolean(project.cover_image_path),
  };

  const finishPath = resolveProjectFinishPath({
    workIntent: project.work_intent,
    stories: storyProgressResult.stories,
    characterCount: progressCounts.characterCount,
    sceneCount: progressCounts.sceneCount,
    chapterCount: progressCounts.chapterCount,
    hasCover: progressCounts.hasCover,
    styleReferenceCount: progressCounts.styleReferenceCount,
  });

  return (
    <Suspense fallback={null}>
      <ProjectWorkspaceView
        project={project}
        coverUrl={coverUrl}
        finishPath={finishPath}
        progressCounts={progressCounts}
        storyProgress={storyProgressResult.stories}
        initialScrollSection={initialScrollSection}
        stories={storiesResult.entries}
        characters={charactersResult.entries}
        worlds={worldsResult.entries}
        relationships={relationshipsResult.entries}
        relationshipPhotoUrls={relationshipPhotoUrls}
        primaryWorldId={primaryWorldId}
        moodboardBundle={moodboardBundle}
        galleryImages={galleryImages}
        migrationError={projectError}
      />
    </Suspense>
  );
}
