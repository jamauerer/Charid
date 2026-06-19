import { redirect, notFound } from "next/navigation";
import { getSceneById } from "@/app/actions/scenes";
import { getActiveSceneSuggestionBatch } from "@/app/actions/scene-suggestions";
import { getStoryProjectContext } from "@/app/actions/projects";
import { getStoryWorkspaceContext } from "@/app/actions/story-workspace";
import { getWorldById } from "@/app/actions/worlds";
import { SceneWorkspaceView } from "@/components/scene-workspace/SceneWorkspaceView";

type ScenePageProps = {
  params: Promise<{ id: string; storyId: string; sceneId: string }>;
};

export default async function ScenePage({ params }: ScenePageProps) {
  const { id: worldId, storyId, sceneId } = await params;

  const { world, error: worldError } = await getWorldById(worldId);
  if (worldError === "You must be logged in.") {
    redirect("/login");
  }
  if (!world) {
    notFound();
  }

  const { context, error: contextError } = await getStoryWorkspaceContext(
    worldId,
    storyId
  );
  if (!context) {
    if (contextError?.includes("not found")) {
      notFound();
    }
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-[var(--status-info-text)]">
        {contextError ?? "Could not load story workspace."}
      </div>
    );
  }

  const [{ scene, error: sceneError }, { batch: suggestionBatch }, { project: projectContext }] =
    await Promise.all([
      getSceneById(storyId, sceneId),
      getActiveSceneSuggestionBatch(storyId),
      getStoryProjectContext(storyId, worldId),
    ]);

  if (!scene) {
    notFound();
  }
  if (sceneError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]">
          {sceneError}
        </p>
      </div>
    );
  }

  const hasActiveSuggestions =
    (suggestionBatch?.items.filter((item) => item.status === "pending").length ??
      0) > 0;

  return (
    <SceneWorkspaceView
      worldId={worldId}
      storyId={storyId}
      storyTitle={context.story.title}
      scene={scene}
      cast={context.cast}
      locations={context.locations.map(({ location }) => ({
        id: location.id,
        name: location.name,
      }))}
      projectContext={projectContext}
      worldName={world.name}
      hasActiveSuggestions={hasActiveSuggestions}
    />
  );
}
