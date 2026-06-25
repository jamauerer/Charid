import { notFound, redirect } from "next/navigation";
import { getStorybookProduction } from "@/app/actions/production/storybook";
import { getStorybookSpreadLayoutState } from "@/app/actions/production/spread-layout";
import {
  getProjectCanonContext,
  getStorybookSpreadWorkspace,
} from "@/app/actions/production/workspace";
import { StorybookSpreadWorkspaceView } from "@/components/project/production/storybook/StorybookSpreadWorkspaceView";

type StorybookSpreadWorkspacePageProps = {
  params: Promise<{ projectId: string; spreadId: string }>;
};

export default async function StorybookSpreadWorkspacePage({
  params,
}: StorybookSpreadWorkspacePageProps) {
  const { projectId, spreadId } = await params;

  const [workspaceResult, storybookResult, layoutResult, canon] = await Promise.all([
    getStorybookSpreadWorkspace(projectId, spreadId),
    getStorybookProduction(projectId),
    getStorybookSpreadLayoutState(projectId, spreadId),
    getProjectCanonContext(projectId),
  ]);

  if (workspaceResult.error?.includes("logged in")) {
    redirect("/login");
  }

  if (!workspaceResult.data || !layoutResult.data) {
    notFound();
  }

  return (
    <StorybookSpreadWorkspaceView
      projectId={projectId}
      data={workspaceResult.data}
      layout={layoutResult.data}
      spreads={storybookResult.spreads}
      stories={canon.stories}
      sceneRollup={canon.sceneRollup}
      characters={canon.characters}
    />
  );
}
