import type { AiReadinessTier } from "@/types/context-packet";

/** Creator-facing labels for character workspace metrics and headers. */
export const CREATOR_CHARACTER = {
  workspaceLabel: "Creative workspace",
  referenceChecklistTitle: "Reference checklist",
  referenceChecklistHint:
    "See what's complete at a glance — click a row to jump to assign or upload.",
  sectionsNavLabel: "Character sections",
  guideImpactLabel: "Creative impact",
} as const;

export const CREATOR_METRICS = {
  profileComplete: "Profile complete",
  visualConsistency: "Visual consistency",
  referenceCoverage: "Reference coverage",
  consistencyScore: "Consistency score",
} as const;

export const CONSISTENCY_TIER_LABELS: Record<AiReadinessTier, string> = {
  started: "Getting started",
  developing: "Taking shape",
  growing: "Growing",
  strong: "Strong",
  ai_ready: "Ready to create",
};

/** Creator-facing labels for setting workspace metrics and headers. */
export const CREATOR_WORLD = {
  workspaceLabel: "Setting workspace",
  referenceChecklistTitle: "Reference checklist",
  referenceChecklistHint:
    "See what's complete at a glance — click a row to jump to assign or upload.",
  sectionsNavLabel: "Setting sections",
  guideImpactLabel: "Creative impact",
} as const;

export const CREATOR_WORLD_METRICS = {
  worldComplete: "Setting profile complete",
  worldConsistency: "Setting consistency",
  referenceCoverage: "Reference coverage",
  consistencyScore: "Consistency score",
} as const;

/** Creator-facing labels for story workspace metrics and headers. */
export const CREATOR_STORY = {
  workspaceLabel: "Story",
  whatsNextLabel: "What's next",
  whatsNextHint: "One gentle step to keep your story moving.",
  chaptersHint: "Write and organize your story one chapter at a time.",
  createNextChapterLabel: "Create next chapter",
  scenesHint: "Where your story happens — one moment at a time.",
  createSceneLabel: "Create scene",
  scenesEmptyHint: "Add the first beat — who, what, and where.",
  sceneWhatHappensLabel: "What happens?",
  sceneLocationLabel: "Location",
  sceneLocationOptional: "optional",
  sceneCharactersOptional: "optional",
  sceneCharactersEmptyHint:
    "Optional — pick from your story cast below, or add characters in Cast & Connections first.",
  timelineLabel: "Timeline",
  timelineHint:
    "Drag scenes to reorder. Click a scene to open it, or use + to insert.",
  timelineEmptyHint: "Use + to add your first scene.",
  needSceneIdeasLabel: "Need ideas?",
  needSceneIdeasHint: "CharID can suggest what happens next — you approve every scene.",
  generateSceneSuggestionsLabel: "Generate scene suggestions",
  reviewActiveSuggestionsLabel: "Review active suggestions",
  reviewActiveSuggestionsHint:
    "Approve, edit, or clear these before generating new ideas.",
  chapterContextLabel: "Chapter context (optional)",
  chapterToScenesLabel: "Break this chapter into scenes?",
  chapterToScenesHint: "CharID can propose scene beats from your chapter — nothing saves until you approve.",
  advancedPlanLabel: "Advanced planning",
  advancedPlanHint:
    "Timeline, themes, locations, and references — for when you want to plan deeper.",
  referenceChecklistTitle: "Reference checklist",
  referenceChecklistHint:
    "See what's complete at a glance — click a row to jump to assign or upload.",
  sectionsNavLabel: "Story sections",
  guideImpactLabel: "Creative impact",
} as const;

export const CREATOR_STORY_METRICS = {
  storyComplete: "Story profile complete",
  storyConsistency: "Story consistency",
  referenceCoverage: "Reference coverage",
  consistencyScore: "Consistency score",
} as const;

/** Creator-facing labels for project workspace. */
export const CREATOR_PROJECT = {
  whatsNextLabel: "What's next",
  whatsNextHint: "One clear step to keep this project moving.",
  styleReferencesTitle: "Style & References",
  styleReferencesHint:
    "Your cover and reference images help keep art consistent across the project.",
  sectionsNavLabel: "Project sections",
} as const;
