"use client";

import { useRouter } from "next/navigation";
import { WorldCard } from "@/components/WorldCard";
import { NewWorldModal } from "./NewWorldModal";
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
      {error && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-200">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 border-b border-white/[0.04] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            My Worlds
          </h1>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium tabular-nums text-zinc-400">
            {initialWorlds.length}
          </span>
        </div>
        <NewWorldModal onCreated={handleWorldCreated} />
      </div>

      {initialWorlds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-12 text-center">
          <p className="text-sm font-medium text-zinc-400">No worlds yet</p>
          <p className="mt-1 text-xs text-zinc-600">
            Create a world to organize characters, stories, and locations.
          </p>
          <div className="mt-4 flex justify-center">
            <NewWorldModal onCreated={handleWorldCreated} />
          </div>
        </div>
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
