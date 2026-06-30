import { randomUUID } from "crypto";

/** Storage paths must start with auth uid for character-photos bucket RLS. */
export function productionPanelArtworkPath(
  userId: string,
  projectId: string,
  panelId: string,
  extension: string
): string {
  return `${userId}/production/${projectId}/panels/${panelId}/${randomUUID()}.${extension}`;
}
