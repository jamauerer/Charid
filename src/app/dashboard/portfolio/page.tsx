import { getOrCreateProfile } from "@/app/actions/profile";
import { PortfolioEditor } from "./PortfolioEditor";

export default async function PortfolioPage() {
  const { profile, avatarUrl, error } = await getOrCreateProfile();

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error ?? "Unable to load your portfolio profile."}
        </div>
      </div>
    );
  }

  return (
    <PortfolioEditor initialProfile={profile} initialAvatarUrl={avatarUrl} />
  );
}
