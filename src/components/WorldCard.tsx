"use client";

import Image from "next/image";
import Link from "next/link";
import type { WorldWithCounts } from "@/types/world";

type WorldCardProps = {
  world: WorldWithCounts;
  coverUrl: string | null;
};

export function WorldCard({ world, coverUrl }: WorldCardProps) {
  return (
    <Link
      href={`/dashboard/worlds/${world.id}`}
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
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-950/40 to-zinc-900 text-sm text-zinc-600">
            No cover
          </div>
        )}
        <span
          className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            world.is_public
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-zinc-500/20 text-zinc-400"
          }`}
        >
          {world.is_public ? "Public" : "Private"}
        </span>
      </div>
      <div className="px-3 py-2.5">
        <h3 className="truncate text-sm font-bold tracking-tight text-zinc-100 transition group-hover:text-violet-300">
          {world.name}
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          {world.character_count}{" "}
          {world.character_count === 1 ? "character" : "characters"}
        </p>
      </div>
    </Link>
  );
}
