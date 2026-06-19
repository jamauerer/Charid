"use server";

import { isFounderAdmin } from "@/lib/founder-auth";
import {
  founderHealthLabel,
  sanitizeFounderError,
} from "@/lib/founder-messages";
import { createAdminClient } from "@/lib/supabase/admin";

export type DatabaseHealthStatus = "Ready" | "Warning" | "Missing";

export type DatabaseHealthItem = {
  label: string;
  status: DatabaseHealthStatus;
  detail: string;
  migrationFile: string;
};

function isMissingRelationError(
  error: { code?: string; message?: string } | null
): boolean {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    (error.message?.includes("does not exist") ?? false) ||
    (error.message?.includes("Could not find the table") ?? false) ||
    (error.message?.includes("Could not find the view") ?? false)
  );
}

async function probeRelation(
  admin: ReturnType<typeof createAdminClient>,
  name: string
): Promise<"ok" | "missing" | "error"> {
  const { error } = await admin
    .from(name)
    .select("*", { count: "exact", head: true });

  if (!error) return "ok";
  if (isMissingRelationError(error)) return "missing";
  return "error";
}

function aggregateStatus(
  results: { name: string; result: "ok" | "missing" | "error" }[]
): DatabaseHealthStatus {
  if (results.some((r) => r.result === "missing")) return "Missing";
  if (results.some((r) => r.result === "error")) return "Warning";
  return "Ready";
}

function buildDetail(
  status: DatabaseHealthStatus,
  results: { name: string; result: "ok" | "missing" | "error" }[]
): string {
  const missing = results
    .filter((r) => r.result === "missing")
    .map((r) => r.name);
  const warnings = results
    .filter((r) => r.result === "error")
    .map((r) => r.name);

  if (status === "Missing") {
    return `Missing: ${missing.join(", ")}`;
  }
  if (status === "Warning") {
    return `Reachability issue on ${warnings.join(", ")} — re-run migration and matching fix-*-api.sql`;
  }
  return "All required objects reachable.";
}

/** Mirrors supabase/DATABASE_HEALTHCHECK.sql — probed via service role. */
export async function getDatabaseHealth(): Promise<{
  items: DatabaseHealthItem[];
  error?: string;
}> {
  if (!(await isFounderAdmin())) {
    return { items: [], error: "Forbidden." };
  }

  try {
    const admin = createAdminClient();

    const components = [
      {
        label: "Character Bible",
        migrationFile: "20250623000000_character_bible.sql",
        tables: ["character_bible", "character_image_slot_assignments"],
      },
      {
        label: "World Bible",
        migrationFile: "20250627000000_world_bible.sql",
        tables: ["world_bible", "world_images", "world_image_slot_assignments"],
      },
      {
        label: "Story Bible",
        migrationFile: "20250631000000_story_bible.sql",
        tables: ["story_bible", "story_image_slot_assignments"],
      },
      {
        label: "Support",
        migrationFile: "20250625000000_platform_hardening.sql",
        tables: ["support_tickets"],
      },
      {
        label: "Creator Feedback",
        migrationFile: "20250625000000_platform_hardening.sql",
        tables: ["creator_feedback"],
      },
      {
        label: "Moderation",
        migrationFile: "20250630000000_moderation_queue.sql",
        tables: ["moderation_queue"],
      },
      {
        label: "Founder Analytics",
        migrationFile: "20250629000000_founder_admin_role.sql",
        tables: [
          "v_founder_platform_overview",
          "v_founder_creator_activity",
          "v_founder_content_metrics",
          "v_founder_support_summary",
          "v_founder_moderation_summary",
          "v_founder_character_feedback_summary",
        ],
      },
    ] as const;

    const items: DatabaseHealthItem[] = [];

    for (const component of components) {
      const results = await Promise.all(
        component.tables.map(async (name) => ({
          name,
          result: await probeRelation(admin, name),
        }))
      );

      const status = aggregateStatus(results);

      items.push({
        label: component.label,
        status,
        detail: buildDetail(status, results),
        migrationFile: component.migrationFile,
      });
    }

    return { items };
  } catch (err) {
    return {
      items: [],
      error:
        sanitizeFounderError(
          err instanceof Error ? err.message : "Failed to load database health."
        ) ?? "Platform health could not be checked.",
    };
  }
}
