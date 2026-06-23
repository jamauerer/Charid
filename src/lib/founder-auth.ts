import { createClient } from "@/lib/supabase/server";
import { isFounderExempt } from "@/lib/billing/isFounderExempt";
import type { ProfileRole } from "@/types/profile";

export async function getCurrentProfileRole(): Promise<ProfileRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role as ProfileRole | undefined;
  return role === "admin" ? "admin" : "user";
}

export async function isFounderAdmin(): Promise<boolean> {
  return isFounderExempt(await getCurrentProfileRole());
}
