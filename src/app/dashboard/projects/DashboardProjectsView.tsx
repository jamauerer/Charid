"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProjectCard } from "@/components/project/ProjectCard";
import { LegacyProjectRenamePrompt } from "@/components/project/LegacyProjectRenamePrompt";
import { StartNewProjectWizard } from "@/components/project/StartNewProjectWizard";
import type { ProjectWithCounts } from "@/types/project";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { STUDIO_EMPTY_COPY } from "@/lib/studio-empty-copy";
import { studioBtnPrimarySm } from "@/lib/visual-identity";

export type ProjectWithCover = {
  project: ProjectWithCounts;
  coverUrl: string | null;
};

type DashboardProjectsViewProps = {
  initialProjects: ProjectWithCover[];
  error?: string;
};

export function DashboardProjectsView({
  initialProjects,
  error,
}: DashboardProjectsViewProps) {
  const router = useRouter();
  const [wizardOpen, setWizardOpen] = useState(false);

  function handleFinished() {
    setWizardOpen(false);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <StartNewProjectWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onFinished={handleFinished}
      />

      {error && (
        <div className="mb-3 rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--foreground)]">
          {error}
        </div>
      )}

      <LegacyProjectRenamePrompt
        projects={initialProjects.map(({ project }) => project)}
      />

      <div className="mb-4 flex flex-col gap-3 border-b border-[var(--brand-border)] pb-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-base font-semibold text-[var(--foreground)]">
          Projects
        </h1>
        <button
          type="button"
          onClick={() => setWizardOpen(true)}
          className={studioBtnPrimarySm}
        >
          Start New Project
        </button>
      </div>

      {initialProjects.length === 0 && !error ? (
        <StudioEmptyState
          headline={STUDIO_EMPTY_COPY.project.headline}
          description={STUDIO_EMPTY_COPY.project.description}
        >
          <button
            type="button"
            onClick={() => setWizardOpen(true)}
            className={studioBtnPrimarySm}
          >
            Start New Project
          </button>
        </StudioEmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {initialProjects.map(({ project, coverUrl }) => (
            <ProjectCard
              key={project.id}
              project={project}
              coverUrl={coverUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
