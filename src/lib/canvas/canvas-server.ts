import { revalidatePath } from "next/cache";

const CANVAS_FIX_SQL_HINT =
  "Run supabase/migrations/20250712000000_production_canvas_phase_1.sql and " +
  "supabase/fix-production-canvas-phase-1-api.sql in the Supabase SQL Editor.";

const CANVAS_PHASE_2_FIX_SQL_HINT =
  "Run supabase/migrations/20250713000000_production_canvas_phase_2.sql and " +
  "supabase/fix-production-canvas-phase-2-api.sql in the Supabase SQL Editor.";

export function formatCanvasError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    if (
      message.includes("comic_panels") ||
      message.includes("storybook_spreads") ||
      message.includes("surface_id")
    ) {
      return `Canvas linking columns are not exposed to the Supabase Data API yet. ${CANVAS_PHASE_2_FIX_SQL_HINT}`;
    }
    return `Canvas tables are not exposed to the Supabase Data API yet. ${CANVAS_FIX_SQL_HINT}`;
  }
  return message;
}

export function revalidateProjectCanvas(projectId: string): void {
  revalidatePath(`/dashboard/projects/${projectId}`);
}
