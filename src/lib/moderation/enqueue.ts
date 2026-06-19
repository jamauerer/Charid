import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ContentScanResult,
  ModerationContentType,
  ModerationEntityType,
} from "@/types/moderation";

export type EnqueueModerationInput = {
  userId: string;
  contentType: ModerationContentType;
  entityType: ModerationEntityType;
  entityId?: string | null;
  fieldName?: string | null;
  storageBucket?: string | null;
  storagePath?: string | null;
  contentPreview?: string | null;
  scanResult: ContentScanResult;
};

export async function enqueueModerationItem(
  supabase: SupabaseClient,
  input: EnqueueModerationInput
): Promise<void> {
  try {
    const { error } = await supabase.from("moderation_queue").insert({
      user_id: input.userId,
      content_type: input.contentType,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      field_name: input.fieldName ?? null,
      storage_bucket: input.storageBucket ?? null,
      storage_path: input.storagePath ?? null,
      content_preview: input.contentPreview ?? null,
      status: "pending",
      risk_score: input.scanResult.riskScore,
      risk_categories: input.scanResult.riskCategories,
      scanner_result: input.scanResult,
    });

    if (error) {
      console.error("[moderation] enqueue failed:", error.message);
    }
  } catch (err) {
    console.error(
      "[moderation] enqueue error:",
      err instanceof Error ? err.message : err
    );
  }
}
