import type { HomePageData } from "@/app/actions/home-page";
import { HomeContinueHero } from "@/components/dashboard/home/HomeContinueHero";
import { HomeCreativeMoments } from "@/components/dashboard/home/HomeCreativeMoments";
import { HomeFirstTimeHero } from "@/components/dashboard/home/HomeFirstTimeHero";
import { HomeProjectGallery } from "@/components/dashboard/home/HomeProjectGallery";
import { HomeSecondaryActions } from "@/components/dashboard/home/HomeSecondaryActions";
import { studioPageStack } from "@/lib/visual-identity";

type DashboardHomeViewProps = HomePageData;

export function DashboardHomeView({
  isFirstTime,
  projects,
  latestProject,
  creativeMoments,
  error,
}: DashboardHomeViewProps) {
  if (error) {
    return (
      <div className="mx-auto max-w-[1280px]">
        <div className="rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--foreground)]">
          {error}
        </div>
      </div>
    );
  }

  if (isFirstTime) {
    return (
      <div className="mx-auto w-full max-w-[1280px]">
        <HomeFirstTimeHero />
      </div>
    );
  }

  return (
    <div className={`mx-auto w-full max-w-[1280px] ${studioPageStack}`}>
      {latestProject && <HomeContinueHero entry={latestProject} />}

      {projects.length > 1 && latestProject && (
        <HomeProjectGallery
          projects={projects}
          excludeProjectId={latestProject.project.id}
        />
      )}

      <HomeCreativeMoments moments={creativeMoments} />

      <HomeSecondaryActions />
    </div>
  );
}
