"use client";

import { useEffect } from "react";
import { NewStoryModal } from "@/app/dashboard/NewStoryModal";
import { ProjectAssetsSection } from "@/components/project/ProjectAssetsSection";
import { ProjectCharacterActions } from "@/components/project/ProjectCharacterActions";
import { ProjectCharactersSection } from "@/components/project/ProjectCharactersSection";
import { ProjectFormatGuide } from "@/components/project/ProjectFormatGuide";
import { ProjectLocationsSection } from "@/components/project/ProjectLocationsSection";
import { ProjectOrganizationsSection } from "@/components/project/ProjectOrganizationsSection";
import { ProjectProductionSection } from "@/components/project/ProjectProductionSection";
import { ProjectRelationshipsSection } from "@/components/project/ProjectRelationshipsSection";
import { ProjectScenesSection } from "@/components/project/ProjectScenesSection";
import { ProjectSettingsSection } from "@/components/project/ProjectSettingsSection";
import { ProjectStoriesSection } from "@/components/project/ProjectStoriesSection";
import { ProjectTimelineSection } from "@/components/project/ProjectTimelineSection";
import { ProjectWhatsNext } from "@/components/project/ProjectWhatsNext";
import { ProjectWorkspaceHeader } from "@/components/project/ProjectWorkspaceHeader";
import { ProjectWorkspaceNav } from "@/components/project/ProjectWorkspaceNav";
import type { ProductionData } from "@/app/actions/production/index";
import type {
  ProjectAssetRollupEntry,
  ProjectCharacterEntry,
  ProjectLocationRollupEntry,
  ProjectProgressCounts,
  ProjectRelationshipEntry,
  ProjectSceneRollupEntry,
  ProjectStoryEntry,
  ProjectTimelineStory,
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
  activeSection?: string | null;
  stories: ProjectStoryEntry[];
  characters: ProjectCharacterEntry[];
  worlds: ProjectWorldEntry[];
  relationships: ProjectRelationshipEntry[];
  relationshipPhotoUrls: Record<string, string | null>;
  sceneRollup: ProjectSceneRollupEntry[];
  locationRollup: ProjectLocationRollupEntry[];
  assetRollup: ProjectAssetRollupEntry[];
  timelineStories: ProjectTimelineStory[];
  primaryWorldId: string | null;
  moodboardBundle: WorldMoodboardBundle | null;
  galleryImages: WorldImageWithUrl[];
  productionData: ProductionData;
  productionError?: string;
  migrationError?: string;
};

export function ProjectWorkspaceView({
  project,
  coverUrl,
  finishPath,
  progressCounts,
  storyProgress,
  initialScrollSection,
  activeSection,
  stories,
  characters,
  worlds,
  relationships,
  relationshipPhotoUrls,
  sceneRollup,
  locationRollup,
  assetRollup,
  timelineStories,
  primaryWorldId,
  moodboardBundle,
  galleryImages,
  productionData,
  productionError,
  migrationError,
}: ProjectWorkspaceViewProps) {
  useEffect(() => {
    if (!initialScrollSection) return;
    const el = document.getElementById(initialScrollSection);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [initialScrollSection]);

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

      <div id={PROJECT_SECTION_IDS.whatsNext} className="mb-6 scroll-mt-6">
        <ProjectFormatGuide
          projectId={project.id}
          workIntent={project.work_intent}
        />
        <ProjectWhatsNext finishPath={finishPath} />
      </div>

      <ProjectWorkspaceNav activeSection={activeSection} />

      <section
        id={PROJECT_SECTION_IDS.characters}
        className={`${studioSection} mb-8 scroll-mt-24`}
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
        {relationships.length > 0 && (
          <div className="mt-6 border-t border-[var(--brand-border)] pt-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
              Connections
            </h3>
            <ProjectRelationshipsSection
              entries={relationships}
              photoUrls={relationshipPhotoUrls}
            />
          </div>
        )}
      </section>

      <section
        id={PROJECT_SECTION_IDS.locations}
        className={`${studioSection} mb-8 scroll-mt-24`}
      >
        <div className="mb-4">
          <h2 className={studioSectionLabel}>Locations</h2>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            Places across your project settings — read-only rollup with links to edit.
          </p>
        </div>
        <ProjectLocationsSection locations={locationRollup} worlds={worlds} />
      </section>

      <section
        id={PROJECT_SECTION_IDS.story}
        className={`${studioSection} mb-8 scroll-mt-24`}
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
        id={PROJECT_SECTION_IDS.scenes}
        className={`${studioSection} mb-8 scroll-mt-24`}
      >
        <div className="mb-4">
          <h2 className={studioSectionLabel}>Scenes</h2>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            All scene beats across stories in this project.
          </p>
        </div>
        <ProjectScenesSection
          entries={sceneRollup}
          storyCount={stories.length}
        />
      </section>

      <section
        id={PROJECT_SECTION_IDS.timeline}
        className={`${studioSection} mb-8 scroll-mt-24`}
      >
        <div className="mb-4">
          <h2 className={studioSectionLabel}>Timeline</h2>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            Scene order per story — drag to reorder in each timeline, or open the story
            to add scenes.
          </p>
        </div>
        <ProjectTimelineSection timelines={timelineStories} />
      </section>

      <section
        id={PROJECT_SECTION_IDS.production}
        className={`${studioSection} mb-8 scroll-mt-24`}
      >
        <div className="mb-4">
          <h2 className={studioSectionLabel}>Production</h2>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            Turn your story into a finished book — pages, spreads, or manuscript
            sections.
          </p>
        </div>
        <ProjectProductionSection
          projectId={project.id}
          workIntent={project.work_intent}
          productionData={productionData}
          productionError={productionError}
          stories={stories}
          sceneRollup={sceneRollup}
          characters={characters}
          moodboardBundle={moodboardBundle}
          primaryWorldId={primaryWorldId}
          styleReferenceCount={progressCounts.styleReferenceCount}
        />
      </section>

      <section
        id={PROJECT_SECTION_IDS.assets}
        className={`${studioSection} mb-8 scroll-mt-24`}
      >
        <div className="mb-4">
          <h2 className={studioSectionLabel}>Assets</h2>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            Style references and gallery images across this project.
          </p>
        </div>
        <ProjectAssetsSection
          projectId={project.id}
          coverUrl={coverUrl}
          primaryWorldId={primaryWorldId}
          moodboardBundle={moodboardBundle}
          galleryImages={galleryImages}
          assetEntries={assetRollup}
        />
      </section>

      <section
        id={PROJECT_SECTION_IDS.organizations}
        className={`${studioSection} mb-8 scroll-mt-24`}
      >
        <div className="mb-4">
          <h2 className={studioSectionLabel}>Organizations</h2>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            Factions, nations, and groups — placeholder for a future release.
          </p>
        </div>
        <ProjectOrganizationsSection />
      </section>

      <ProjectSettingsSection projectId={project.id} projectTitle={project.title} />
    </div>
  );
}
