"use client";

import { useEffect } from "react";
import { NewStoryModal } from "@/app/dashboard/NewStoryModal";
import { ProjectCharacterActions } from "@/components/project/ProjectCharacterActions";
import { ProjectCharactersSection } from "@/components/project/ProjectCharactersSection";
import { ProjectDeleteSection } from "@/components/project/ProjectDeleteSection";
import { ProjectNotesSection } from "@/components/project/ProjectNotesSection";
import { ProjectRelationshipsSection } from "@/components/project/ProjectRelationshipsSection";
import { ProjectRoadmapSection } from "@/components/project/ProjectRoadmapSection";
import { ProjectStoriesSection } from "@/components/project/ProjectStoriesSection";
import { ProjectStyleReferencesSection } from "@/components/project/ProjectStyleReferencesSection";
import { ProjectWhatsNext } from "@/components/project/ProjectWhatsNext";
import { ProjectWorkspaceHeader } from "@/components/project/ProjectWorkspaceHeader";
import { ProjectWorldsSection } from "@/components/project/ProjectWorldsSection";
import type {
  ProjectCharacterEntry,
  ProjectProgressCounts,
  ProjectRelationshipEntry,
  ProjectStoryEntry,
  ProjectWorldEntry,
} from "@/app/actions/projects";
import type {
  ProjectFinishPathResult,
  ProjectStoryProgress,
} from "@/lib/project-finish-path";
import { PROJECT_SECTION_IDS } from "@/lib/project-tabs";
import type { ProjectWithCounts } from "@/types/project";
import type { WorldImageWithUrl } from "@/types/world-image";
import type { WorldMoodboardBundle } from "@/types/world-moodboard";
import { studioSection, studioSectionLabel } from "@/lib/visual-identity";

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
  const characterIds = characters.map(({ character }) => character.id);

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {migrationError && (
        <div className="mb-4 rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2.5 text-sm text-[var(--foreground)]">
          {migrationError}
        </div>
      )}

      <ProjectWorkspaceHeader
        projectTitle={project.title}
        workIntent={project.work_intent}
      />

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

      <section
        id={PROJECT_SECTION_IDS.story}
        className={`${studioSection} mb-8 scroll-mt-6`}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={studioSectionLabel}>Stories</h2>
            <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
              Open a story to work on scenes, cast, and setting.
            </p>
          </div>
          <NewStoryModal projectId={project.id} />
        </div>
        <ProjectStoriesSection
          projectId={project.id}
          entries={stories}
          storyProgress={storyProgress}
          projectTitle={project.title}
        />
      </section>

      <section
        id={PROJECT_SECTION_IDS.characters}
        className={`${studioSection} mb-8 scroll-mt-6`}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={studioSectionLabel}>Characters</h2>
            <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
              Project cast — create new characters or add existing ones from your library.
            </p>
          </div>
          <ProjectCharacterActions
            projectId={project.id}
            excludeCharacterIds={characterIds}
          />
        </div>
        <ProjectCharactersSection entries={characters} />
      </section>

      <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 sm:px-5">
        <ProjectRoadmapSection
          id={PROJECT_SECTION_IDS.setting}
          title="Setting"
          count={progressCounts.locationCount || worlds.length}
          defaultExpanded={isWorldbuilding}
          preview={
            progressCounts.locationCount === 0
              ? "Locations and place details — manage in a story or setting workspace."
              : `${worlds.length} setting${worlds.length === 1 ? "" : "s"} · ${progressCounts.locationCount} location${progressCounts.locationCount === 1 ? "" : "s"}`
          }
        >
          <ProjectWorldsSection entries={worlds} />
        </ProjectRoadmapSection>

        <ProjectRoadmapSection
          id={PROJECT_SECTION_IDS.connections}
          title="Connections"
          count={relationships.length}
          defaultExpanded={false}
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
          <ProjectDeleteSection
            projectId={project.id}
            projectTitle={project.title}
          />
        </ProjectRoadmapSection>
      </div>
    </div>
  );
}
