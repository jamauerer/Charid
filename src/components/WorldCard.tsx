"use client";

import Image from "next/image";
import Link from "next/link";
import type { WorldWithCounts } from "@/types/world";
import { CardCoverPlaceholder } from "@/components/studio/CardCoverPlaceholder";
import { studioCardSurface } from "@/lib/visual-identity";

type WorldCardProps = {
  world: WorldWithCounts;
  coverUrl: string | null;
};

export function WorldCard({ world, coverUrl }: WorldCardProps) {
  return (
    <Link
      href={`/dashboard/worlds/${world.id}`}
      className={`block ${studioCardSurface}`}
    >
      <div className="relative aspect-video overflow-hidden bg-[var(--studio-empty-fill)]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={world.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <CardCoverPlaceholder title="No cover yet" />
        )}
        {world.is_public && (
          <span className="absolute right-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[var(--brand-text-secondary)] bg-black/40 backdrop-blur-sm">
            Public
          </span>
        )}
      </div>
      <div className="px-2.5 py-2">
        <h3 className="truncate text-sm font-medium text-[var(--foreground)]">
          {world.name}
        </h3>
      </div>
    </Link>
  );
}
