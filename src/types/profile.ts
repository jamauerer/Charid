export const PROFILE_ROLES = ["user", "admin"] as const;
export type ProfileRole = (typeof PROFILE_ROLES)[number];

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_public: boolean;
  role: ProfileRole;
  created_at: string;
};

export type ProfileRow = Profile & {
  role?: ProfileRole;
};

export function normalizeProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    display_name: row.display_name ?? null,
    bio: row.bio ?? null,
    avatar_url: row.avatar_url ?? null,
    is_public: row.is_public ?? false,
    role: row.role === "admin" ? "admin" : "user",
    created_at: row.created_at,
  };
}

export const USERNAME_PATTERN = /^[a-z0-9_-]{3,30}$/;

export function sanitizeUsername(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30);
}
