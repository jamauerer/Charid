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
  normalizeNovelChapter,
  normalizeNovelPart,
  type NovelChapter,
  type NovelChapterRow,
  type NovelPart,
  type NovelPartRow,
  type NovelPartWithChapters,
} from "@/types/production/novel";

export async function getNovelProduction(projectId: string): Promise<{
  parts: NovelPartWithChapters[];
  error?: string;
}> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "novel");
  if (check.error) {
    return { parts: [], error: check.error };
  }

  const { data: partRows, error: partsError } = await supabase
    .from("novel_parts")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (partsError) {
    return {
      parts: [],
      error: formatProductionError(partsError.message, partsError.code),
    };
  }

  const parts = (partRows ?? []).map((row) =>
    normalizeNovelPart(row as NovelPartRow)
  );

  if (parts.length === 0) {
    return { parts: [] };
  }

  const partIds = parts.map((part) => part.id);
  const { data: chapterRows, error: chaptersError } = await supabase
    .from("novel_chapters")
    .select("*")
    .in("part_id", partIds)
    .order("sort_order", { ascending: true });

  if (chaptersError) {
    return {
      parts: [],
      error: formatProductionError(chaptersError.message, chaptersError.code),
    };
  }

  const chaptersByPart = new Map<string, NovelChapter[]>();
  for (const row of chapterRows ?? []) {
    const chapter = normalizeNovelChapter(row as NovelChapterRow);
    const list = chaptersByPart.get(chapter.part_id) ?? [];
    list.push(chapter);
    chaptersByPart.set(chapter.part_id, list);
  }

  return {
    parts: parts.map((part) => ({
      ...part,
      chapters: chaptersByPart.get(part.id) ?? [],
    })),
  };
}

export async function createNovelPart(
  projectId: string
): Promise<{ part?: NovelPart; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "novel");
  if (check.error) return { error: check.error };

  const sortOrder = await nextSortOrder(supabase, "novel_parts", "project_id", projectId);
  const name = await defaultNameForSibling(
    supabase,
    "novel_parts",
    "project_id",
    projectId,
    "part"
  );

  const { data, error } = await supabase
    .from("novel_parts")
    .insert({ project_id: projectId, name, sort_order: sortOrder })
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: formatProductionError(error?.message ?? "Failed to create part.", error?.code),
    };
  }

  revalidateProjectProduction(projectId);
  return { part: normalizeNovelPart(data as NovelPartRow) };
}

export async function renameNovelPart(
  projectId: string,
  partId: string,
  name: string
): Promise<{ error?: string }> {
  const nameError = validateEntityName(name);
  if (nameError) return { error: nameError };

  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "novel");
  if (check.error) return { error: check.error };

  const { error } = await supabase
    .from("novel_parts")
    .update({ name: name.trim() })
    .eq("id", partId)
    .eq("project_id", projectId);

  if (error) {
    return { error: formatProductionError(error.message, error.code) };
  }

  revalidateProjectProduction(projectId);
  return {};
}

export async function deleteNovelPart(
  projectId: string,
  partId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "novel");
  if (check.error) return { error: check.error };

  const { error } = await supabase
    .from("novel_parts")
    .delete()
    .eq("id", partId)
    .eq("project_id", projectId);

  if (error) {
    return { error: formatProductionError(error.message, error.code) };
  }

  revalidateProjectProduction(projectId);
  return {};
}

export async function reorderNovelParts(
  projectId: string,
  orderedPartIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "novel");
  if (check.error) return { error: check.error };

  const result = await reorderBySortOrder(
    supabase,
    "novel_parts",
    "project_id",
    projectId,
    orderedPartIds
  );
  if (result.error) return result;

  revalidateProjectProduction(projectId);
  return {};
}

export async function createNovelChapter(
  projectId: string,
  partId: string
): Promise<{ chapter?: NovelChapter; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "novel");
  if (check.error) return { error: check.error };

  const { data: part } = await supabase
    .from("novel_parts")
    .select("id")
    .eq("id", partId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (!part) {
    return { error: "Part not found." };
  }

  const sortOrder = await nextSortOrder(supabase, "novel_chapters", "part_id", partId);
  const name = await defaultNameForSibling(
    supabase,
    "novel_chapters",
    "part_id",
    partId,
    "chapter"
  );

  const { data, error } = await supabase
    .from("novel_chapters")
    .insert({ part_id: partId, name, sort_order: sortOrder })
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: formatProductionError(
        error?.message ?? "Failed to create chapter.",
        error?.code
      ),
    };
  }

  revalidateProjectProduction(projectId);
  return { chapter: normalizeNovelChapter(data as NovelChapterRow) };
}

export async function renameNovelChapter(
  projectId: string,
  chapterId: string,
  name: string
): Promise<{ error?: string }> {
  const nameError = validateEntityName(name);
  if (nameError) return { error: nameError };

  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "novel");
  if (check.error) return { error: check.error };

  const { data: chapter } = await supabase
    .from("novel_chapters")
    .select("id, part_id")
    .eq("id", chapterId)
    .maybeSingle();

  if (!chapter) return { error: "Chapter not found." };

  const { data: part } = await supabase
    .from("novel_parts")
    .select("id")
    .eq("id", chapter.part_id as string)
    .eq("project_id", projectId)
    .maybeSingle();

  if (!part) return { error: "Chapter not found." };

  const { error } = await supabase
    .from("novel_chapters")
    .update({ name: name.trim() })
    .eq("id", chapterId);

  if (error) {
    return { error: formatProductionError(error.message, error.code) };
  }

  revalidateProjectProduction(projectId);
  return {};
}

export async function deleteNovelChapter(
  projectId: string,
  chapterId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "novel");
  if (check.error) return { error: check.error };

  const { data: chapter } = await supabase
    .from("novel_chapters")
    .select("id, part_id")
    .eq("id", chapterId)
    .maybeSingle();

  if (!chapter) return { error: "Chapter not found." };

  const { data: part } = await supabase
    .from("novel_parts")
    .select("id")
    .eq("id", chapter.part_id as string)
    .eq("project_id", projectId)
    .maybeSingle();

  if (!part) return { error: "Chapter not found." };

  const { error } = await supabase
    .from("novel_chapters")
    .delete()
    .eq("id", chapterId);

  if (error) {
    return { error: formatProductionError(error.message, error.code) };
  }

  revalidateProjectProduction(projectId);
  return {};
}

export async function reorderNovelChapters(
  projectId: string,
  partId: string,
  orderedChapterIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "novel");
  if (check.error) return { error: check.error };

  const { data: part } = await supabase
    .from("novel_parts")
    .select("id")
    .eq("id", partId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (!part) return { error: "Part not found." };

  const result = await reorderBySortOrder(
    supabase,
    "novel_chapters",
    "part_id",
    partId,
    orderedChapterIds
  );
  if (result.error) return result;

  revalidateProjectProduction(projectId);
  return {};
}
