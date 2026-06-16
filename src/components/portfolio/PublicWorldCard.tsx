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
      className="group overflow-hidden rounded-lg border border-white/[0.06] bg-[#0f0f11] transition hover:border-white/10 hover:bg-[#111113]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-zinc-900">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={world.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-950/40 to-zinc-900 text-xs text-zinc-600">
            No cover
          </div>
        )}
      </div>
      <div className="px-3 py-2.5">
        <h3 className="truncate text-sm font-bold tracking-tight text-zinc-100 transition group-hover:text-violet-300">
          {world.name}
        </h3>
      </div>
    </Link>
  );
}
