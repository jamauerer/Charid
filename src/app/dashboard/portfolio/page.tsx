import { getOrCreateProfile } from "@/app/actions/profile";
import { PortfolioEditor } from "./PortfolioEditor";

export default async function PortfolioPage() {
  const { profile, avatarUrl, error } = await getOrCreateProfile();

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]">
          {error ?? "Unable to load your portfolio profile."}
        </div>
      </div>
    );
  }

  return (
    <PortfolioEditor initialProfile={profile} initialAvatarUrl={avatarUrl} />
  );
}
