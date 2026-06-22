import Link from "next/link";
import { PROJECT_WORK_INTENT_LABELS } from "@/types/project";
import type { ProjectWorkIntent } from "@/types/project";

type ProjectWorkspaceHeaderProps = {
  projectTitle: string;
  workIntent?: ProjectWorkIntent | null;
};

export function ProjectWorkspaceHeader({
  projectTitle,
  workIntent,
}: ProjectWorkspaceHeaderProps) {
  return (
    <header className="mb-6 space-y-2">
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-1 text-xs text-[var(--brand-text-secondary)] transition hover:text-[var(--foreground)]"
      >
        ← All projects
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
        <span className="font-medium text-[var(--brand-text-secondary)]">
          Project
        </span>
        <span aria-hidden> — </span>
        {projectTitle}
      </h1>
      {workIntent && (
        <p className="text-sm text-[var(--brand-text-muted)]">
          {PROJECT_WORK_INTENT_LABELS[workIntent]}
        </p>
      )}
    </header>
  );
}
