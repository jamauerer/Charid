import type { CharacterContextPacket } from "@/types/context-packet";
import type { StoryContextPacket } from "@/types/story-context-packet";
import type { WorldContextPacket } from "@/types/world-context-packet";

export type CombinedContextPacket = {
  kind: "combined";
  schemaVersion: "1.0";
  assembledAt: string;
  worldId: string;
  storyId: string;
  characterIds: string[];
  world: WorldContextPacket;
  story: StoryContextPacket;
  characters: CharacterContextPacket[];
  derived: null;
};
