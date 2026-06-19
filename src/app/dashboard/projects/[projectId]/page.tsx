import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCharacterPhotoUrl } from "@/app/actions/characters";
import {
  getProjectById,
  getProjectCharacters,
  getProjectCoverUrl,
  getProjectRelationships,
  getProjectStories,
  getProjectWorlds,
} from "@/app/actions/projects";
import {
  PROJECT_TABS,
  ProjectWorkspaceView,
  type ProjectTab,
} from "@/components/project/ProjectWorkspaceView";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

function parseTab(value: string | undefined): ProjectTab {
  if (value && PROJECT_TABS.includes(value as ProjectTab)) {
    return value as ProjectTab;
  }
  return "overview";
}

export default async function ProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const { projectId } = await params;
  const { tab: tabParam } = await searchParams;
  const activeTab = parseTab(tabParam);

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

  const [storiesResult, charactersResult, worldsResult, relationshipsResult] =
    await Promise.all([
      activeTab === "stories" || activeTab === "overview"
        ? getProjectStories(projectId)
        : Promise.resolve({ entries: [] }),
      activeTab === "characters" || activeTab === "overview"
        ? getProjectCharacters(projectId)
        : Promise.resolve({ entries: [] }),
      activeTab === "worlds" || activeTab === "overview"
        ? getProjectWorlds(projectId)
        : Promise.resolve({ entries: [] }),
      activeTab === "relationships"
        ? getProjectRelationships(projectId)
        : Promise.resolve({ entries: [] }),
    ]);

  const relationshipPhotoUrls: Record<string, string | null> = {};
  if (activeTab === "relationships") {
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
  }

  return (
    <Suspense fallback={null}>
      <ProjectWorkspaceView
        project={project}
        coverUrl={coverUrl}
        activeTab={activeTab}
        stories={storiesResult.entries}
        characters={charactersResult.entries}
        worlds={worldsResult.entries}
        relationships={relationshipsResult.entries}
        relationshipPhotoUrls={relationshipPhotoUrls}
        migrationError={projectError}
      />
    </Suspense>
  );
}
