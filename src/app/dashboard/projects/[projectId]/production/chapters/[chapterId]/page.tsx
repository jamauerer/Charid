import { notFound, redirect } from "next/navigation";
import { getNovelProduction } from "@/app/actions/production/novel";
import {
  getNovelChapterWorkspace,
  getProjectCanonContext,
} from "@/app/actions/production/workspace";
import { NovelChapterWorkspaceView } from "@/components/project/production/novel/NovelChapterWorkspaceView";

type NovelChapterWorkspacePageProps = {
  params: Promise<{ projectId: string; chapterId: string }>;
};

export default async function NovelChapterWorkspacePage({
  params,
}: NovelChapterWorkspacePageProps) {
  const { projectId, chapterId } = await params;

  const [workspaceResult, novelResult, canon] = await Promise.all([
    getNovelChapterWorkspace(projectId, chapterId),
    getNovelProduction(projectId),
    getProjectCanonContext(projectId),
  ]);

  if (workspaceResult.error?.includes("logged in")) {
    redirect("/login");
  }

  if (!workspaceResult.data) {
    notFound();
  }

  return (
    <NovelChapterWorkspaceView
      projectId={projectId}
      data={workspaceResult.data}
      parts={novelResult.parts}
      stories={canon.stories}
      sceneRollup={canon.sceneRollup}
      characters={canon.characters}
    />
  );
}
