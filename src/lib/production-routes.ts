export function comicPageWorkspacePath(projectId: string, pageId: string): string {
  return `/dashboard/projects/${projectId}/production/pages/${pageId}`;
}

export function comicPageStudioPath(projectId: string, pageId: string): string {
  return `/dashboard/projects/${projectId}/studio/pages/${pageId}`;
}

export function comicPageEditorPath(
  projectId: string,
  pageId: string,
  mode: "embedded" | "full" = "embedded"
): string {
  return mode === "full"
    ? comicPageStudioPath(projectId, pageId)
    : comicPageWorkspacePath(projectId, pageId);
}

export function storybookSpreadWorkspacePath(
  projectId: string,
  spreadId: string
): string {
  return `/dashboard/projects/${projectId}/production/spreads/${spreadId}`;
}

export function novelChapterWorkspacePath(
  projectId: string,
  chapterId: string
): string {
  return `/dashboard/projects/${projectId}/production/chapters/${chapterId}`;
}

export function screenplayBeatWorkspacePath(
  projectId: string,
  beatId: string
): string {
  return `/dashboard/projects/${projectId}/production/beats/${beatId}`;
}

export function projectProductionPath(projectId: string): string {
  return `/dashboard/projects/${projectId}#project-production`;
}
