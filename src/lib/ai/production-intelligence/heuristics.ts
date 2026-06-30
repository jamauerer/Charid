import type {
  DensityLevel,
  PacingLevel,
  ScenePurpose,
  StoryType,
} from "@/types/ai/production-intelligence";

const ACTION_WORDS = ["fight", "chase", "battle", "run", "attack", "explosion", "crash"];
const DIALOGUE_WORDS = ["said", "asked", "replied", "whisper", "shout", "conversation", "talk"];

export function inferStoryType(title: string, synopsis: string): StoryType {
  const text = `${title} ${synopsis}`.toLowerCase();
  if (/space|robot|future|sci|cyber|android/.test(text)) return "Sci-Fi";
  if (/magic|dragon|wizard|fantasy|kingdom|spell/.test(text)) return "Fantasy";
  if (/murder|mystery|detective|clue|secret|investigat/.test(text)) return "Mystery";
  if (/funny|comedy|laugh|joke|humor/.test(text)) return "Comedy";
  if (/quest|journey|adventure|travel|explore/.test(text)) return "Adventure";
  if (/daily|school|life|family|slice/.test(text)) return "Slice of Life";
  return "Drama";
}

export function countKeywordDensity(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  return words.reduce((count, word) => count + (lower.includes(word) ? 1 : 0), 0);
}

export function inferDensity(text: string, actionBias = 0): DensityLevel {
  const actionScore = countKeywordDensity(text, ACTION_WORDS) + actionBias;
  const dialogueScore = countKeywordDensity(text, DIALOGUE_WORDS);
  const score = actionScore + dialogueScore;
  if (score >= 4) return "High";
  if (score >= 2) return "Medium";
  return "Low";
}

export function inferPacing(sceneCount: number, projectPagesPerScene: number): PacingLevel {
  if (sceneCount <= 3) return "Slow";
  if (sceneCount >= 10) return "Fast";
  if (projectPagesPerScene <= 1) return "Fast";
  return "Medium";
}

export function scenePurposeForIndex(index: number, total: number): ScenePurpose {
  if (index === 0) return "Introduction";
  if (index === total - 1) return "Resolution";
  if (index === total - 2 && total > 3) return "Climax";
  if (index === Math.floor(total / 2)) return "Action";
  if (index % 3 === 1) return "Character Development";
  return "Transition";
}

export function complexityScore(input: {
  sceneCount: number;
  characterCount: number;
  dialogueDensity: DensityLevel;
  actionDensity: DensityLevel;
}): number {
  const densityScore =
    (input.dialogueDensity === "High" ? 2 : input.dialogueDensity === "Medium" ? 1 : 0) +
    (input.actionDensity === "High" ? 2 : input.actionDensity === "Medium" ? 1 : 0);
  return Math.min(10, input.sceneCount + input.characterCount + densityScore);
}

export function formatReadingTime(sceneCount: number, pacing: PacingLevel): string {
  const base = pacing === "Fast" ? 2 : pacing === "Slow" ? 5 : 3;
  const minutes = sceneCount * base;
  return minutes < 60 ? `${minutes} min` : `${Math.round(minutes / 60)} hr ${minutes % 60} min`;
}

export function formatFilmRuntime(sceneCount: number): string {
  const low = sceneCount * 1.5;
  const high = sceneCount * 3;
  return `${Math.round(low)}–${Math.round(high)} min`;
}
