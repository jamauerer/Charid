import { notFound, redirect } from "next/navigation";
import { getScreenplayProduction } from "@/app/actions/production/screenplay";
import {
  getProjectCanonContext,
  getScreenplayBeatWorkspace,
} from "@/app/actions/production/workspace";
import { ScreenplayBeatWorkspaceView } from "@/components/project/production/screenplay/ScreenplayBeatWorkspaceView";

type ScreenplayBeatWorkspacePageProps = {
  params: Promise<{ projectId: string; beatId: string }>;
};

export default async function ScreenplayBeatWorkspacePage({
  params,
}: ScreenplayBeatWorkspacePageProps) {
  const { projectId, beatId } = await params;

  const [workspaceResult, screenplayResult, canon] = await Promise.all([
    getScreenplayBeatWorkspace(projectId, beatId),
    getScreenplayProduction(projectId),
    getProjectCanonContext(projectId),
  ]);

  if (workspaceResult.error?.includes("logged in")) {
    redirect("/login");
  }

  if (!workspaceResult.data) {
    notFound();
  }

  return (
    <ScreenplayBeatWorkspaceView
      projectId={projectId}
      data={workspaceResult.data}
      acts={screenplayResult.acts}
      stories={canon.stories}
      sceneRollup={canon.sceneRollup}
      characters={canon.characters}
    />
  );
}
