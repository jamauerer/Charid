export const SUPPORT_CATEGORIES = [
  "bug_report",
  "feature_request",
  "billing",
  "account",
  "ai_generation",
  "other",
] as const;

export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

export const SUPPORT_CATEGORY_LABELS: Record<SupportCategory, string> = {
  bug_report: "Bug Report",
  feature_request: "Feature Request",
  billing: "Billing",
  account: "Account",
  ai_generation: "AI Generation",
  other: "Other",
};

export const SUPPORT_STATUSES = ["open", "in_progress", "resolved"] as const;
export type SupportTicketStatus = (typeof SUPPORT_STATUSES)[number];

export const SUPPORT_PRIORITIES = ["low", "normal", "high"] as const;
export type SupportTicketPriority = (typeof SUPPORT_PRIORITIES)[number];

export type SupportTicket = {
  id: string;
  user_id: string;
  subject: string;
  category: SupportCategory;
  message: string;
  screenshot_path: string | null;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  created_at: string;
  resolved_at: string | null;
};

export type SupportTicketRow = SupportTicket;

export function normalizeSupportTicket(row: SupportTicketRow): SupportTicket {
  return {
    id: row.id,
    user_id: row.user_id,
    subject: row.subject,
    category: row.category,
    message: row.message,
    screenshot_path: row.screenshot_path ?? null,
    status: row.status,
    priority: row.priority,
    created_at: row.created_at,
    resolved_at: row.resolved_at ?? null,
  };
}
