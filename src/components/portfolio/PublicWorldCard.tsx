"use client";

import Image from "next/image";
import Link from "next/link";
import type { World } from "@/types/world";
import { getPublicWorldPath } from "@/lib/public-profile";

type PublicWorldCardProps = {
  username: string;
  world: World;
  coverUrl: string | null;
};

export function PublicWorldCard({
  username,
  world,
  coverUrl,
}: PublicWorldCardProps) {
  const href = getPublicWorldPath(username, world.slug);

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] transition hover:border-[var(--brand-border)] hover:bg-[#111113]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[var(--studio-empty-fill)]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={world.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-950/40 to-zinc-900 text-xs text-[var(--brand-text-secondary)]">
            No cover
          </div>
        )}
      </div>
      <div className="px-3 py-2.5">
        <h3 className="truncate text-sm font-bold tracking-tight text-[var(--brand-text-secondary)] transition group-hover:text-neutral-600">
          {world.name}
        </h3>
      </div>
    </Link>
  );
}
