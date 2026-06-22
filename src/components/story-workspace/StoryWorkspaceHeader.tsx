import Link from "next/link";
import { StoryStatusBadge } from "@/components/StoryStatusBadge";
import type { StoryStatus } from "@/types/story";

type StoryWorkspaceHeaderProps = {
  storyTitle: string;
  storyStatus: StoryStatus;
  projectTitle?: string | null;
  projectHref?: string | null;
};

export function StoryWorkspaceHeader({
  storyTitle,
  storyStatus,
  projectTitle,
  projectHref,
}: StoryWorkspaceHeaderProps) {
  return (
    <header className="mb-6 space-y-2">
      {projectTitle && (
        <p className="text-base text-[var(--brand-text-secondary)]">
          <span className="font-medium text-[var(--foreground)]">Project</span>
          <span aria-hidden> — </span>
          {projectHref ? (
            <Link
              href={projectHref}
              className="font-semibold text-[var(--foreground)] transition hover:text-[var(--brand-accent)]"
            >
              {projectTitle}
            </Link>
          ) : (
            <span className="font-semibold text-[var(--foreground)]">
              {projectTitle}
            </span>
          )}
        </p>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="min-w-0 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          <span className="font-medium text-[var(--brand-text-secondary)]">
            Story
          </span>
          <span aria-hidden> — </span>
          {storyTitle}
        </h1>
        <StoryStatusBadge status={storyStatus} />
      </div>
    </header>
  );
}
