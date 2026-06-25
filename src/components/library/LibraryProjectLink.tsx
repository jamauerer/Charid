"use client";

import Link from "next/link";
import type { LibraryProjectRef } from "@/app/actions/library";

type LibraryProjectLinkProps = {
  project: LibraryProjectRef | null;
  className?: string;
};

export function LibraryProjectLink({ project, className = "" }: LibraryProjectLinkProps) {
  if (!project) {
    return (
      <span className={`text-xs text-[var(--brand-text-muted)] ${className}`}>
        No project
      </span>
    );
  }

  return (
    <Link
      href={project.href}
      className={`text-xs font-medium text-[var(--brand-text-secondary)] transition hover:text-[var(--foreground)] ${className}`}
      onClick={(event) => event.stopPropagation()}
    >
      {project.title}
    </Link>
  );
}
