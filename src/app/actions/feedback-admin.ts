"use server";

import { isFounderAdmin } from "@/lib/founder-auth";
import { sanitizeFounderError } from "@/lib/founder-messages";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  normalizeCreatorFeedback,
  type CreatorFeedback,
  type CreatorFeedbackRow,
  type FeedbackEntityType,
} from "@/types/creator-feedback";

export type FeedbackInboxEntry = CreatorFeedback & {
  username: string | null;
  displayName: string | null;
  entityLabel: string | null;
};

export type FeedbackInboxData = {
  items: FeedbackInboxEntry[];
  avgRating: number | null;
  totalCount: number;
};

function formatFeedbackAdminError(message: string): string {
  return (
    sanitizeFounderError(message) ??
    "Creator feedback is not available yet. Platform setup may still be in progress."
  );
}

async function resolveEntityLabels(
  admin: ReturnType<typeof createAdminClient>,
  items: CreatorFeedback[]
): Promise<Map<string, string>> {
  const labels = new Map<string, string>();

  const byType = new Map<FeedbackEntityType, Set<string>>();
  for (const item of items) {
    const ids = byType.get(item.entity_type) ?? new Set<string>();
    ids.add(item.entity_id);
    byType.set(item.entity_type, ids);
  }

  async function loadTable(
    table: "characters" | "worlds" | "stories",
    ids: string[],
    labelField: "name" | "title"
  ) {
    if (ids.length === 0) return;
    const { data } = await admin.from(table).select(`id, ${labelField}`).in("id", ids);
    for (const row of data ?? []) {
      const value = row[labelField as keyof typeof row];
      labels.set(`${table}:${row.id}`, String(value ?? row.id));
    }
  }

  await loadTable("characters", [...(byType.get("character") ?? [])], "name");
  await loadTable("worlds", [...(byType.get("world") ?? [])], "name");
  await loadTable("stories", [...(byType.get("story") ?? [])], "title");

  return labels;
}

export async function getFeedbackInboxData(
  ratingFilter?: number | null
): Promise<{ data: FeedbackInboxData | null; error?: string }> {
  if (!(await isFounderAdmin())) {
    return { data: null, error: "Forbidden." };
  }

  try {
    const admin = createAdminClient();

    let query = admin
      .from("creator_feedback")
      .select("*")
      .eq("feedback_type", "vision_rating")
      .order("created_at", { ascending: false })
      .limit(200);

    if (
      ratingFilter != null &&
      Number.isInteger(ratingFilter) &&
      ratingFilter >= 1 &&
      ratingFilter <= 5
    ) {
      query = query.eq("rating", ratingFilter);
    }

    const [feedbackRes, profilesRes] = await Promise.all([
      query,
      admin.from("profiles").select("id, username, display_name"),
    ]);

    if (feedbackRes.error) {
      return {
        data: null,
        error: formatFeedbackAdminError(feedbackRes.error.message),
      };
    }

    const items = (feedbackRes.data ?? []).map((row) =>
      normalizeCreatorFeedback(row as CreatorFeedbackRow)
    );

    const entityLabels = await resolveEntityLabels(admin, items);

    const profileById = new Map(
      (profilesRes.data ?? []).map((profile) => [
        profile.id,
        {
          username: profile.username as string,
          displayName: profile.display_name as string | null,
        },
      ])
    );

    const inboxItems: FeedbackInboxEntry[] = items.map((item) => {
      const profile = profileById.get(item.user_id);
      const tableKey =
        item.entity_type === "character"
          ? "characters"
          : item.entity_type === "world"
            ? "worlds"
            : item.entity_type === "story"
              ? "stories"
              : null;

      const entityLabel = tableKey
        ? (entityLabels.get(`${tableKey}:${item.entity_id}`) ?? null)
        : null;

      return {
        ...item,
        username: profile?.username ?? null,
        displayName: profile?.displayName ?? null,
        entityLabel,
      };
    });

    const ratings = inboxItems
      .map((item) => item.rating)
      .filter((rating): rating is number => rating != null);

    const avgRating =
      ratings.length > 0
        ? Math.round(
            (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) *
              10
          ) / 10
        : null;

    return {
      data: {
        items: inboxItems,
        avgRating,
        totalCount: inboxItems.length,
      },
    };
  } catch (err) {
    return {
      data: null,
      error: formatFeedbackAdminError(
        err instanceof Error ? err.message : "Failed to load feedback inbox."
      ),
    };
  }
}
