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
    <div className="overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)]">
      <div className="border-b border-[var(--brand-border)] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Workspace preview
        </p>
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
          Profile header only — not the full public page.
        </p>
        {!isPublic && (
          <p className="mt-1 text-xs text-neutral-500">
            Portfolio is private — use Preview Public Portfolio above to see the
            full visitor view.
          </p>
        )}
      </div>
      <div className="p-5 text-center">
        <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-[var(--brand-border)] bg-[var(--studio-empty-fill)]">
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
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-[var(--brand-text-secondary)]">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold text-[var(--brand-text-secondary)]">{name}</h3>
        <p className="mt-0.5 text-sm text-[var(--brand-text-secondary)]">@{profile.username}</p>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-[var(--brand-text-secondary)]">
          {previewBio}
        </p>
      </div>
    </div>
  );
}
