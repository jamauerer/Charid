/** DOM ids for Summary → Advanced Story Details edit flow. */
export const STORY_ADVANCED_SECTION_ID = "story-advanced";
export const STORY_DETAILS_SECTION_ID = "story-details";
export const STORY_SUMMARY_TEXTAREA_ID = "edit-story-summary";

export function openStorySummaryEditor(): void {
  const advanced = document.getElementById(STORY_ADVANCED_SECTION_ID);
  if (advanced instanceof HTMLDetailsElement) {
    advanced.open = true;
  }

  const storyDetails = document.getElementById(STORY_DETAILS_SECTION_ID);
  storyDetails?.scrollIntoView({ behavior: "smooth", block: "start" });

  window.setTimeout(() => {
    const textarea = document.getElementById(STORY_SUMMARY_TEXTAREA_ID);
    if (textarea instanceof HTMLTextAreaElement) {
      textarea.focus();
    }
  }, 400);
}
