"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProjectOverviewSection } from "@/components/project/ProjectOverviewSection";
import { ProjectStoriesSection } from "@/components/project/ProjectStoriesSection";
import { ProjectCharactersSection } from "@/components/project/ProjectCharactersSection";
import { ProjectWorldsSection } from "@/components/project/ProjectWorldsSection";
import { ProjectRelationshipsSection } from "@/components/project/ProjectRelationshipsSection";
import type {
  ProjectCharacterEntry,
  ProjectRelationshipEntry,
  ProjectStoryEntry,
  ProjectWorldEntry,
} from "@/app/actions/projects";
import type { ProjectWithCounts } from "@/types/project";
import { PROJECT_WORK_INTENT_LABELS } from "@/types/project";

export const PROJECT_TABS = [
  "overview",
  "stories",
  "characters",
  "worlds",
  "relationships",
] as const;

export type ProjectTab = (typeof PROJECT_TABS)[number];

const TAB_LABELS: Record<ProjectTab, string> = {
  overview: "Overview",
  stories: "Stories",
  characters: "Characters",
  worlds: "Worlds",
  relationships: "Relationships",
};

type ProjectWorkspaceViewProps = {
  project: ProjectWithCounts;
  coverUrl: string | null;
  activeTab: ProjectTab;
  stories: ProjectStoryEntry[];
  characters: ProjectCharacterEntry[];
  worlds: ProjectWorldEntry[];
  relationships: ProjectRelationshipEntry[];
  relationshipPhotoUrls: Record<string, string | null>;
  migrationError?: string;
};

export function ProjectWorkspaceView({
  project,
  coverUrl,
  activeTab,
  stories,
  characters,
  worlds,
  relationships,
  relationshipPhotoUrls,
  migrationError,
}: ProjectWorkspaceViewProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function setTab(tab: ProjectTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {migrationError && (
        <div className="mb-4 rounded-lg rounded-lg border border-[color-mix(in_srgb,var(--brand-warning)_25%,var(--brand-border))] bg-[color-mix(in_srgb,var(--brand-warning)_8%,var(--brand-surface))] px-3 py-2.5 text-sm text-[var(--foreground)]">
          {migrationError}
        </div>
      )}

      <div className="mb-6 border-b border-[var(--brand-border)] pb-5">
        <Link
          href="/dashboard/projects"
          className="mb-3 inline-flex items-center gap-1 text-xs text-[var(--brand-text-secondary)] transition hover:text-[var(--brand-text-secondary)]"
        >
          ← All projects
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--brand-text-secondary)]">
          {project.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
          {project.work_intent
            ? PROJECT_WORK_INTENT_LABELS[project.work_intent]
            : "Everything for this finished work"}
        </p>
      </div>

      <nav
        className="mb-6 flex flex-wrap gap-1 border-b border-[var(--brand-border)] pb-px"
        aria-label="Project sections"
      >
        {PROJECT_TABS.map((tab) => {
          const isActive = activeTab === tab;
          const count =
            tab === "stories"
              ? project.story_count
              : tab === "characters"
                ? project.character_count
                : tab === "worlds"
                  ? project.world_count
                  : tab === "relationships"
                    ? project.relationship_count
                    : null;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setTab(tab)}
              className={`relative px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "text-neutral-600"
                  : "text-[var(--brand-text-secondary)] hover:text-[var(--brand-text-secondary)]"
              }`}
            >
              {TAB_LABELS[tab]}
              {count !== null && count > 0 && (
                <span className="ml-1.5 tabular-nums text-[var(--brand-text-secondary)]">
                  {count}
                </span>
              )}
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-violet-500" />
              )}
            </button>
          );
        })}
      </nav>

      {activeTab === "overview" && (
        <ProjectOverviewSection project={project} coverUrl={coverUrl} />
      )}
      {activeTab === "stories" && <ProjectStoriesSection entries={stories} />}
      {activeTab === "characters" && (
        <ProjectCharactersSection entries={characters} />
      )}
      {activeTab === "worlds" && <ProjectWorldsSection entries={worlds} />}
      {activeTab === "relationships" && (
        <ProjectRelationshipsSection
          entries={relationships}
          photoUrls={relationshipPhotoUrls}
        />
      )}
    </div>
  );
}
