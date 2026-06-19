import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for founder admin queries only.
 * Never import in client components or expose to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for founder admin analytics. " +
        "Add it to .env.local from Supabase → Project Settings → API → service_role key, then restart the dev server."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
