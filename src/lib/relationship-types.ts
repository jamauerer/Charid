export const RELATIONSHIP_TYPES = [
  "friend",
  "best_friend",
  "rival",
  "enemy",
  "mentor",
  "student",
  "parent",
  "child",
  "sibling",
  "partner",
  "spouse",
  "companion",
  "familiar",
  "daemon",
  "mount",
  "custom",
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export type RelationshipTypeDef = {
  slug: RelationshipType;
  label: string;
  symmetric: boolean;
  inverseLabel?: string;
};

export const RELATIONSHIP_TYPE_DEFS: Record<
  RelationshipType,
  RelationshipTypeDef
> = {
  friend: { slug: "friend", label: "Friend", symmetric: true },
  best_friend: { slug: "best_friend", label: "Best Friend", symmetric: true },
  rival: { slug: "rival", label: "Rival", symmetric: true },
  enemy: { slug: "enemy", label: "Enemy", symmetric: true },
  mentor: {
    slug: "mentor",
    label: "Mentor",
    symmetric: false,
    inverseLabel: "Student",
  },
  student: {
    slug: "student",
    label: "Student",
    symmetric: false,
    inverseLabel: "Mentor",
  },
  parent: {
    slug: "parent",
    label: "Parent",
    symmetric: false,
    inverseLabel: "Child",
  },
  child: {
    slug: "child",
    label: "Child",
    symmetric: false,
    inverseLabel: "Parent",
  },
  sibling: { slug: "sibling", label: "Sibling", symmetric: true },
  partner: { slug: "partner", label: "Partner", symmetric: true },
  spouse: { slug: "spouse", label: "Spouse", symmetric: true },
  companion: { slug: "companion", label: "Companion", symmetric: false },
  familiar: { slug: "familiar", label: "Familiar", symmetric: false },
  daemon: { slug: "daemon", label: "Daemon", symmetric: false },
  mount: {
    slug: "mount",
    label: "Mount",
    symmetric: false,
    inverseLabel: "Rider",
  },
  custom: { slug: "custom", label: "Custom", symmetric: true },
};

export function isRelationshipType(value: string): value is RelationshipType {
  return (RELATIONSHIP_TYPES as readonly string[]).includes(value);
}

export function relationshipDisplayLabel(
  type: RelationshipType,
  customLabel: string | null,
  direction: "outgoing" | "incoming"
): string {
  if (type === "custom" && customLabel?.trim()) {
    return customLabel.trim();
  }
  const def = RELATIONSHIP_TYPE_DEFS[type];
  if (direction === "incoming" && !def.symmetric && def.inverseLabel) {
    return def.inverseLabel;
  }
  return def.label;
}
