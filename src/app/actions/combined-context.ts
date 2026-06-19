"use server";

import { assembleCombinedContextPacket as assemblePacket } from "@/lib/assemble-combined-context";
import type { CombinedContextPacket } from "@/types/combined-context-packet";

export async function getCombinedContextPacket(
  worldId: string,
  storyId: string,
  characterIds: string[] = []
): Promise<{ packet: CombinedContextPacket | null; error?: string }> {
  return assemblePacket(worldId, storyId, characterIds);
}
