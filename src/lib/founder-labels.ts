export const SUPPORT_CATEGORY_LABELS: Record<string, string> = {
  bug_report: "Bug",
  feature_request: "Feature Request",
  billing: "Billing",
  account: "Account",
  ai_generation: "AI Generation",
  other: "Other",
};

export const SUPPORT_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export function formatSupportCategory(category: string): string {
  return SUPPORT_CATEGORY_LABELS[category] ?? category;
}

export function formatSupportStatus(status: string): string {
  return SUPPORT_STATUS_LABELS[status] ?? status;
}
