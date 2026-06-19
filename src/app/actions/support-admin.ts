"use server";

import { revalidatePath } from "next/cache";
import { isFounderAdmin } from "@/lib/founder-auth";
import { sanitizeFounderError } from "@/lib/founder-messages";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  normalizeSupportTicket,
  type SupportTicket,
  type SupportTicketRow,
  type SupportTicketStatus,
} from "@/types/support-ticket";

const BUCKET = "support-attachments";

export type SupportInboxEntry = SupportTicket & {
  username: string | null;
  displayName: string | null;
  screenshotUrl: string | null;
};

export type SupportInboxData = {
  tickets: SupportInboxEntry[];
  counts: {
    open: number;
    inProgress: number;
    resolved: number;
    total: number;
  };
};

export type SupportAdminActionResult = {
  error?: string;
  success?: boolean;
};

function formatSupportAdminError(message: string): string {
  return (
    sanitizeFounderError(message) ??
    "Support inbox is not available yet. Platform setup may still be in progress."
  );
}

export async function getSupportInboxData(): Promise<{
  data: SupportInboxData | null;
  error?: string;
}> {
  if (!(await isFounderAdmin())) {
    return { data: null, error: "Forbidden." };
  }

  try {
    const admin = createAdminClient();

    const [ticketsRes, profilesRes] = await Promise.all([
      admin
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      admin.from("profiles").select("id, username, display_name"),
    ]);

    if (ticketsRes.error) {
      return {
        data: null,
        error: formatSupportAdminError(ticketsRes.error.message),
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

    const tickets: SupportInboxEntry[] = await Promise.all(
      (ticketsRes.data ?? []).map(async (row) => {
        const ticket = normalizeSupportTicket(row as SupportTicketRow);
        const profile = profileById.get(ticket.user_id);
        let screenshotUrl: string | null = null;

        if (ticket.screenshot_path) {
          const { data } = await admin.storage
            .from(BUCKET)
            .createSignedUrl(ticket.screenshot_path, 3600);
          screenshotUrl = data?.signedUrl ?? null;
        }

        return {
          ...ticket,
          username: profile?.username ?? null,
          displayName: profile?.displayName ?? null,
          screenshotUrl,
        };
      })
    );

    const counts = { open: 0, inProgress: 0, resolved: 0, total: tickets.length };
    for (const ticket of tickets) {
      if (ticket.status === "open") counts.open += 1;
      else if (ticket.status === "in_progress") counts.inProgress += 1;
      else if (ticket.status === "resolved") counts.resolved += 1;
    }

    return { data: { tickets, counts } };
  } catch (err) {
    return {
      data: null,
      error: formatSupportAdminError(
        err instanceof Error ? err.message : "Failed to load support inbox."
      ),
    };
  }
}

export async function updateSupportTicketStatus(
  ticketId: string,
  status: SupportTicketStatus
): Promise<SupportAdminActionResult> {
  if (!(await isFounderAdmin())) {
    return { error: "Forbidden." };
  }

  try {
    const admin = createAdminClient();
    const updates: {
      status: SupportTicketStatus;
      resolved_at?: string | null;
    } = { status };

    if (status === "resolved") {
      updates.resolved_at = new Date().toISOString();
    } else {
      updates.resolved_at = null;
    }

    const { error } = await admin
      .from("support_tickets")
      .update(updates)
      .eq("id", ticketId);

    if (error) {
      return { error: formatSupportAdminError(error.message) };
    }

    revalidatePath("/dashboard/admin/support");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (err) {
    return {
      error: formatSupportAdminError(
        err instanceof Error ? err.message : "Failed to update ticket."
      ),
    };
  }
}
