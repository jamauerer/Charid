import type { BibleSectionId } from "@/lib/character-bible-recommendations";

export type BibleNavigationTarget = {
  section: BibleSectionId;
  /** Matches [data-bible-target="…"] inside the active section panel */
  scrollTarget?: string;
  /** Input id to focus after scroll (identity / details fields) */
  focusId?: string;
};

export function bibleSlotTarget(assetRole: string): BibleNavigationTarget {
  if (assetRole === "canonical") {
    return { section: "reference", scrollTarget: "slot-canonical" };
  }
  if (assetRole.startsWith("turnaround_")) {
    return { section: "turnaround", scrollTarget: `slot-${assetRole}` };
  }
  if (assetRole.startsWith("expression_")) {
    return { section: "expressions", scrollTarget: `slot-${assetRole}` };
  }
  return { section: "reference", scrollTarget: "reference-gallery" };
}

export function recommendationTarget(recId: string): BibleNavigationTarget {
  switch (recId) {
    case "canonical":
      return bibleSlotTarget("canonical");
    case "species":
      return { section: "identity", focusId: "bible-species" };
    case "core_personality":
      return { section: "identity", focusId: "bible-personality" };
    case "backstory":
      return { section: "identity", focusId: "bible-backstory" };
    case "reference_gallery":
      return { section: "reference", scrollTarget: "reference-upload" };
    case "visual_descriptors":
      return { section: "details", focusId: "details-hair" };
    case "body_descriptors":
      return { section: "details", focusId: "details-build" };
    default:
      if (
        recId.startsWith("turnaround_") ||
        recId.startsWith("expression_")
      ) {
        return bibleSlotTarget(recId);
      }
      return { section: "identity" };
  }
}

const HIGHLIGHT_CLASS = "bible-nav-highlight";

function focusWithinSlot(slotEl: HTMLElement) {
  const assignSelect = slotEl.querySelector<HTMLSelectElement>("select");
  if (assignSelect) {
    assignSelect.focus({ preventScroll: true });
    return;
  }
  const fileInput = slotEl.querySelector<HTMLInputElement>('input[type="file"]');
  fileInput?.focus({ preventScroll: true });
}

function applyHighlight(el: HTMLElement) {
  el.classList.add(HIGHLIGHT_CLASS);
  window.setTimeout(() => el.classList.remove(HIGHLIGHT_CLASS), 2500);
}

/** Scroll, highlight, and focus after the target section is mounted. */
export function executeBibleNavigation(
  target: BibleNavigationTarget,
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
    applyHighlight(scrollEl);
    if (target.scrollTarget?.startsWith("slot-")) {
      focusWithinSlot(scrollEl);
    }
  }

  if (target.focusId) {
    const focusEl = document.getElementById(target.focusId);
    if (focusEl instanceof HTMLElement) {
      focusEl.focus({ preventScroll: true });
      applyHighlight(focusEl);
    }
  }
}
