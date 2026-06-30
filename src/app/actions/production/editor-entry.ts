"use server";

import { createClient } from "@/lib/supabase/server";
import { comicPageStudioPath, projectProductionPath } from "@/lib/production-routes";

export async function getEditorEntryHref(): Promise<{ href: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { href: "/dashboard/projects", error: "You must be logged in." };
  }

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, updated_at")
    .eq("user_id", user.id)
    .eq("work_intent", "comic")
    .order("updated_at", { ascending: false })
    .limit(12);

  if (projectsError) {
    return { href: "/dashboard/projects", error: projectsError.message };
  }

  if (!projects?.length) {
    return { href: "/dashboard/projects" };
  }

  for (const project of projects) {
    const projectId = project.id as string;
    const { data: issues } = await supabase
      .from("comic_issues")
      .select("id")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    if (!issues?.length) continue;

    const issueIds = issues.map((issue) => issue.id as string);
    const { data: pages } = await supabase
      .from("comic_pages")
      .select("id, created_at")
      .in("issue_id", issueIds)
      .order("created_at", { ascending: false })
      .limit(1);

    if (pages?.length) {
      return { href: comicPageStudioPath(projectId, pages[0].id as string) };
    }
  }

  return { href: projectProductionPath(projects[0].id as string) };
}
