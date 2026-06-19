"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HomeProjectEntry } from "@/app/actions/home-page";
import {
  formatLastActive,
  projectProgressLabel,
  projectWorkTypeLabel,
} from "@/lib/home-project-labels";
import { StartNewProjectWizard } from "@/components/project/StartNewProjectWizard";
import { CardCoverPlaceholder } from "@/components/studio/CardCoverPlaceholder";
import {
  studioBtnPrimarySm,
  studioBtnSecondary,
  studioCreativeEmptyCover,
  studioSectionSub,
} from "@/lib/visual-identity";

type HomeContinueHeroProps = {
  entry: HomeProjectEntry;
};

export function HomeContinueHero({ entry }: HomeContinueHeroProps) {
  const router = useRouter();
  const [wizardOpen, setWizardOpen] = useState(false);
  const { project, coverUrl } = entry;
  const projectHref = `/dashboard/projects/${project.id}`;

  function handleFinished() {
    setWizardOpen(false);
    router.refresh();
  }

  return (
    <>
      <StartNewProjectWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onFinished={handleFinished}
      />

      <section className="flex flex-col gap-3 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-3 sm:flex-row sm:items-center">
        <Link
          href={projectHref}
          className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-[var(--studio-empty-fill)] sm:w-44"
        >
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={project.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className={studioCreativeEmptyCover}>
              <CardCoverPlaceholder title="No cover yet" />
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <p className={studioSectionSub}>Continue</p>
          <h1 className="truncate text-base font-semibold text-[var(--foreground)]">
            {project.title}
          </h1>
          <p className="mt-0.5 truncate text-xs text-[var(--brand-text-secondary)]">
            {projectWorkTypeLabel(project.work_intent)}
            <span className="mx-1.5 text-[var(--brand-text-muted)]">·</span>
            {projectProgressLabel(project)}
            <span className="mx-1.5 text-[var(--brand-text-muted)]">·</span>
            {formatLastActive(project.updated_at)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col lg:flex-row">
          <Link href={projectHref} className={studioBtnPrimarySm}>
            Continue
          </Link>
          <button
            type="button"
            onClick={() => setWizardOpen(true)}
            className={studioBtnSecondary}
          >
            New project
          </button>
        </div>
      </section>
    </>
  );
}
