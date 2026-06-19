"use server";

import { revalidatePath } from "next/cache";
import { isFounderAdmin } from "@/lib/founder-auth";
import { sanitizeFounderError } from "@/lib/founder-messages";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  normalizeModerationQueueItem,
  type ModerationQueueItem,
  type ModerationStatus,
} from "@/types/moderation";

export type ModerationQueueEntry = ModerationQueueItem & {
  username: string | null;
  displayName: string | null;
  imageUrl: string | null;
};

export type ModerationQueueData = {
  summary: {
    pendingCount: number;
    escalatedCount: number;
    pendingImages: number;
    pendingText: number;
    flagged7d: number;
  };
  items: ModerationQueueEntry[];
};

export type ModerationActionResult = {
  error?: string;
  success?: boolean;
};

async function assertAdmin(): Promise<boolean> {
  return isFounderAdmin();
}

async function getReviewerId(): Promise<string | null> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getModerationQueueData(
  statusFilter: ModerationStatus | "all" = "pending"
): Promise<{ data: ModerationQueueData | null; error?: string }> {
  if (!(await assertAdmin())) {
    return { data: null, error: "Forbidden." };
  }

  try {
    const admin = createAdminClient();

    const [summaryRes, queueRes, profilesRes] = await Promise.all([
      admin.from("v_founder_moderation_summary").select("*").single(),
      admin
        .from("moderation_queue")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      admin.from("profiles").select("id, username, display_name"),
    ]);

    if (queueRes.error) {
      return {
        data: null,
        error: sanitizeFounderError(queueRes.error.message),
      };
    }

    const profileById = new Map(
      (profilesRes.data ?? []).map((profile) => [
        profile.id,
        {
          username: profile.username as string,
          displayName: profile.display_name as string | null,
        },
      ])
    );

    const filtered =
      statusFilter === "all"
        ? (queueRes.data ?? [])
        : (queueRes.data ?? []).filter((row) => row.status === statusFilter);

    const items: ModerationQueueEntry[] = await Promise.all(
      filtered.map(async (row) => {
        const item = normalizeModerationQueueItem(
          row as Parameters<typeof normalizeModerationQueueItem>[0]
        );
        const profile = profileById.get(item.user_id);
        let imageUrl: string | null = null;

        if (
          item.content_type === "image" &&
          item.storage_bucket &&
          item.storage_path
        ) {
          const { data } = await admin.storage
            .from(item.storage_bucket)
            .createSignedUrl(item.storage_path, 3600);
          imageUrl = data?.signedUrl ?? null;
        }

        return {
          ...item,
          username: profile?.username ?? null,
          displayName: profile?.displayName ?? null,
          imageUrl,
        };
      })
    );

    const summaryRow = summaryRes.data ?? {};

    return {
      data: {
        summary: {
          pendingCount: Number(summaryRow.pending_count ?? 0),
          escalatedCount: Number(summaryRow.escalated_count ?? 0),
          pendingImages: Number(summaryRow.pending_images ?? 0),
          pendingText: Number(summaryRow.pending_text ?? 0),
          flagged7d: Number(summaryRow.flagged_7d ?? 0),
        },
        items,
      },
    };
  } catch (err) {
    const raw =
      err instanceof Error ? err.message : "Failed to load moderation queue.";
    return {
      data: null,
      error: sanitizeFounderError(raw) ?? "Moderation is not available yet.",
    };
  }
}

async function resolveModerationItem(
  itemId: string,
  status: ModerationStatus,
  reviewerNote?: string
): Promise<ModerationActionResult> {
  if (!(await assertAdmin())) {
    return { error: "Forbidden." };
  }

  const reviewerId = await getReviewerId();
  if (!reviewerId) {
    return { error: "You must be logged in." };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("moderation_queue")
      .update({
        status,
        reviewer_id: reviewerId,
        reviewer_note: reviewerNote?.trim() || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", itemId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/admin/moderation");
    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Moderation action failed.",
    };
  }
}

export async function approveModerationItem(
  itemId: string,
  note?: string
): Promise<ModerationActionResult> {
  return resolveModerationItem(itemId, "approved", note);
}

export async function removeModerationItem(
  itemId: string,
  note?: string
): Promise<ModerationActionResult> {
  return resolveModerationItem(itemId, "removed", note);
}

export async function escalateModerationItem(
  itemId: string,
  note?: string
): Promise<ModerationActionResult> {
  return resolveModerationItem(itemId, "escalated", note);
}

export async function suspendUserFromModeration(
  userId: string,
  note?: string
): Promise<ModerationActionResult> {
  if (!(await assertAdmin())) {
    return { error: "Forbidden." };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({
        is_suspended: true,
        suspended_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      return {
        error:
          sanitizeFounderError(error.message) ?? "Could not suspend account.",
      };
    }

    if (note?.trim()) {
      await admin
        .from("moderation_queue")
        .update({ reviewer_note: note.trim() })
        .eq("user_id", userId)
        .eq("status", "pending");
    }

    revalidatePath("/dashboard/admin/moderation");
    return { success: true };
  } catch (err) {
    return {
      error:
        sanitizeFounderError(
          err instanceof Error ? err.message : "Failed to suspend account."
        ) ?? "Could not suspend account.",
    };
  }
}

export async function unsuspendUserFromModeration(
  userId: string
): Promise<ModerationActionResult> {
  if (!(await assertAdmin())) {
    return { error: "Forbidden." };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({
        is_suspended: false,
        suspended_at: null,
      })
      .eq("id", userId);

    if (error) {
      return { error: sanitizeFounderError(error.message) ?? "Could not restore account access." };
    }

    revalidatePath("/dashboard/admin/moderation");
    return { success: true };
  } catch (err) {
    return {
      error:
        sanitizeFounderError(
          err instanceof Error ? err.message : "Failed to restore account."
        ) ?? "Could not restore account access.",
    };
  }
}
