"use client";

import Link from "next/link";
import { useEffect } from "react";
import { NewStoryModal } from "@/app/dashboard/NewStoryModal";
import { ProjectAddCharacterButton } from "@/components/project/ProjectAddCharacterButton";
import { ProjectCharactersSection } from "@/components/project/ProjectCharactersSection";
import { ProjectFormatGuide } from "@/components/project/ProjectFormatGuide";
import { ProjectNotesSection } from "@/components/project/ProjectNotesSection";
import { ProjectRelationshipsSection } from "@/components/project/ProjectRelationshipsSection";
import { ProjectRoadmapSection } from "@/components/project/ProjectRoadmapSection";
import { ProjectScenesSection } from "@/components/project/ProjectScenesSection";
import { ProjectStoriesSection } from "@/components/project/ProjectStoriesSection";
import { ProjectStyleReferencesSection } from "@/components/project/ProjectStyleReferencesSection";
import { ProjectWhatsNext } from "@/components/project/ProjectWhatsNext";
import { ProjectWorldsSection } from "@/components/project/ProjectWorldsSection";
import type {
  ProjectCharacterEntry,
  ProjectProgressCounts,
  ProjectRelationshipEntry,
  ProjectSceneRollupEntry,
  ProjectStoryEntry,
  ProjectWorldEntry,
} from "@/app/actions/projects";
import type {
  ProjectFinishPathResult,
  ProjectStoryProgress,
} from "@/lib/project-finish-path";
import { PROJECT_SECTION_IDS } from "@/lib/project-tabs";
import type { ProjectWithCounts } from "@/types/project";
import { PROJECT_WORK_INTENT_LABELS } from "@/types/project";
import type { WorldImageWithUrl } from "@/types/world-image";
import type { WorldMoodboardBundle } from "@/types/world-moodboard";

type ProjectWorkspaceViewProps = {
  project: ProjectWithCounts;
  coverUrl: string | null;
  finishPath: ProjectFinishPathResult;
  progressCounts: ProjectProgressCounts;
  storyProgress: ProjectStoryProgress[];
  initialScrollSection: string | null;
  stories: ProjectStoryEntry[];
  characters: ProjectCharacterEntry[];
  worlds: ProjectWorldEntry[];
  relationships: ProjectRelationshipEntry[];
  relationshipPhotoUrls: Record<string, string | null>;
  sceneRollup: ProjectSceneRollupEntry[];
  primaryWorldId: string | null;
  moodboardBundle: WorldMoodboardBundle | null;
  galleryImages: WorldImageWithUrl[];
  migrationError?: string;
};

export function ProjectWorkspaceView({
  project,
  coverUrl,
  finishPath,
  progressCounts,
  storyProgress,
  initialScrollSection,
  stories,
  characters,
  worlds,
  relationships,
  relationshipPhotoUrls,
  sceneRollup,
  primaryWorldId,
  moodboardBundle,
  galleryImages,
  migrationError,
}: ProjectWorkspaceViewProps) {
  useEffect(() => {
    if (!initialScrollSection) return;
    const el = document.getElementById(initialScrollSection);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [initialScrollSection]);

  const isWorldbuilding = project.work_intent === "worldbuilding";
  const hasStory = progressCounts.storyCount > 0;

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {migrationError && (
        <div className="mb-4 rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2.5 text-sm text-[var(--foreground)]">
          {migrationError}
        </div>
      )}

      <div className="mb-5 border-b border-[var(--brand-border)] pb-5">
        <Link
          href="/dashboard/projects"
          className="mb-3 inline-flex items-center gap-1 text-xs text-[var(--brand-text-secondary)] transition hover:text-[var(--foreground)]"
        >
          ← All projects
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
          {project.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
          {project.work_intent
            ? PROJECT_WORK_INTENT_LABELS[project.work_intent]
            : "Creative project"}
        </p>
      </div>

      <ProjectFormatGuide projectId={project.id} workIntent={project.work_intent} />

      <div className="mb-6">
        <ProjectWhatsNext finishPath={finishPath} />
      </div>

      <div className="mb-8">
        <ProjectStyleReferencesSection
          projectId={project.id}
          coverUrl={coverUrl}
          worldId={primaryWorldId}
          moodboardBundle={moodboardBundle}
          galleryImages={galleryImages}
        />
      </div>

      <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 sm:px-5">
        <ProjectRoadmapSection
          id={PROJECT_SECTION_IDS.story}
          title="Story"
          count={progressCounts.storyCount}
          defaultExpanded
          action={<NewStoryModal projectId={project.id} />}
        >
          <ProjectStoriesSection
            projectId={project.id}
            entries={stories}
            storyProgress={storyProgress}
            projectTitle={project.title}
          />
        </ProjectRoadmapSection>

        <ProjectRoadmapSection
          id={PROJECT_SECTION_IDS.characters}
          title="Characters"
          count={progressCounts.characterCount}
          defaultExpanded={progressCounts.characterCount > 0 || !hasStory}
          action={<ProjectAddCharacterButton projectId={project.id} />}
          preview={
            progressCounts.characterCount === 0
              ? "Add characters when you're ready — or start with a story first."
              : undefined
          }
        >
          <ProjectCharactersSection entries={characters} />
        </ProjectRoadmapSection>

        {hasStory && (
          <ProjectRoadmapSection
            id={PROJECT_SECTION_IDS.scenes}
            title="Scenes"
            count={progressCounts.sceneCount}
            defaultExpanded={progressCounts.sceneCount > 0}
            preview={
              progressCounts.sceneCount === 0
                ? "Scenes are beats in your story — add them from the story workspace."
                : undefined
            }
          >
            <ProjectScenesSection
              entries={sceneRollup}
              storyCount={progressCounts.storyCount}
            />
          </ProjectRoadmapSection>
        )}

        <ProjectRoadmapSection
          id={PROJECT_SECTION_IDS.setting}
          title="Setting"
          count={progressCounts.locationCount || worlds.length}
          defaultExpanded={isWorldbuilding}
          preview={
            progressCounts.locationCount === 0
              ? "Locations and place details — add when a scene needs a place."
              : `${worlds.length} setting${worlds.length === 1 ? "" : "s"} · ${progressCounts.locationCount} location${progressCounts.locationCount === 1 ? "" : "s"}`
          }
        >
          <ProjectWorldsSection entries={worlds} />
        </ProjectRoadmapSection>

        <ProjectRoadmapSection
          id={PROJECT_SECTION_IDS.connections}
          title="Connections"
          count={relationships.length}
          defaultExpanded={relationships.length > 0}
          preview={
            relationships.length === 0
              ? "Character relationships appear here when you define them."
              : undefined
          }
        >
          <ProjectRelationshipsSection
            entries={relationships}
            photoUrls={relationshipPhotoUrls}
          />
        </ProjectRoadmapSection>

        <ProjectRoadmapSection
          id={PROJECT_SECTION_IDS.notes}
          title="Notes"
          defaultExpanded={Boolean(project.description)}
          preview={project.description ? undefined : "Project description and notes."}
        >
          <ProjectNotesSection description={project.description} />
        </ProjectRoadmapSection>
      </div>
    </div>
  );
}
