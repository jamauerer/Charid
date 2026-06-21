"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Character, CharacterRow } from "@/types/character";
import { normalizeCharacter } from "@/types/character";
import type { StoryWithCounts } from "@/types/story";
import { getPublicStoriesByWorld } from "@/app/actions/stories";
import { getStoryCoverUrls } from "@/app/actions/story-images";
import type { World, WorldRow, WorldWithCounts } from "@/types/world";
import { normalizeWorld, slugifyWorldName } from "@/types/world";
import { scanUploadedImage } from "@/lib/moderation/scan-image";
import { scanSavedText } from "@/lib/moderation/scan-text";
import { getOrCreateDefaultProject } from "@/app/actions/projects";
import {
  CHARACTER_PHOTOS_BUCKET,
  createSignedUrlCache,
  getSignedStorageUrl,
  lookupSignedUrl,
  signStorageUrls,
} from "@/lib/storage/signed-url";
import { shouldShowWorldInSettingsIndex } from "@/lib/project-setting";
import type { ProjectWorkIntent } from "@/types/project";

const BUCKET = CHARACTER_PHOTOS_BUCKET;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type WorldActionState = {
  error?: string;
  success?: boolean;
  world?: World;
};

export type WorldsResult = {
  worlds: WorldWithCounts[];
  error?: string;
};

function formatWorldError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "The worlds table is not exposed to the Supabase Data API yet. " +
      "Run supabase/migrations/20250618000000_worlds.sql and " +
      "supabase/fix-worlds-api.sql in the Supabase SQL Editor."
    );
  }
  if (code === "23505" || message.includes("worlds_user_id_slug_key")) {
    return "That world slug is already in use on your account.";
  }
  return message;
}

function validateCover(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Cover image must be a JPEG, PNG, or WebP file.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Cover image must be 5 MB or smaller.";
  }
  return null;
}

function slugWithSuffix(base: string, suffix: number): string {
  const suffixStr = String(suffix);
  const maxBaseLen = 50 - suffixStr.length;
  return `${base.slice(0, maxBaseLen)}${suffixStr}`;
}

async function isSlugTaken(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  slug: string,
  excludeWorldId?: string
): Promise<boolean> {
  let query = supabase
    .from("worlds")
    .select("id")
    .eq("user_id", userId)
    .eq("slug", slug);

  if (excludeWorldId) {
    query = query.neq("id", excludeWorldId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data !== null;
}

async function resolveAvailableSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  name: string,
  excludeWorldId?: string
): Promise<string> {
  const base = slugifyWorldName(name);

  if (!(await isSlugTaken(supabase, userId, base, excludeWorldId))) {
    return base;
  }

  for (let n = 2; n <= 9999; n++) {
    const candidate = slugWithSuffix(base, n);
    if (!(await isSlugTaken(supabase, userId, candidate, excludeWorldId))) {
      return candidate;
    }
  }

  throw new Error("Unable to allocate a unique world slug.");
}

export async function getWorldCoverUrl(
  path: string | null
): Promise<string | null> {
  const supabase = await createClient();
  return getSignedStorageUrl(supabase, path);
}

async function attachCharacterCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  worlds: World[]
): Promise<WorldWithCounts[]> {
  const { data: characters } = await supabase
    .from("characters")
    .select("world_id")
    .eq("user_id", userId)
    .not("world_id", "is", null);

  const counts = new Map<string, number>();
  for (const row of characters ?? []) {
    if (row.world_id) {
      counts.set(row.world_id, (counts.get(row.world_id) ?? 0) + 1);
    }
  }

  return worlds.map((world) => ({
    ...world,
    character_count: counts.get(world.id) ?? 0,
  }));
}

async function revalidateWorldPaths(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  world?: World,
  oldSlug?: string
) {
  revalidatePath("/dashboard/worlds");
  revalidatePath("/dashboard");
  if (world) {
    revalidatePath(`/dashboard/worlds/${world.id}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.username) {
    revalidatePath(`/u/${profile.username}`);
    if (world) {
      revalidatePath(`/u/${profile.username}/worlds/${world.slug}`);
    }
    if (oldSlug && oldSlug !== world?.slug) {
      revalidatePath(`/u/${profile.username}/worlds/${oldSlug}`);
    }
  }
}

export async function getWorlds(): Promise<WorldsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { worlds: [] };
  }

  const { data, error } = await supabase
    .from("worlds")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      worlds: [],
      error: formatWorldError(error.message, error.code),
    };
  }

  const worlds = (data ?? []).map((row) => normalizeWorld(row as WorldRow));

  const projectIds = [
    ...new Set(
      worlds
        .map((world) => world.project_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const projectMap = new Map<
    string,
    { title: string; work_intent: ProjectWorkIntent | null }
  >();

  if (projectIds.length > 0) {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, title, work_intent")
      .eq("user_id", user.id)
      .in("id", projectIds);

    for (const row of projects ?? []) {
      projectMap.set(row.id as string, {
        title: row.title as string,
        work_intent: (row.work_intent as ProjectWorkIntent | null) ?? null,
      });
    }
  }

  const visibleWorlds = worlds.filter((world) =>
    shouldShowWorldInSettingsIndex(
      world,
      world.project_id ? projectMap.get(world.project_id) ?? null : null
    )
  );

  return {
    worlds: await attachCharacterCounts(supabase, user.id, visibleWorlds),
  };
}

export async function getWorldById(
  worldId: string
): Promise<{ world: World | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { world: null, error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("worlds")
    .select("*")
    .eq("id", worldId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { world: null, error: formatWorldError(error.message, error.code) };
  }

  if (!data) {
    return { world: null };
  }

  return { world: normalizeWorld(data as WorldRow) };
}

export async function getWorldSelectOptions(): Promise<
  { id: string; name: string }[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("worlds")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch world options:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getCharactersByWorldId(
  worldId: string
): Promise<{ characters: Character[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { characters: [], error: "You must be logged in." };
  }

  const { data: world, error: worldError } = await supabase
    .from("worlds")
    .select("id")
    .eq("id", worldId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (worldError || !world) {
    return { characters: [], error: "World not found." };
  }

  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .eq("world_id", worldId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      characters: [],
      error: formatWorldError(error.message, error.code),
    };
  }

  return {
    characters: (data ?? []).map((row) =>
      normalizeCharacter(row as CharacterRow)
    ),
  };
}

export async function createWorld(
  _prevState: WorldActionState,
  formData: FormData
): Promise<WorldActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const description =
    String(formData.get("description") ?? "").trim() || null;
  const isPublic = formData.get("is_public") === "true";
  const cover = formData.get("cover");

  if (!name) {
    return { error: "World name is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const formProjectId = String(formData.get("project_id") ?? "").trim();
  let projectId: string | null = null;

  if (formProjectId) {
    const { data: projectRow } = await supabase
      .from("projects")
      .select("id")
      .eq("id", formProjectId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (projectRow) {
      projectId = projectRow.id as string;
    }
  }

  if (!projectId) {
    const defaultProject = await getOrCreateDefaultProject(supabase, user.id);
    if (defaultProject.error && !defaultProject.project) {
      return { error: defaultProject.error };
    }
    projectId = defaultProject.project?.id ?? null;
  }

  let slug: string;
  try {
    slug = await resolveAvailableSlug(supabase, user.id, name);
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Failed to generate world slug.",
    };
  }

  const worldId = randomUUID();
  let coverPath: string | null = null;

  if (cover instanceof File && cover.size > 0) {
    const coverError = validateCover(cover);
    if (coverError) {
      return { error: coverError };
    }

    const extension = cover.type.split("/")[1] ?? "jpg";
    coverPath = `${user.id}/worlds/${worldId}/cover.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(coverPath, cover, {
        contentType: cover.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: `Failed to upload cover image: ${uploadError.message}` };
    }
  }

  const { data: created, error: insertError } = await supabase
    .from("worlds")
    .insert({
      id: worldId,
      user_id: user.id,
      project_id: projectId,
      name,
      slug,
      description,
      cover_image_path: coverPath,
      is_public: isPublic,
    })
    .select()
    .single();

  if (insertError || !created) {
    if (coverPath) {
      await supabase.storage.from(BUCKET).remove([coverPath]);
    }
    return {
      error: formatWorldError(
        insertError?.message ?? "Failed to create world.",
        insertError?.code
      ),
    };
  }

  const world = normalizeWorld(created as WorldRow);
  await revalidateWorldPaths(supabase, user.id, world);

  if (projectId) {
    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath("/dashboard/projects");
  }

  void scanSavedText({
    supabase,
    userId: user.id,
    entityType: "world",
    entityId: worldId,
    fields: { name, description },
  });

  if (coverPath) {
    void scanUploadedImage({
      supabase,
      userId: user.id,
      entityType: "world_cover",
      entityId: worldId,
      storageBucket: BUCKET,
      storagePath: coverPath,
      mimeType: cover instanceof File ? cover.type : undefined,
    });
  }

  return { success: true, world };
}

export async function updateWorld(
  _prevState: WorldActionState,
  formData: FormData
): Promise<WorldActionState> {
  const worldId = String(formData.get("world_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description =
    String(formData.get("description") ?? "").trim() || null;
  const isPublic = formData.get("is_public") === "true";
  const cover = formData.get("cover");
  const removeCover = formData.get("remove_cover") === "true";

  if (!worldId) {
    return { error: "World ID is required." };
  }

  if (!name) {
    return { error: "World name is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("worlds")
    .select("*")
    .eq("id", worldId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: "World not found." };
  }

  const oldSlug = existing.slug as string;
  let slug = oldSlug;

  if (name !== existing.name) {
    try {
      slug = await resolveAvailableSlug(supabase, user.id, name, worldId);
    } catch (err) {
      return {
        error:
          err instanceof Error ? err.message : "Failed to generate world slug.",
      };
    }
  }

  let coverPath: string | null = existing.cover_image_path;
  let oldCoverToDelete: string | null = null;
  let newlyUploadedPath: string | null = null;

  if (cover instanceof File && cover.size > 0) {
    const coverError = validateCover(cover);
    if (coverError) {
      return { error: coverError };
    }

    const extension = cover.type.split("/")[1] ?? "jpg";
    const newCoverPath = `${user.id}/worlds/${worldId}/cover.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(newCoverPath, cover, {
        contentType: cover.type,
        upsert: true,
      });

    if (uploadError) {
      return { error: `Failed to upload cover image: ${uploadError.message}` };
    }

    newlyUploadedPath = newCoverPath;
    if (existing.cover_image_path && existing.cover_image_path !== newCoverPath) {
      oldCoverToDelete = existing.cover_image_path;
    }
    coverPath = newCoverPath;
  } else if (removeCover && existing.cover_image_path) {
    oldCoverToDelete = existing.cover_image_path;
    coverPath = null;
  }

  const { data: updated, error: updateError } = await supabase
    .from("worlds")
    .update({
      name,
      slug,
      description,
      is_public: isPublic,
      cover_image_path: coverPath,
    })
    .eq("id", worldId)
    .select()
    .single();

  if (updateError || !updated) {
    if (newlyUploadedPath) {
      await supabase.storage.from(BUCKET).remove([newlyUploadedPath]);
    }
    return {
      error: formatWorldError(
        updateError?.message ?? "Failed to update world.",
        updateError?.code
      ),
    };
  }

  if (oldCoverToDelete) {
    await supabase.storage.from(BUCKET).remove([oldCoverToDelete]);
  }

  const world = normalizeWorld(updated as WorldRow);
  await revalidateWorldPaths(supabase, user.id, world, oldSlug);

  void scanSavedText({
    supabase,
    userId: user.id,
    entityType: "world",
    entityId: worldId,
    fields: { name, description },
  });

  if (newlyUploadedPath) {
    void scanUploadedImage({
      supabase,
      userId: user.id,
      entityType: "world_cover",
      entityId: worldId,
      storageBucket: BUCKET,
      storagePath: newlyUploadedPath,
      mimeType: cover instanceof File ? cover.type : undefined,
    });
  }

  return { success: true, world };
}

export async function getPublicWorlds(
  username: string
): Promise<{ worlds: World[]; coverUrls: Record<string, string | null> }> {
  const supabase = await createClient();
  const normalizedUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_public")
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (!profile?.is_public) {
    return { worlds: [], coverUrls: {} };
  }

  const { data, error } = await supabase
    .from("worlds")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch public worlds:", error.message);
    return { worlds: [], coverUrls: {} };
  }

  const worlds = (data ?? []).map((row) => normalizeWorld(row as WorldRow));
  const cache = createSignedUrlCache();
  await signStorageUrls(
    supabase,
    worlds.map((world) => world.cover_image_path),
    { cache }
  );

  const coverUrls: Record<string, string | null> = {};
  for (const world of worlds) {
    coverUrls[world.id] = lookupSignedUrl(cache, world.cover_image_path);
  }

  return { worlds, coverUrls };
}

export async function getPublicWorld(
  username: string,
  slug: string
): Promise<{
  world: World | null;
  coverUrl: string | null;
  stories: StoryWithCounts[];
  storyCoverUrls: Record<string, string | null>;
  characters: Character[];
  characterPhotos: Record<string, string | null>;
  profileUsername: string | null;
  error?: string;
}> {
  const supabase = await createClient();
  const normalizedUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const normalizedSlug = slugifyWorldName(slug);

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, is_public")
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (!profile?.is_public) {
    return {
      world: null,
      coverUrl: null,
      stories: [],
      storyCoverUrls: {},
      characters: [],
      characterPhotos: {},
      profileUsername: null,
    };
  }

  const { data: worldRow, error: worldError } = await supabase
    .from("worlds")
    .select("*")
    .eq("user_id", profile.id)
    .eq("slug", normalizedSlug)
    .eq("is_public", true)
    .maybeSingle();

  if (worldError) {
    return {
      world: null,
      coverUrl: null,
      stories: [],
      storyCoverUrls: {},
      characters: [],
      characterPhotos: {},
      profileUsername: profile.username,
      error: formatWorldError(worldError.message, worldError.code),
    };
  }

  if (!worldRow) {
    return {
      world: null,
      coverUrl: null,
      stories: [],
      storyCoverUrls: {},
      characters: [],
      characterPhotos: {},
      profileUsername: profile.username,
    };
  }

  const world = normalizeWorld(worldRow as WorldRow);

  const { data: characterRows } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", profile.id)
    .eq("world_id", world.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  const cache = createSignedUrlCache();
  const characters = (characterRows ?? []).map((row) =>
    normalizeCharacter(row as CharacterRow)
  );

  await signStorageUrls(
    supabase,
    [
      world.cover_image_path,
      ...characters.map((character) => character.photo_path),
    ],
    { cache }
  );

  const coverUrl = lookupSignedUrl(cache, world.cover_image_path);
  const stories = await getPublicStoriesByWorld(world.id);
  const storyCoverUrls = await getStoryCoverUrls(stories.map((story) => story.id));

  const characterPhotos = Object.fromEntries(
    characters.map((character) => [
      character.id,
      lookupSignedUrl(cache, character.photo_path),
    ])
  );

  return {
    world,
    coverUrl,
    stories,
    storyCoverUrls,
    characters,
    characterPhotos,
    profileUsername: profile.username,
  };
}
