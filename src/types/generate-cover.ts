export type GenerateCoverReferenceGroup = "creator" | "context";

export type GenerateCoverReferenceStatus =
  | "included"
  | "missing"
  | "excluded";

export type GenerateCoverReferenceItem = {
  id: string;
  label: string;
  detail?: string;
  group: GenerateCoverReferenceGroup;
  status: GenerateCoverReferenceStatus;
  thumbnailUrl?: string | null;
};

export const GENERATE_COVER_REFERENCE_GROUP_LABELS: Record<
  GenerateCoverReferenceGroup,
  string
> = {
  creator: "Creator References",
  context: "CharID Context",
};

export const GENERATE_COVER_REFERENCE_GROUP_HINTS: Record<
  GenerateCoverReferenceGroup,
  string
> = {
  creator: "Uploaded sketches, photos, and approved images you own in CharID.",
  context:
    "Descriptions, relationships, story summaries, locations, and world data.",
};
