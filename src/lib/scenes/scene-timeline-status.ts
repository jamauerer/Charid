import type { SceneWithCast } from "@/types/scene";

export type SceneTimelineStatus = "draft" | "ready";

export function deriveSceneTimelineStatus(scene: SceneWithCast): SceneTimelineStatus {
  return scene.summary.trim().length > 0 ? "ready" : "draft";
}
