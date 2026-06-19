import Image from "next/image";
import Link from "next/link";
import type { HomeProjectEntry } from "@/app/actions/home-page";
import {
  projectProgressLabel,
  projectWorkTypeLabel,
} from "@/lib/home-project-labels";
import { CardCoverPlaceholder } from "@/components/studio/CardCoverPlaceholder";
import {
  studioCardSurface,
  studioSectionHeading,
  studioSectionSub,
} from "@/lib/visual-identity";

type HomeProjectGalleryProps = {
  projects: HomeProjectEntry[];
  excludeProjectId?: string;
};

export function HomeProjectGallery({
  projects,
  excludeProjectId,
}: HomeProjectGalleryProps) {
  const visible = excludeProjectId
    ? projects.filter((e) => e.project.id !== excludeProjectId)
    : projects;

  if (visible.length === 0) return null;

  return (
    <section id="all-projects" aria-labelledby="home-projects-heading">
      <div className="mb-3">
        <h2 id="home-projects-heading" className={studioSectionHeading}>
          {excludeProjectId ? "Other projects" : "Projects"}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {visible.map(({ project, coverUrl }) => (
          <Link
            key={project.id}
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
        ))}
      </div>
    </section>
  );
}
