"use client";

import { ProjectDeleteSection } from "@/components/project/ProjectDeleteSection";

type ProjectSettingsSectionProps = {
  projectId: string;
  projectTitle: string;
};

export function ProjectSettingsSection({
  projectId,
  projectTitle,
}: ProjectSettingsSectionProps) {
  return (
    <section
      id="project-settings"
      className="mb-8 scroll-mt-24 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 sm:px-5"
    >
      <div className="border-b border-[var(--brand-border)] py-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          Project Settings
        </h2>
        <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
          Project-level options and advanced actions.
        </p>
      </div>

      <details className="group py-4">
        <summary className="cursor-pointer list-none text-sm font-medium text-[var(--brand-text-secondary)] marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <span className="text-[var(--brand-text-muted)] transition group-open:rotate-90">▸</span>
            Advanced
          </span>
        </summary>
        <div className="mt-4 pl-5">
          <ProjectDeleteSection projectId={projectId} projectTitle={projectTitle} />
        </div>
      </details>
    </section>
  );
}
