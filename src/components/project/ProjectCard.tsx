"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProjectWithCounts } from "@/types/project";
import { CardCoverPlaceholder } from "@/components/studio/CardCoverPlaceholder";
import {
  projectProgressLabel,
  projectWorkTypeLabel,
} from "@/lib/home-project-labels";
import { studioCardSurface } from "@/lib/visual-identity";

type ProjectCardProps = {
  project: ProjectWithCounts;
  coverUrl: string | null;
};

export function ProjectCard({ project, coverUrl }: ProjectCardProps) {
  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className={`block ${studioCardSurface}`}
    >
      <div className="relative aspect-video overflow-hidden bg-[var(--studio-empty-fill)]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={project.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <CardCoverPlaceholder title="No cover yet" />
        )}
      </div>
      <div className="px-2.5 py-2">
        <h3 className="truncate text-sm font-medium text-[var(--foreground)]">
          {project.title}
        </h3>
        <p className="mt-0.5 truncate text-[11px] text-[var(--brand-text-muted)]">
          {projectWorkTypeLabel(project.work_intent)}
          <span className="mx-1">·</span>
          {projectProgressLabel(project)}
        </p>
      </div>
    </Link>
  );
}
