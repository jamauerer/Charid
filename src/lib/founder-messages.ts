/** Map internal / developer errors to founder-facing copy. Never expose env or SQL details. */

export function sanitizeFounderError(message: string | undefined): string | undefined {
  if (!message) return undefined;

  const lower = message.toLowerCase();

  if (
    lower.includes("supabase_service_role_key") ||
    lower.includes("service_role") ||
    lower.includes("createadminclient")
  ) {
    return "Founder analytics have not been connected yet. Connect analytics in platform settings.";
  }

  if (
    lower.includes("moderation_queue") ||
    lower.includes("schema cache") ||
    lower.includes(".sql") ||
    lower.includes("fix-moderation") ||
    lower.includes("fix-") && lower.includes("api")
  ) {
    return "Moderation is not available yet. Platform setup may still be in progress.";
  }

  if (lower.includes("forbidden")) {
    return "You do not have access to this area.";
  }

  if (lower.includes("pgrst") || lower.includes("postgres") || lower.includes("relation")) {
    return "Platform data is temporarily unavailable. Try again shortly.";
  }

  if (lower.includes("failed to load founder")) {
    return "Founder analytics unavailable.";
  }

  return "Something went wrong loading platform data. Try again shortly.";
}

export function platformHealthSummary(
  items: { status: "Ready" | "Warning" | "Missing" }[]
): { label: string; detail: string; tone: "ok" | "warn" | "error" } {
  if (items.length === 0) {
    return {
      label: "Unknown",
      detail: "Platform health could not be checked.",
      tone: "warn",
    };
  }
  if (items.some((i) => i.status === "Missing")) {
    return {
      label: "Needs setup",
      detail: "Some platform features are not fully connected yet.",
      tone: "error",
    };
  }
  if (items.some((i) => i.status === "Warning")) {
    return {
      label: "Degraded",
      detail: "Some services are responding slowly or partially.",
      tone: "warn",
    };
  }
  return {
    label: "Healthy",
    detail: "Core platform services are connected.",
    tone: "ok",
  };
}

export function founderHealthLabel(componentLabel: string): string {
  const map: Record<string, string> = {
    "Character Bible": "Character profiles",
    "World Bible": "World profiles",
    "Story Bible": "Story profiles",
    Support: "Creator support",
    "Creator Feedback": "Creator feedback",
    Moderation: "Content moderation",
    "Founder Analytics": "Platform analytics",
    Scenes: "Story scenes",
    Projects: "Creative projects",
  };
  return map[componentLabel] ?? componentLabel;
}
