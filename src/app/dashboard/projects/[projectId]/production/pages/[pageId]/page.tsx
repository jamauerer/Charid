import { notFound, redirect } from "next/navigation";
import { getComicProduction } from "@/app/actions/production/comic";
import { getComicPageLayoutState } from "@/app/actions/production/page-layout";
import {
  getComicPageWorkspace,
  getProjectCanonContext,
} from "@/app/actions/production/workspace";
import { ComicPageWorkspaceView } from "@/components/project/production/comic/ComicPageWorkspaceView";

type ComicPageWorkspacePageProps = {
  params: Promise<{ projectId: string; pageId: string }>;
};

export default async function ComicPageWorkspacePage({
  params,
}: ComicPageWorkspacePageProps) {
  const { projectId, pageId } = await params;

  const [workspaceResult, comicResult, layoutResult, canon] = await Promise.all([
    getComicPageWorkspace(projectId, pageId),
    getComicProduction(projectId),
    getComicPageLayoutState(projectId, pageId),
    getProjectCanonContext(projectId),
  ]);

  if (workspaceResult.error?.includes("logged in")) {
    redirect("/login");
  }

  if (!workspaceResult.data) {
    notFound();
  }

  return (
    <ComicPageWorkspaceView
      projectId={projectId}
      data={workspaceResult.data}
      templateId={layoutResult.templateId}
      panelBorderStyle={layoutResult.panelBorderStyle}
      issues={comicResult.issues}
      stories={canon.stories}
      sceneRollup={canon.sceneRollup}
      characters={canon.characters}
    />
  );
}
