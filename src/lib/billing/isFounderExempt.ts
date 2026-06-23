// Founder/admin accounts bypass billing and credit enforcement.
// Used for internal testing and platform administration.

export function isFounderExempt(role: string | null | undefined): boolean {
  return role === "admin";
}
