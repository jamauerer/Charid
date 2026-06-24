"use server";

import { createClient } from "@/lib/supabase/server";
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
  normalizeScreenplayAct,
  normalizeScreenplayBeat,
  type ScreenplayAct,
  type ScreenplayActRow,
  type ScreenplayActWithBeats,
  type ScreenplayBeat,
  type ScreenplayBeatRow,
} from "@/types/production/screenplay";

export async function getScreenplayProduction(projectId: string): Promise<{
  acts: ScreenplayActWithBeats[];
  error?: string;
}> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "screenplay");
  if (check.error) {
    return { acts: [], error: check.error };
  }

  const { data: actRows, error: actsError } = await supabase
    .from("screenplay_acts")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (actsError) {
    return {
      acts: [],
      error: formatProductionError(actsError.message, actsError.code),
    };
  }

  const acts = (actRows ?? []).map((row) => normalizeScreenplayAct(row as ScreenplayActRow));

  if (acts.length === 0) {
    return { acts: [] };
  }

  const actIds = acts.map((act) => act.id);
  const { data: beatRows, error: beatsError } = await supabase
    .from("screenplay_beats")
    .select("*")
    .in("act_id", actIds)
    .order("sort_order", { ascending: true });

  if (beatsError) {
    return {
      acts: [],
      error: formatProductionError(beatsError.message, beatsError.code),
    };
  }

  const beatsByAct = new Map<string, ScreenplayBeat[]>();
  for (const row of beatRows ?? []) {
    const beat = normalizeScreenplayBeat(row as ScreenplayBeatRow);
    const list = beatsByAct.get(beat.act_id) ?? [];
    list.push(beat);
    beatsByAct.set(beat.act_id, list);
  }

  return {
    acts: acts.map((act) => ({
      ...act,
      beats: beatsByAct.get(act.id) ?? [],
    })),
  };
}

export async function createScreenplayAct(
  projectId: string
): Promise<{ act?: ScreenplayAct; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "screenplay");
  if (check.error) return { error: check.error };

  const sortOrder = await nextSortOrder(
    supabase,
    "screenplay_acts",
    "project_id",
    projectId
  );
  const name = await defaultNameForSibling(
    supabase,
    "screenplay_acts",
    "project_id",
    projectId,
    "act"
  );

  const { data, error } = await supabase
    .from("screenplay_acts")
    .insert({ project_id: projectId, name, sort_order: sortOrder })
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: formatProductionError(error?.message ?? "Failed to create act.", error?.code),
    };
  }

  revalidateProjectProduction(projectId);
  return { act: normalizeScreenplayAct(data as ScreenplayActRow) };
}

export async function renameScreenplayAct(
  projectId: string,
  actId: string,
  name: string
): Promise<{ error?: string }> {
  const nameError = validateEntityName(name);
  if (nameError) return { error: nameError };

  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "screenplay");
  if (check.error) return { error: check.error };

  const { error } = await supabase
    .from("screenplay_acts")
    .update({ name: name.trim() })
    .eq("id", actId)
    .eq("project_id", projectId);

  if (error) return { error: formatProductionError(error.message, error.code) };

  revalidateProjectProduction(projectId);
  return {};
}

export async function deleteScreenplayAct(
  projectId: string,
  actId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "screenplay");
  if (check.error) return { error: check.error };

  const { error } = await supabase
    .from("screenplay_acts")
    .delete()
    .eq("id", actId)
    .eq("project_id", projectId);

  if (error) return { error: formatProductionError(error.message, error.code) };

  revalidateProjectProduction(projectId);
  return {};
}

export async function reorderScreenplayActs(
  projectId: string,
  orderedActIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "screenplay");
  if (check.error) return { error: check.error };

  const result = await reorderBySortOrder(
    supabase,
    "screenplay_acts",
    "project_id",
    projectId,
    orderedActIds
  );
  if (result.error) return result;

  revalidateProjectProduction(projectId);
  return {};
}

export async function createScreenplayBeat(
  projectId: string,
  actId: string
): Promise<{ beat?: ScreenplayBeat; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "screenplay");
  if (check.error) return { error: check.error };

  const { data: act } = await supabase
    .from("screenplay_acts")
    .select("id")
    .eq("id", actId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (!act) return { error: "Act not found." };

  const sortOrder = await nextSortOrder(supabase, "screenplay_beats", "act_id", actId);
  const name = await defaultNameForSibling(
    supabase,
    "screenplay_beats",
    "act_id",
    actId,
    "beat"
  );

  const { data, error } = await supabase
    .from("screenplay_beats")
    .insert({ act_id: actId, name, sort_order: sortOrder })
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: formatProductionError(error?.message ?? "Failed to create beat.", error?.code),
    };
  }

  revalidateProjectProduction(projectId);
  return { beat: normalizeScreenplayBeat(data as ScreenplayBeatRow) };
}

export async function renameScreenplayBeat(
  projectId: string,
  beatId: string,
  name: string
): Promise<{ error?: string }> {
  const nameError = validateEntityName(name);
  if (nameError) return { error: nameError };

  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "screenplay");
  if (check.error) return { error: check.error };

  const { data: beat } = await supabase
    .from("screenplay_beats")
    .select("id, act_id")
    .eq("id", beatId)
    .maybeSingle();

  if (!beat) return { error: "Beat not found." };

  const { data: act } = await supabase
    .from("screenplay_acts")
    .select("id")
    .eq("id", beat.act_id as string)
    .eq("project_id", projectId)
    .maybeSingle();

  if (!act) return { error: "Beat not found." };

  const { error } = await supabase
    .from("screenplay_beats")
    .update({ name: name.trim() })
    .eq("id", beatId);

  if (error) return { error: formatProductionError(error.message, error.code) };

  revalidateProjectProduction(projectId);
  return {};
}

export async function deleteScreenplayBeat(
  projectId: string,
  beatId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "screenplay");
  if (check.error) return { error: check.error };

  const { data: beat } = await supabase
    .from("screenplay_beats")
    .select("id, act_id")
    .eq("id", beatId)
    .maybeSingle();

  if (!beat) return { error: "Beat not found." };

  const { data: act } = await supabase
    .from("screenplay_acts")
    .select("id")
    .eq("id", beat.act_id as string)
    .eq("project_id", projectId)
    .maybeSingle();

  if (!act) return { error: "Beat not found." };

  const { error } = await supabase
    .from("screenplay_beats")
    .delete()
    .eq("id", beatId);

  if (error) return { error: formatProductionError(error.message, error.code) };

  revalidateProjectProduction(projectId);
  return {};
}

export async function reorderScreenplayBeats(
  projectId: string,
  actId: string,
  orderedBeatIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "screenplay");
  if (check.error) return { error: check.error };

  const { data: act } = await supabase
    .from("screenplay_acts")
    .select("id")
    .eq("id", actId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (!act) return { error: "Act not found." };

  const result = await reorderBySortOrder(
    supabase,
    "screenplay_beats",
    "act_id",
    actId,
    orderedBeatIds
  );
  if (result.error) return result;

  revalidateProjectProduction(projectId);
  return {};
}
