"use client";

import Link from "next/link";
import { StoryCard } from "@/components/StoryCard";
import { CreateModal } from "@/components/dashboard/CreateModal";
import { PageHeader } from "@/components/studio/PageHeader";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { isAutoProvisionedSetting } from "@/lib/project-setting";
import { dsAlertWarning, dsChip } from "@/lib/design-system";
import { STUDIO_EMPTY_COPY } from "@/lib/studio-empty-copy";
import type { UserStoryEntry } from "@/app/actions/stories";

type DashboardStoriesViewProps = {
  entries: UserStoryEntry[];
  error?: string;
};

export function DashboardStoriesView({
  entries,
  error,
}: DashboardStoriesViewProps) {
  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {error && <div className={`mb-4 ${dsAlertWarning}`}>{error}</div>}

      <PageHeader title="Your Stories" actions={<CreateModal />} />

      <div className="-mt-3 mb-5">
        <span className={`${dsChip} tabular-nums`}>{entries.length}</span>
      </div>

      {entries.length === 0 && !error ? (
        <StudioEmptyState
          headline={STUDIO_EMPTY_COPY.story.headline}
          description={STUDIO_EMPTY_COPY.story.description}
        >
          <CreateModal />
        </StudioEmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(({ story, world }) => {
            const showSettingLink = !isAutoProvisionedSetting(world);

            return (
              <div key={story.id} className="space-y-2">
                <StoryCard worldId={world.id} story={story} />
                {showSettingLink && (
                  <Link
                    href={`/dashboard/worlds/${world.id}`}
                    className="inline-block text-xs text-[var(--brand-text-muted)] transition hover:text-[var(--foreground)]"
                  >
                    Setting: {world.name}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
