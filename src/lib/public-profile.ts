import type { Profile } from "@/types/profile";

export function getPublicDisplayName(profile: Profile): string {
  return profile.display_name?.trim() || profile.username;
}

export function getPublicBio(profile: Profile): string {
  return profile.bio?.trim() || "This creator hasn't added a bio yet.";
}

export function getPublicCharacterPath(
  username: string,
  characterId: string
): string {
  return `/u/${username}/characters/${characterId}`;
}
