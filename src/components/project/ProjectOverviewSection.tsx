"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProjectWithCounts } from "@/types/project";
import { dsChip, dsEmptyCover } from "@/lib/design-system";
import { EMPTY_PLACEHOLDER_COPY } from "@/lib/studio-empty-copy";

type ProjectOverviewSectionProps = {
  project: ProjectWithCounts;
  coverUrl: string | null;
};

function StatCard({
  label,
  count,
  href,
}: {
  label: string;
  count: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-4 transition hover:border-neutral-300 hover:bg-[var(--brand-surface-elevated)]"
    >
      <p className="text-2xl font-semibold tabular-nums text-neutral-900">
        {count}
      </p>
      <p className="mt-1 text-xs text-neutral-600">{label}</p>
    </Link>
  );
}

export function ProjectOverviewSection({
  project,
  coverUrl,
}: ProjectOverviewSectionProps) {
  const base = `/dashboard/projects/${project.id}`;
  const { projectCover } = EMPTY_PLACEHOLDER_COPY;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)]">
        <div className="relative aspect-[21/9] max-h-48 bg-[var(--studio-empty-fill)] sm:max-h-56">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={project.title}
              fill
              className="object-cover"
              unoptimized
              priority
            />
          ) : (
            <div className={dsEmptyCover}>
              <p className="text-sm font-medium text-neutral-600">
                {projectCover.title}
              </p>
              <p className="max-w-xs text-xs leading-relaxed text-neutral-500">
                {projectCover.description}
              </p>
            </div>
          )}
        </div>
        <div className="border-t border-[var(--brand-border)] p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
              {project.title}
            </h2>
            {project.is_default && (
              <span className={dsChip}>Default project</span>
            )}
          </div>
          {project.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
              {project.description}
            </p>
          ) : (
            <p className="mt-2 text-sm text-neutral-500">
              Add a description when you&apos;re ready.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Stories"
          count={project.story_count}
          href={`${base}?tab=stories`}
        />
        <StatCard
          label="Characters"
          count={project.character_count}
          href={`${base}?tab=characters`}
        />
        <StatCard
          label="Worlds"
          count={project.world_count}
          href={`${base}?tab=worlds`}
        />
        <StatCard
          label="Relationships"
          count={project.relationship_count}
          href={`${base}?tab=relationships`}
        />
      </div>

      <p className="text-xs text-neutral-500">
        Stories, characters, and worlds open in their dedicated workspaces.
        This project groups everything for one finished work.
      </p>
    </div>
  );
}
