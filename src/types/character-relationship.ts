import type { RelationshipType } from "@/lib/relationship-types";

export type CharacterRelationship = {
  id: string;
  user_id: string;
  from_character_id: string;
  to_character_id: string;
  relationship_type: RelationshipType;
  custom_label: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CharacterRelationshipRow = {
  id: string;
  user_id: string;
  from_character_id: string;
  to_character_id: string;
  relationship_type: string;
  custom_label?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export function normalizeCharacterRelationship(
  row: CharacterRelationshipRow
): CharacterRelationship {
  return {
    id: row.id,
    user_id: row.user_id,
    from_character_id: row.from_character_id,
    to_character_id: row.to_character_id,
    relationship_type: row.relationship_type as RelationshipType,
    custom_label: row.custom_label ?? null,
    notes: row.notes ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export type CharacterRelationshipEntry = {
  relationship: CharacterRelationship;
  direction: "outgoing" | "incoming";
  otherCharacter: {
    id: string;
    name: string;
    photo_path: string | null;
    portrait_focal_y?: number | null;
  };
};
