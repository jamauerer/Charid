"use client";

import { useRouter } from "next/navigation";
import { WorldCard } from "@/components/WorldCard";
import { NewWorldModal } from "./NewWorldModal";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { PageHeader } from "@/components/studio/PageHeader";
import { dsAlertWarning, dsChip } from "@/lib/design-system";
import { STUDIO_EMPTY_COPY } from "@/lib/studio-empty-copy";
import type { WorldWithCounts } from "@/types/world";

export type WorldWithCover = {
  world: WorldWithCounts;
  coverUrl: string | null;
};

type DashboardWorldsViewProps = {
  initialWorlds: WorldWithCover[];
  error?: string;
};

export function DashboardWorldsView({
  initialWorlds,
  error,
}: DashboardWorldsViewProps) {
  const router = useRouter();

  function handleWorldCreated() {
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {error && <div className={`mb-4 ${dsAlertWarning}`}>{error}</div>}

      <PageHeader
        title="My Worlds"
        actions={<NewWorldModal onCreated={handleWorldCreated} />}
      />

      <div className="-mt-3 mb-5">
        <span className={`${dsChip} tabular-nums`}>{initialWorlds.length}</span>
      </div>

      {initialWorlds.length === 0 ? (
        <StudioEmptyState
          headline={STUDIO_EMPTY_COPY.world.headline}
          description={STUDIO_EMPTY_COPY.world.description}
        >
          <NewWorldModal onCreated={handleWorldCreated} />
        </StudioEmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {initialWorlds.map(({ world, coverUrl }) => (
            <WorldCard key={world.id} world={world} coverUrl={coverUrl} />
          ))}
        </div>
      )}
    </div>
  );
}
