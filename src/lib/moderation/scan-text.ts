import type { SupabaseClient } from "@supabase/supabase-js";
import { enqueueModerationItem } from "@/lib/moderation/enqueue";
import {
  getContentScanner,
  isFlagged,
  previewText,
} from "@/lib/moderation/scanner";
import type { ModerationEntityType } from "@/types/moderation";

export type ScanSavedTextInput = {
  supabase: SupabaseClient;
  userId: string;
  entityType: ModerationEntityType;
  entityId: string;
  fields: Record<string, string | null | undefined>;
};

/**
 * Runs after text content is saved.
 * Never blocks saves — flagged content enters the moderation queue with risk scores.
 */
export async function scanSavedText(input: ScanSavedTextInput): Promise<void> {
  const nonEmpty = Object.fromEntries(
    Object.entries(input.fields).filter(([, value]) => value?.trim())
  );

  if (Object.keys(nonEmpty).length === 0) return;

  try {
    const scanner = getContentScanner();
    const result = await scanner.scanText({ fields: nonEmpty });

    if (!isFlagged(result)) return;

    await enqueueModerationItem(input.supabase, {
      userId: input.userId,
      contentType: "text",
      entityType: input.entityType,
      entityId: input.entityId,
      contentPreview: previewText(nonEmpty),
      scanResult: result,
    });
  } catch (err) {
    console.error(
      "[moderation] text scan error:",
      err instanceof Error ? err.message : err
    );
  }
}
