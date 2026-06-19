import {
  EXPRESSION_ROLES,
  TURNAROUND_ROLES,
  type SlotAssetRole,
} from "@/types/character-image";

export const ASSET_ROLE_LABELS: Record<string, string> = {
  canonical: "Main portrait",
  reference: "Reference",
  other: "Other",
  turnaround_front: "Front view",
  turnaround_left: "Left view",
  turnaround_right: "Right view",
  turnaround_back: "Back view",
  expression_neutral: "Neutral",
  expression_happy: "Happy",
  expression_angry: "Angry",
  expression_sad: "Sad",
  expression_surprised: "Surprised",
};

export function labelForAssetRole(role: string): string {
  return ASSET_ROLE_LABELS[role] ?? role.replace(/_/g, " ");
}

export const TURNAROUND_SLOT_HINTS: Record<(typeof TURNAROUND_ROLES)[number], string> = {
  turnaround_front: "Full-body or portrait facing the camera — your default on-model view.",
  turnaround_left: "Left profile or three-quarter left — helps keep proportions consistent from new angles.",
  turnaround_right: "Right profile or three-quarter right — pairs with the left view for symmetry checks.",
  turnaround_back: "Back view — hair, clothing, and silhouette from behind.",
};

export const EXPRESSION_SLOT_HINTS: Record<(typeof EXPRESSION_ROLES)[number], string> = {
  expression_neutral: "Resting face — the baseline every other expression builds from.",
  expression_happy: "Joy, laughter, or warmth — anchors positive emotional range.",
  expression_angry: "Anger or intensity — keeps your character on-model under stress.",
  expression_sad: "Sadness or vulnerability — completes emotional coverage.",
  expression_surprised: "Surprise or shock — useful for reactive scenes.",
};

export function isTurnaroundRole(role: string): role is (typeof TURNAROUND_ROLES)[number] {
  return (TURNAROUND_ROLES as readonly string[]).includes(role);
}

export function isExpressionRole(role: string): role is (typeof EXPRESSION_ROLES)[number] {
  return (EXPRESSION_ROLES as readonly string[]).includes(role);
}

export function isSlotRole(role: string): role is SlotAssetRole {
  return role in ASSET_ROLE_LABELS && role !== "reference" && role !== "other";
}
