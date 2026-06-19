export type WorldMap = {
  id: string;
  world_id: string;
  user_id: string;
  image_id: string | null;
  title: string;
  map_type: "static" | "interactive";
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type WorldMapRow = {
  id: string;
  world_id: string;
  user_id: string;
  image_id?: string | null;
  title: string;
  map_type: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export function normalizeWorldMap(row: WorldMapRow): WorldMap {
  return {
    id: row.id,
    world_id: row.world_id,
    user_id: row.user_id,
    image_id: row.image_id ?? null,
    title: row.title,
    map_type: row.map_type === "interactive" ? "interactive" : "static",
    is_primary: row.is_primary,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export type MapLocationPin = {
  id: string;
  map_id: string;
  location_id: string | null;
  label: string;
  pin_x: number;
  pin_y: number;
  created_at: string;
};

export type MapLocationPinRow = {
  id: string;
  map_id: string;
  location_id?: string | null;
  label: string;
  pin_x: number | string;
  pin_y: number | string;
  created_at: string;
};

export function normalizeMapLocationPin(row: MapLocationPinRow): MapLocationPin {
  return {
    id: row.id,
    map_id: row.map_id,
    location_id: row.location_id ?? null,
    label: row.label,
    pin_x: Number(row.pin_x),
    pin_y: Number(row.pin_y),
    created_at: row.created_at,
  };
}

export type WorldMapBundle = {
  map: WorldMap;
  imageUrl: string | null;
  pins: MapLocationPin[];
};
