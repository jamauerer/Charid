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
  normalizeComicArtDirection,
  normalizeComicIssue,
  normalizeComicPage,
  normalizeComicPanel,
  type ComicArtDirection,
  type ComicArtDirectionRow,
  type ComicIssue,
  type ComicIssueRow,
  type ComicIssueWithPages,
  type ComicPage,
  type ComicPageRow,
  type ComicPanel,
  type ComicPanelRow,
} from "@/types/production/comic";

export async function getComicProduction(projectId: string): Promise<{
  issues: ComicIssueWithPages[];
  artDirection: ComicArtDirection | null;
  error?: string;
}> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) {
    return { issues: [], artDirection: null, error: check.error };
  }

  const [issuesResult, artResult] = await Promise.all([
    supabase
      .from("comic_issues")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("comic_art_direction")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle(),
  ]);

  if (issuesResult.error) {
    return {
      issues: [],
      artDirection: null,
      error: formatProductionError(issuesResult.error.message, issuesResult.error.code),
    };
  }

  const issues = (issuesResult.data ?? []).map((row) =>
    normalizeComicIssue(row as ComicIssueRow)
  );

  const artDirection = artResult.data
    ? normalizeComicArtDirection(artResult.data as ComicArtDirectionRow)
    : null;

  if (issues.length === 0) {
    return { issues: [], artDirection };
  }

  const issueIds = issues.map((issue) => issue.id);
  const { data: pageRows, error: pagesError } = await supabase
    .from("comic_pages")
    .select("*")
    .in("issue_id", issueIds)
    .order("sort_order", { ascending: true });

  if (pagesError) {
    return {
      issues: [],
      artDirection,
      error: formatProductionError(pagesError.message, pagesError.code),
    };
  }

  const pages = (pageRows ?? []).map((row) => normalizeComicPage(row as ComicPageRow));
  const pageIds = pages.map((page) => page.id);

  let panels: ComicPanel[] = [];
  if (pageIds.length > 0) {
    const { data: panelRows, error: panelsError } = await supabase
      .from("comic_panels")
      .select("*")
      .in("page_id", pageIds)
      .order("sort_order", { ascending: true });

    if (panelsError) {
      return {
        issues: [],
        artDirection,
        error: formatProductionError(panelsError.message, panelsError.code),
      };
    }

    panels = (panelRows ?? []).map((row) => normalizeComicPanel(row as ComicPanelRow));
  }

  const panelsByPage = new Map<string, ComicPanel[]>();
  for (const panel of panels) {
    const list = panelsByPage.get(panel.page_id) ?? [];
    list.push(panel);
    panelsByPage.set(panel.page_id, list);
  }

  const pagesByIssue = new Map<string, (ComicPage & { panels: ComicPanel[] })[]>();
  for (const page of pages) {
    const list = pagesByIssue.get(page.issue_id) ?? [];
    list.push({ ...page, panels: panelsByPage.get(page.id) ?? [] });
    pagesByIssue.set(page.issue_id, list);
  }

  return {
    issues: issues.map((issue) => ({
      ...issue,
      pages: pagesByIssue.get(issue.id) ?? [],
    })),
    artDirection,
  };
}

export async function upsertComicArtDirection(
  projectId: string,
  input: { art_style: string; notes: string }
): Promise<{ artDirection?: ComicArtDirection; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  const payload = {
    project_id: projectId,
    art_style: input.art_style.trim(),
    notes: input.notes.trim(),
  };

  const { data: existing } = await supabase
    .from("comic_art_direction")
    .select("id")
    .eq("project_id", projectId)
    .maybeSingle();

  let data;
  let error;

  if (existing?.id) {
    ({ data, error } = await supabase
      .from("comic_art_direction")
      .update(payload)
      .eq("project_id", projectId)
      .select("*")
      .single());
  } else {
    ({ data, error } = await supabase
      .from("comic_art_direction")
      .insert(payload)
      .select("*")
      .single());
  }

  if (error || !data) {
    return {
      error: formatProductionError(
        error?.message ?? "Failed to save art direction.",
        error?.code
      ),
    };
  }

  revalidateProjectProduction(projectId);
  return { artDirection: normalizeComicArtDirection(data as ComicArtDirectionRow) };
}

async function assertComicIssueOwned(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  issueId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("comic_issues")
    .select("id")
    .eq("id", issueId)
    .eq("project_id", projectId)
    .maybeSingle();
  return Boolean(data);
}

async function assertComicPageOwned(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  pageId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("comic_pages")
    .select("id, issue_id")
    .eq("id", pageId)
    .maybeSingle();

  if (!data) return false;
  return assertComicIssueOwned(supabase, projectId, data.issue_id as string);
}

export async function createComicIssue(
  projectId: string
): Promise<{ issue?: ComicIssue; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  const sortOrder = await nextSortOrder(supabase, "comic_issues", "project_id", projectId);
  const name = await defaultNameForSibling(
    supabase,
    "comic_issues",
    "project_id",
    projectId,
    "issue"
  );

  const { data, error } = await supabase
    .from("comic_issues")
    .insert({ project_id: projectId, name, sort_order: sortOrder })
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: formatProductionError(error?.message ?? "Failed to create issue.", error?.code),
    };
  }

  revalidateProjectProduction(projectId);
  return { issue: normalizeComicIssue(data as ComicIssueRow) };
}

export async function renameComicIssue(
  projectId: string,
  issueId: string,
  name: string
): Promise<{ error?: string }> {
  const nameError = validateEntityName(name);
  if (nameError) return { error: nameError };

  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  const { error } = await supabase
    .from("comic_issues")
    .update({ name: name.trim() })
    .eq("id", issueId)
    .eq("project_id", projectId);

  if (error) return { error: formatProductionError(error.message, error.code) };

  revalidateProjectProduction(projectId);
  return {};
}

export async function deleteComicIssue(
  projectId: string,
  issueId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  const { error } = await supabase
    .from("comic_issues")
    .delete()
    .eq("id", issueId)
    .eq("project_id", projectId);

  if (error) return { error: formatProductionError(error.message, error.code) };

  revalidateProjectProduction(projectId);
  return {};
}

export async function reorderComicIssues(
  projectId: string,
  orderedIssueIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  const result = await reorderBySortOrder(
    supabase,
    "comic_issues",
    "project_id",
    projectId,
    orderedIssueIds
  );
  if (result.error) return result;

  revalidateProjectProduction(projectId);
  return {};
}

export async function createComicPage(
  projectId: string,
  issueId: string
): Promise<{ page?: ComicPage; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  if (!(await assertComicIssueOwned(supabase, projectId, issueId))) {
    return { error: "Issue not found." };
  }

  const sortOrder = await nextSortOrder(supabase, "comic_pages", "issue_id", issueId);
  const name = await defaultNameForSibling(
    supabase,
    "comic_pages",
    "issue_id",
    issueId,
    "page"
  );

  const { data, error } = await supabase
    .from("comic_pages")
    .insert({ issue_id: issueId, name, sort_order: sortOrder })
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: formatProductionError(error?.message ?? "Failed to create page.", error?.code),
    };
  }

  revalidateProjectProduction(projectId);
  return { page: normalizeComicPage(data as ComicPageRow) };
}

export async function renameComicPage(
  projectId: string,
  pageId: string,
  name: string
): Promise<{ error?: string }> {
  const nameError = validateEntityName(name);
  if (nameError) return { error: nameError };

  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  if (!(await assertComicPageOwned(supabase, projectId, pageId))) {
    return { error: "Page not found." };
  }

  const { error } = await supabase
    .from("comic_pages")
    .update({ name: name.trim() })
    .eq("id", pageId);

  if (error) return { error: formatProductionError(error.message, error.code) };

  revalidateProjectProduction(projectId);
  return {};
}

export async function deleteComicPage(
  projectId: string,
  pageId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  if (!(await assertComicPageOwned(supabase, projectId, pageId))) {
    return { error: "Page not found." };
  }

  const { error } = await supabase
    .from("comic_pages")
    .delete()
    .eq("id", pageId);

  if (error) return { error: formatProductionError(error.message, error.code) };

  revalidateProjectProduction(projectId);
  return {};
}

export async function reorderComicPages(
  projectId: string,
  issueId: string,
  orderedPageIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  if (!(await assertComicIssueOwned(supabase, projectId, issueId))) {
    return { error: "Issue not found." };
  }

  const result = await reorderBySortOrder(
    supabase,
    "comic_pages",
    "issue_id",
    issueId,
    orderedPageIds
  );
  if (result.error) return result;

  revalidateProjectProduction(projectId);
  return {};
}

export async function createComicPanel(
  projectId: string,
  pageId: string
): Promise<{ panel?: ComicPanel; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  if (!(await assertComicPageOwned(supabase, projectId, pageId))) {
    return { error: "Page not found." };
  }

  const sortOrder = await nextSortOrder(supabase, "comic_panels", "page_id", pageId);
  const name = await defaultNameForSibling(
    supabase,
    "comic_panels",
    "page_id",
    pageId,
    "panel"
  );

  const { data, error } = await supabase
    .from("comic_panels")
    .insert({ page_id: pageId, name, sort_order: sortOrder })
    .select("*")
    .single();

  if (error || !data) {
    return {
      error: formatProductionError(error?.message ?? "Failed to create panel.", error?.code),
    };
  }

  revalidateProjectProduction(projectId);
  return { panel: normalizeComicPanel(data as ComicPanelRow) };
}

export async function renameComicPanel(
  projectId: string,
  panelId: string,
  name: string
): Promise<{ error?: string }> {
  const nameError = validateEntityName(name);
  if (nameError) return { error: nameError };

  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  const { data: panel } = await supabase
    .from("comic_panels")
    .select("id, page_id")
    .eq("id", panelId)
    .maybeSingle();

  if (!panel || !(await assertComicPageOwned(supabase, projectId, panel.page_id as string))) {
    return { error: "Panel not found." };
  }

  const { error } = await supabase
    .from("comic_panels")
    .update({ name: name.trim() })
    .eq("id", panelId);

  if (error) return { error: formatProductionError(error.message, error.code) };

  revalidateProjectProduction(projectId);
  return {};
}

export async function deleteComicPanel(
  projectId: string,
  panelId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  const { data: panel } = await supabase
    .from("comic_panels")
    .select("id, page_id")
    .eq("id", panelId)
    .maybeSingle();

  if (!panel || !(await assertComicPageOwned(supabase, projectId, panel.page_id as string))) {
    return { error: "Panel not found." };
  }

  const { error } = await supabase
    .from("comic_panels")
    .delete()
    .eq("id", panelId);

  if (error) return { error: formatProductionError(error.message, error.code) };

  revalidateProjectProduction(projectId);
  return {};
}

export async function reorderComicPanels(
  projectId: string,
  pageId: string,
  orderedPanelIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  if (!(await assertComicPageOwned(supabase, projectId, pageId))) {
    return { error: "Page not found." };
  }

  const result = await reorderBySortOrder(
    supabase,
    "comic_panels",
    "page_id",
    pageId,
    orderedPanelIds
  );
  if (result.error) return result;

  revalidateProjectProduction(projectId);
  return {};
}
