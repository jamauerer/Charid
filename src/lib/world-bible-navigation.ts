export type WorldSectionId =
  | "overview"
  | "locations"
  | "cultures"
  | "rules"
  | "assets";

export type WorldNavigationTarget = {
  section: WorldSectionId;
  scrollTarget?: string;
  focusId?: string;
};

export function worldSlotTarget(slotRole: string): WorldNavigationTarget {
  if (slotRole === "canonical_map" || slotRole === "canonical_reference") {
    return { section: "locations", scrollTarget: `slot-${slotRole}` };
  }
  if (
    slotRole === "location" ||
    slotRole === "environment" ||
    slotRole === "architecture" ||
    slotRole === "mood_board"
  ) {
    return { section: "locations", scrollTarget: `slot-${slotRole}` };
  }
  return { section: "assets", scrollTarget: "world-reference-upload" };
}

const HIGHLIGHT_CLASS = "bible-nav-highlight";

function focusWithinSlot(slotEl: HTMLElement) {
  const fileInput = slotEl.querySelector<HTMLInputElement>('input[type="file"]');
  fileInput?.focus({ preventScroll: true });
}

function applyHighlight(el: HTMLElement) {
  el.classList.add(HIGHLIGHT_CLASS);
  window.setTimeout(() => el.classList.remove(HIGHLIGHT_CLASS), 2500);
}

export function executeWorldNavigation(
  target: WorldNavigationTarget,
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
