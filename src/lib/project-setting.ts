import type { SupabaseClient } from "@supabase/supabase-js";
import { slugifyWorldName, normalizeWorld, type World, type WorldRow } from "@/types/world";
import type { Project, ProjectWorkIntent } from "@/types/project";

/** Marks auto-provisioned setting shells — not shown to creators as named worlds. */
export const AUTO_SETTING_DESCRIPTION = "[auto]";

export function defaultSettingName(projectTitle: string): string {
  return `${projectTitle} — Setting`;
}

export function isAutoProvisionedSetting(
  world: { description?: string | null; name: string },
  projectTitle?: string | null
): boolean {
  if (world.description === AUTO_SETTING_DESCRIPTION) {
    return true;
  }
  if (projectTitle && world.name === defaultSettingName(projectTitle)) {
    return true;
  }
  return false;
}

export function shouldShowWorldInSettingsIndex(
  world: { description?: string | null; name: string },
  project?: { title: string; work_intent: ProjectWorkIntent | null } | null
): boolean {
  if (!isAutoProvisionedSetting(world, project?.title ?? null)) {
    return true;
  }
  return project?.work_intent === "worldbuilding";
}

function slugWithSuffix(base: string, suffix: number): string {
  const suffixStr = String(suffix);
  const maxBaseLen = 50 - suffixStr.length;
  return `${base.slice(0, maxBaseLen)}${suffixStr}`;
}

async function isWorldSlugTaken(
  supabase: SupabaseClient,
  userId: string,
  slug: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("worlds")
    .select("id")
    .eq("user_id", userId)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return data !== null;
}

async function resolveAvailableWorldSlug(
  supabase: SupabaseClient,
  userId: string,
  name: string
): Promise<string> {
  const base = slugifyWorldName(name);

  if (!(await isWorldSlugTaken(supabase, userId, base))) {
    return base;
  }

  for (let n = 2; n <= 9999; n++) {
    const candidate = slugWithSuffix(base, n);
    if (!(await isWorldSlugTaken(supabase, userId, candidate))) {
      return candidate;
    }
  }

  throw new Error("Unable to allocate a unique setting slug.");
}

type EnsureProjectDefaultSettingResult = {
  world: World | null;
  error?: string;
  created?: boolean;
  linked?: boolean;
};

/**
 * Ensures every project has a resolvable setting (world) row.
 * Reuses an existing project-linked world, links a story's world, or creates an auto shell.
 */
export async function ensureProjectDefaultSetting(
  supabase: SupabaseClient,
  userId: string,
  project: Pick<Project, "id" | "title">
): Promise<EnsureProjectDefaultSettingResult> {
  const { data: linkedWorld, error: linkedError } = await supabase
    .from("worlds")
    .select("*")
    .eq("project_id", project.id)
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (linkedError) {
    return { world: null, error: linkedError.message };
  }
  if (linkedWorld) {
    return { world: normalizeWorld(linkedWorld as WorldRow) };
  }

  const { data: storyRows, error: storiesError } = await supabase
    .from("stories")
    .select("world_id")
    .eq("project_id", project.id)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (storiesError) {
    return { world: null, error: storiesError.message };
  }

  const storyWorldIds = [
    ...new Set(
      (storyRows ?? [])
        .map((row) => row.world_id as string | null)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  if (storyWorldIds.length > 0) {
    const { data: orphanWorld, error: orphanError } = await supabase
      .from("worlds")
      .select("*")
      .eq("id", storyWorldIds[0])
      .eq("user_id", userId)
      .maybeSingle();

    if (orphanError) {
      return { world: null, error: orphanError.message };
    }
    if (orphanWorld) {
      if (!orphanWorld.project_id) {
        const { error: linkError } = await supabase
          .from("worlds")
          .update({ project_id: project.id })
          .eq("id", orphanWorld.id)
          .eq("user_id", userId);

        if (linkError) {
          return { world: null, error: linkError.message };
        }
      }

      return {
        world: normalizeWorld({ ...orphanWorld, project_id: project.id } as WorldRow),
        linked: true,
      };
    }
  }

  let slug: string;
  try {
    slug = await resolveAvailableWorldSlug(
      supabase,
      userId,
      defaultSettingName(project.title)
    );
  } catch (err) {
    return {
      world: null,
      error: err instanceof Error ? err.message : "Failed to generate setting slug.",
    };
  }

  const { data: created, error: insertError } = await supabase
    .from("worlds")
    .insert({
      user_id: userId,
      project_id: project.id,
      name: defaultSettingName(project.title),
      slug,
      description: AUTO_SETTING_DESCRIPTION,
      is_public: false,
    })
    .select("*")
    .single();

  if (insertError || !created) {
    return {
      world: null,
      error: insertError?.message ?? "Failed to create default setting.",
    };
  }

  return {
    world: normalizeWorld(created as WorldRow),
    created: true,
  };
}
