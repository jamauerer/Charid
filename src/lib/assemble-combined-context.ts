import { getCharacterContextPacket } from "@/app/actions/character-bible";
import { getStoryContextPacket } from "@/app/actions/story-bible";
import { getWorldContextPacket } from "@/app/actions/world-bible";
import type { CombinedContextPacket } from "@/types/combined-context-packet";

export async function assembleCombinedContextPacket(
  worldId: string,
  storyId: string,
  characterIds: string[]
): Promise<{ packet: CombinedContextPacket | null; error?: string }> {
  const [worldResult, storyResult] = await Promise.all([
    getWorldContextPacket(worldId),
    getStoryContextPacket(storyId),
  ]);

  if (worldResult.error || !worldResult.packet) {
    return {
      packet: null,
      error: worldResult.error ?? "Failed to assemble world context packet.",
    };
  }

  if (storyResult.error || !storyResult.packet) {
    return {
      packet: null,
      error: storyResult.error ?? "Failed to assemble story context packet.",
    };
  }

  if (storyResult.packet.story.worldId !== worldId) {
    return { packet: null, error: "Story does not belong to this world." };
  }

  const uniqueCharacterIds = [...new Set(characterIds.filter(Boolean))];
  const characterResults = await Promise.all(
    uniqueCharacterIds.map((characterId) => getCharacterContextPacket(characterId))
  );

  const characters = [];
  for (const result of characterResults) {
    if (result.error || !result.packet) {
      return {
        packet: null,
        error: result.error ?? "Failed to assemble character context packet.",
      };
    }
    characters.push(result.packet);
  }

  return {
    packet: {
      kind: "combined",
      schemaVersion: "1.0",
      assembledAt: new Date().toISOString(),
      worldId,
      storyId,
      characterIds: uniqueCharacterIds,
      world: worldResult.packet,
      story: storyResult.packet,
      characters,
      derived: null,
    },
  };
}
