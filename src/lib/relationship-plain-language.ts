import {
  RELATIONSHIP_TYPE_DEFS,
  type RelationshipType,
} from "@/lib/relationship-types";

function possessiveRole(
  type: RelationshipType,
  customLabel: string | null | undefined
): string {
  if (type === "custom" && customLabel?.trim()) {
    return customLabel.trim().toLowerCase();
  }

  const def = RELATIONSHIP_TYPE_DEFS[type];
  return def.label.toLowerCase();
}

/** Plain sentence for a directed bond: from → to. e.g. "Noah is Jane's parent". */
export function formatDirectedRelationship(
  fromName: string,
  toName: string,
  type: RelationshipType,
  customLabel?: string | null
): string {
  if (type === "custom" && customLabel?.trim()) {
    return `${fromName} and ${toName} — ${customLabel.trim()}`;
  }

  const def = RELATIONSHIP_TYPE_DEFS[type];
  if (def.symmetric) {
    const label = def.label.toLowerCase();
    if (label === "best friend") return `${fromName} and ${toName} are best friends`;
    if (label === "sibling") return `${fromName} and ${toName} are siblings`;
    if (label.endsWith("s")) return `${fromName} and ${toName} are ${label}`;
    return `${fromName} and ${toName} are ${label}s`;
  }

  return `${fromName} is ${toName}'s ${possessiveRole(type, customLabel)}`;
}

/** How the viewer relates to someone else on their character page. */
export function formatRelationshipForViewer(
  viewerName: string,
  otherName: string,
  type: RelationshipType,
  direction: "outgoing" | "incoming",
  customLabel?: string | null
): string {
  if (direction === "outgoing") {
    return formatDirectedRelationship(viewerName, otherName, type, customLabel);
  }

  if (type === "custom" && customLabel?.trim()) {
    return `${viewerName} and ${otherName} — ${customLabel.trim()}`;
  }

  const def = RELATIONSHIP_TYPE_DEFS[type];
  if (def.symmetric) {
    const label = def.label.toLowerCase();
    if (label === "best friend") return `${viewerName} and ${otherName} are best friends`;
    if (label === "sibling") return `${viewerName} and ${otherName} are siblings`;
    if (label.endsWith("s")) return `${viewerName} and ${otherName} are ${label}`;
    return `${viewerName} and ${otherName} are ${label}s`;
  }

  const inverse = def.inverseLabel?.toLowerCase() ?? def.label.toLowerCase();
  return `${viewerName} is ${otherName}'s ${inverse}`;
}

/** Preview while creating: current character → selected character. */
export function formatRelationshipPreview(
  subjectName: string,
  otherName: string,
  type: RelationshipType,
  customLabel?: string | null
): string {
  if (!otherName.trim()) {
    return `Choose a character to see how this reads.`;
  }
  return formatDirectedRelationship(subjectName, otherName, type, customLabel);
}
