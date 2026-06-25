import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProjectWorkIntent } from "@/types/project";
import {
  defaultProductionName,
  type ProductionEntityKind,
} from "@/types/production";

const FIX_SQL_HINT =
  "Run supabase/migrations/20250711000000_production_mvp_v2.sql and " +
  "supabase/fix-production-mvp-v2-api.sql in the Supabase SQL Editor.";

const CANVAS_FIX_SQL_HINT =
  "Run supabase/migrations/20250712000000_production_canvas_phase_1.sql and " +
  "supabase/fix-production-canvas-phase-1-api.sql in the Supabase SQL Editor.";

const CANVAS_PHASE_2_FIX_SQL_HINT =
  "Run supabase/migrations/20250713000000_production_canvas_phase_2.sql and " +
  "supabase/fix-production-canvas-phase-2-api.sql in the Supabase SQL Editor.";

export function formatProductionError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    if (
      message.includes("production_surfaces") ||
      message.includes("canvas_document_versions")
    ) {
      return `Canvas tables are not exposed to the Supabase Data API yet. ${CANVAS_FIX_SQL_HINT}`;
    }
    if (
      message.includes("surface_id") ||
      message.includes("frame_x") ||
      message.includes("frame_y")
    ) {
      return `Canvas linking columns are not exposed to the Supabase Data API yet. ${CANVAS_PHASE_2_FIX_SQL_HINT}`;
    }
    return `Production tables are not exposed to the Supabase Data API yet. ${FIX_SQL_HINT}`;
  }
  return message;
}

export function revalidateProjectProduction(projectId: string): void {
  revalidatePath(`/dashboard/projects/${projectId}`);
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function assertProductionProject(
  supabase: SupabaseClient,
  projectId: string,
  expectedIntent?: ProjectWorkIntent
): Promise<{ error: string | null; workIntent: ProjectWorkIntent | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", workIntent: null };
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id, work_intent")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return {
      error: formatProductionError(error.message, error.code),
      workIntent: null,
    };
  }

  if (!data) {
    return { error: "Project not found.", workIntent: null };
  }

  const workIntent = (data.work_intent as ProjectWorkIntent | null) ?? null;

  if (expectedIntent && workIntent !== expectedIntent) {
    return {
      error: "This action is not available for this project format.",
      workIntent,
    };
  }

  return { error: null, workIntent };
}

export async function nextSortOrder(
  supabase: SupabaseClient,
  table: string,
  filterColumn: string,
  filterValue: string
): Promise<number> {
  const { data } = await supabase
    .from(table)
    .select("sort_order")
    .eq(filterColumn, filterValue)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return ((data?.sort_order as number | undefined) ?? 0) + 1;
}

export async function reorderBySortOrder(
  supabase: SupabaseClient,
  table: string,
  filterColumn: string,
  filterValue: string,
  orderedIds: string[]
): Promise<{ error?: string }> {
  const uniqueIds = [...new Set(orderedIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return { error: "No items to reorder." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from(table)
    .select("id")
    .eq(filterColumn, filterValue);

  if (fetchError) {
    return {
      error: formatProductionError(fetchError.message, fetchError.code),
    };
  }

  const existingIds = new Set((existing ?? []).map((row) => row.id as string));
  if (
    uniqueIds.length !== existingIds.size ||
    uniqueIds.some((id) => !existingIds.has(id))
  ) {
    return { error: "Item order does not match the current list." };
  }

  for (let index = 0; index < uniqueIds.length; index += 1) {
    const { error: updateError } = await supabase
      .from(table)
      .update({ sort_order: index })
      .eq("id", uniqueIds[index]);

    if (updateError) {
      return {
        error: formatProductionError(updateError.message, updateError.code),
      };
    }
  }

  return {};
}

export function validateEntityName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Name is required.";
  }
  if (trimmed.length > 200) {
    return "Name must be 200 characters or fewer.";
  }
  return null;
}

export async function defaultNameForSibling(
  supabase: SupabaseClient,
  table: string,
  filterColumn: string,
  filterValue: string,
  kind: ProductionEntityKind
): Promise<string> {
  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(filterColumn, filterValue);

  return defaultProductionName(kind, (count ?? 0) + 1);
}
