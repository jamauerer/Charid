import type { LocationType } from "@/lib/location-types";

export type WorldLocation = {
  id: string;
  world_id: string;
  user_id: string;
  name: string;
  location_type: LocationType;
  description: string | null;
  cover_image_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type WorldLocationRow = {
  id: string;
  world_id: string;
  user_id: string;
  name: string;
  location_type: string;
  description?: string | null;
  cover_image_id?: string | null;
  sort_order?: number;
  created_at: string;
  updated_at: string;
};

export function normalizeWorldLocation(row: WorldLocationRow): WorldLocation {
  return {
    id: row.id,
    world_id: row.world_id,
    user_id: row.user_id,
    name: row.name,
    location_type: row.location_type as LocationType,
    description: row.description ?? null,
    cover_image_id: row.cover_image_id ?? null,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export type WorldLocationWithCover = {
  location: WorldLocation;
  coverUrl: string | null;
};
