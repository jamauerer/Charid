import type { SupabaseClient } from "@supabase/supabase-js";
import { enqueueModerationItem } from "@/lib/moderation/enqueue";
import { getContentScanner, isFlagged } from "@/lib/moderation/scanner";
import type { ModerationEntityType } from "@/types/moderation";

export type ScanUploadedImageInput = {
  supabase: SupabaseClient;
  userId: string;
  entityType: ModerationEntityType;
  entityId?: string | null;
  storageBucket: string;
  storagePath: string;
  mimeType?: string;
};

/**
 * Runs after a successful upload + DB write.
 * Never blocks or deletes uploads — flagged items enter the moderation queue.
 */
export async function scanUploadedImage(
  input: ScanUploadedImageInput
): Promise<void> {
  try {
    let signedUrl: string | null = null;

    const { data, error } = await input.supabase.storage
      .from(input.storageBucket)
      .createSignedUrl(input.storagePath, 300);

    if (!error && data?.signedUrl) {
      signedUrl = data.signedUrl;
    }

    const scanner = getContentScanner();
    const result = await scanner.scanImage({
      storageBucket: input.storageBucket,
      storagePath: input.storagePath,
      mimeType: input.mimeType,
      signedUrl,
    });

    if (!isFlagged(result)) return;

    await enqueueModerationItem(input.supabase, {
      userId: input.userId,
      contentType: "image",
      entityType: input.entityType,
      entityId: input.entityId,
      storageBucket: input.storageBucket,
      storagePath: input.storagePath,
      scanResult: result,
    });
  } catch (err) {
    console.error(
      "[moderation] image scan error:",
      err instanceof Error ? err.message : err
    );
  }
}
