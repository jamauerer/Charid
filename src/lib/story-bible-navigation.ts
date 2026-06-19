export type StorySectionId =
  | "overview"
  | "timeline"
  | "major_events"
  | "characters"
  | "locations"
  | "assets"
  | "metrics"
  | "recommendations";

export type StoryNavigationTarget = {
  section: StorySectionId;
  scrollTarget?: string;
  focusId?: string;
};

export function storySlotTarget(slotRole: string): StoryNavigationTarget {
  if (slotRole === "cover") {
    return { section: "assets", scrollTarget: "story-reference-upload" };
  }
  return { section: "assets", scrollTarget: "story-reference-upload" };
}

export function storyRecommendationTarget(
  section: StorySectionId,
  scrollTarget?: string,
  focusId?: string
): StoryNavigationTarget {
  return { section, scrollTarget, focusId };
}

const HIGHLIGHT_CLASS = "bible-nav-highlight";

export function executeStoryNavigation(
  target: StoryNavigationTarget,
  sectionPanel: HTMLElement | null
) {
  const root = sectionPanel;
  if (!root) return;

  const scrollEl = target.scrollTarget
    ? root.querySelector<HTMLElement>(
        `[data-bible-target="${target.scrollTarget}"]`
      )
    : root;

  if (scrollEl) {
    scrollEl.scrollIntoView({ behavior: "smooth", block: "center" });
    scrollEl.classList.add(HIGHLIGHT_CLASS);
    window.setTimeout(() => scrollEl.classList.remove(HIGHLIGHT_CLASS), 2500);
  }

  if (target.focusId) {
    const focusEl = document.getElementById(target.focusId);
    if (focusEl instanceof HTMLElement) {
      focusEl.focus({ preventScroll: true });
      focusEl.classList.add(HIGHLIGHT_CLASS);
      window.setTimeout(() => focusEl.classList.remove(HIGHLIGHT_CLASS), 2500);
    }
  }
}
