"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createAndLinkSpreadSurface,
  deleteSurfaceById,
} from "@/lib/canvas/link-surface";
import {
  assertProductionProject,
  defaultNameForSibling,
  formatProductionError,
  nextSortOrder,
  reorderBySortOrder,
  revalidateProjectProduction,
  validateEntityName,
} from "@/lib/production-server";
import {
  normalizeStorybookSettings,
  normalizeStorybookSpread,
  type StorybookSettings,
  type StorybookSettingsRow,
  type StorybookSpread,
  type StorybookSpreadRow,
} from "@/types/production/storybook";

export async function getStorybookProduction(projectId: string): Promise<{
  settings: StorybookSettings | null;
  spreads: StorybookSpread[];
  error?: string;
}> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "picture_book");
  if (check.error) {
    return { settings: null, spreads: [], error: check.error };
  }

  const [settingsResult, spreadsResult] = await Promise.all([
    supabase
      .from("storybook_settings")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle(),
    supabase
      .from("storybook_spreads")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true }),
  ]);

  if (settingsResult.error) {
    return {
      settings: null,
      spreads: [],
      error: formatProductionError(settingsResult.error.message, settingsResult.error.code),
    };
  }

  if (spreadsResult.error) {
    return {
      settings: null,
      spreads: [],
      error: formatProductionError(spreadsResult.error.message, spreadsResult.error.code),
    };
  }

  return {
    settings: settingsResult.data
      ? normalizeStorybookSettings(settingsResult.data as StorybookSettingsRow)
      : null,
    spreads: (spreadsResult.data ?? []).map((row) =>
      normalizeStorybookSpread(row as StorybookSpreadRow)
    ),
  };
}

export async function upsertStorybookSettings(
  projectId: string,
  input: {
    age_range: string;
    reading_level: string;
    educational_goals: string;
  }
): Promise<{ settings?: StorybookSettings; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "picture_book");
  if (check.error) return { error: check.error };

  const payload = {
    project_id: projectId,
    age_range: input.age_range.trim(),
    reading_level: input.reading_level.trim(),
    educational_goals: input.educational_goals.trim(),
  };

  const { data: existing } = await supabase
    .from("storybook_settings")
    .select("id")
    .eq("project_id", projectId)
    .maybeSingle();

  let data;
  let error;

  if (existing?.id) {
    ({ data, error } = await supabase
      .from("storybook_settings")
      .update(payload)
      .eq("project_id", projectId)
      .select("*")
      .single());
  } else {
    ({ data, error } = await supabase
      .from("storybook_settings")
      .insert(payload)
      .select("*")
      .single());
  }

  if (error || !data) {
    return {
      error: formatProductionError(
        error?.message ?? "Failed to save book settings.",
        error?.code
      ),
    };
  }

  revalidateProjectProduction(projectId);
  return { settings: normalizeStorybookSettings(data as StorybookSettingsRow) };
}

export async function createStorybookSpread(
  projectId: string
): Promise<{ spread?: StorybookSpread; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "picture_book");
  if (check.error) return { error: check.error };

  const sortOrder = await nextSortOrder(
    supabase,
    "storybook_spreads",
    "project_id",
    projectId
  );
  const name = await defaultNameForSibling(
    supabase,
    "storybook_spreads",
    "project_id",
    projectId,
    "spread"
  );

  const { data, error } = await supabase
    .from("storybook_spreads")
    .insert({ project_id: projectId, name, sort_order: sortOrder })
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: formatProductionError(
        error?.message ?? "Failed to create spread.",
        error?.code
      ),
    };
  }

  const linkResult = await createAndLinkSpreadSurface(supabase, projectId, data.id);
  if (linkResult.error) {
    await supabase.from("storybook_spreads").delete().eq("id", data.id);
    return { error: linkResult.error };
  }

  const { data: linkedSpread, error: reloadError } = await supabase
    .from("storybook_spreads")
    .select("*")
    .eq("id", data.id)
    .single();

  if (reloadError || !linkedSpread) {
    if (linkResult.surface) {
      await deleteSurfaceById(supabase, projectId, linkResult.surface.id);
    }
    await supabase.from("storybook_spreads").delete().eq("id", data.id);
    return {
      error: formatProductionError(
        reloadError?.message ?? "Failed to load linked spread.",
        reloadError?.code
      ),
    };
  }

  revalidateProjectProduction(projectId);
  return { spread: normalizeStorybookSpread(linkedSpread as StorybookSpreadRow) };
}

export async function renameStorybookSpread(
  projectId: string,
  spreadId: string,
  name: string
): Promise<{ error?: string }> {
  const nameError = validateEntityName(name);
  if (nameError) return { error: nameError };

  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "picture_book");
  if (check.error) return { error: check.error };

  const { error } = await supabase
    .from("storybook_spreads")
    .update({ name: name.trim() })
    .eq("id", spreadId)
    .eq("project_id", projectId);

  if (error) return { error: formatProductionError(error.message, error.code) };

  revalidateProjectProduction(projectId);
  return {};
}

export async function deleteStorybookSpread(
  projectId: string,
  spreadId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "picture_book");
  if (check.error) return { error: check.error };

  const { data: spread } = await supabase
    .from("storybook_spreads")
    .select("id, surface_id")
    .eq("id", spreadId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (!spread) {
    return { error: "Spread not found." };
  }

  if (spread.surface_id) {
    const surfaceDelete = await deleteSurfaceById(
      supabase,
      projectId,
      spread.surface_id as string
    );
    if (surfaceDelete.error) {
      return { error: surfaceDelete.error };
    }
  }

  const { error } = await supabase
    .from("storybook_spreads")
    .delete()
    .eq("id", spreadId)
    .eq("project_id", projectId);

  if (error) return { error: formatProductionError(error.message, error.code) };

  revalidateProjectProduction(projectId);
  return {};
}

export async function reorderStorybookSpreads(
  projectId: string,
  orderedSpreadIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "picture_book");
  if (check.error) return { error: check.error };

  const result = await reorderBySortOrder(
    supabase,
    "storybook_spreads",
    "project_id",
    projectId,
    orderedSpreadIds
  );
  if (result.error) return result;

  revalidateProjectProduction(projectId);
  return {};
}
