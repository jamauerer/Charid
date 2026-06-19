"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  SUPPORT_CATEGORIES,
  type SupportCategory,
  type SupportTicket,
  normalizeSupportTicket,
  type SupportTicketRow,
} from "@/types/support-ticket";
import { scanUploadedImage } from "@/lib/moderation/scan-image";
import { scanSavedText } from "@/lib/moderation/scan-text";

const BUCKET = "support-attachments";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type SupportActionState = {
  error?: string;
  success?: boolean;
  ticket?: SupportTicket;
};

function parseCategory(value: FormDataEntryValue | null): SupportCategory | null {
  const category = String(value ?? "").trim();
  if (SUPPORT_CATEGORIES.includes(category as SupportCategory)) {
    return category as SupportCategory;
  }
  return null;
}

function formatSupportError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find the table")
  ) {
    return (
      "Support tickets are not available yet. Run supabase/migrations/20250625000000_platform_hardening.sql " +
      "and supabase/fix-platform-hardening-api.sql in the Supabase SQL Editor."
    );
  }
  return message;
}

export async function submitSupportTicket(
  _prevState: SupportActionState,
  formData: FormData
): Promise<SupportActionState> {
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const category = parseCategory(formData.get("category"));
  const screenshot = formData.get("screenshot");

  if (!subject) {
    return { error: "Subject is required." };
  }
  if (!message) {
    return { error: "Message is required." };
  }
  if (!category) {
    return { error: "Please choose a category." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to contact support." };
  }

  const ticketId = randomUUID();
  let screenshotPath: string | null = null;

  if (screenshot instanceof File && screenshot.size > 0) {
    if (!ALLOWED_TYPES.includes(screenshot.type)) {
      return { error: "Screenshot must be a JPEG, PNG, or WebP image." };
    }
    if (screenshot.size > MAX_FILE_SIZE) {
      return { error: "Screenshot must be 5 MB or smaller." };
    }

    const extension = screenshot.type.split("/")[1] ?? "jpg";
    screenshotPath = `${user.id}/${ticketId}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(screenshotPath, screenshot, {
        contentType: screenshot.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: `Failed to upload screenshot: ${uploadError.message}` };
    }
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      id: ticketId,
      user_id: user.id,
      subject,
      category,
      message,
      screenshot_path: screenshotPath,
      status: "open",
      priority: "normal",
    })
    .select()
    .single();

  if (error || !data) {
    if (screenshotPath) {
      await supabase.storage.from(BUCKET).remove([screenshotPath]);
    }
    return { error: formatSupportError(error?.message ?? "Failed to submit ticket.", error?.code) };
  }

  revalidatePath("/dashboard/help");

  void scanSavedText({
    supabase,
    userId: user.id,
    entityType: "support_ticket",
    entityId: ticketId,
    fields: { subject, message },
  });

  if (screenshotPath) {
    void scanUploadedImage({
      supabase,
      userId: user.id,
      entityType: "support_screenshot",
      entityId: ticketId,
      storageBucket: BUCKET,
      storagePath: screenshotPath,
      mimeType: screenshot instanceof File ? screenshot.type : undefined,
    });
  }

  return {
    success: true,
    ticket: normalizeSupportTicket(data as SupportTicketRow),
  };
}

export async function getMySupportTickets(): Promise<{
  tickets: SupportTicket[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { tickets: [], error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      tickets: [],
      error: formatSupportError(error.message, error.code),
    };
  }

  return {
    tickets: (data ?? []).map((row) =>
      normalizeSupportTicket(row as SupportTicketRow)
    ),
  };
}
