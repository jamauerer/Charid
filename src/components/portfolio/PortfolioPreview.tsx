"use client";

import Image from "next/image";
import type { Profile } from "@/types/profile";

type PortfolioPreviewProps = {
  profile: Profile;
  avatarUrl: string | null;
  avatarPreview?: string | null;
  displayName: string;
  bio: string;
  isPublic: boolean;
};

export function PortfolioPreview({
  profile,
  avatarUrl,
  avatarPreview,
  displayName,
  bio,
  isPublic,
}: PortfolioPreviewProps) {
  const previewAvatar = avatarPreview ?? avatarUrl;
  const name = displayName.trim() || profile.display_name || "Your Name";
  const previewBio = bio.trim() || profile.bio || "Your bio will appear here.";

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f0f11]">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-400/80">
          Live Preview
        </p>
        {!isPublic && (
          <p className="mt-1 text-xs text-amber-400/90">
            Portfolio is private — only you can see this page.
          </p>
        )}
      </div>
      <div className="p-5 text-center">
        <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-white/10 bg-zinc-900">
          {previewAvatar ? (
            <Image
              src={previewAvatar}
              alt={name}
              width={96}
              height={96}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-zinc-600">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold text-zinc-100">{name}</h3>
        <p className="mt-0.5 text-sm text-zinc-500">@{profile.username}</p>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-zinc-400">
          {previewBio}
        </p>
      </div>
    </div>
  );
}
