"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CharacterBibleViewBundle } from "@/app/actions/character-bible";
import { CharacterBibleMetricsHeader } from "@/components/character-bible/CharacterBibleMetricsHeader";
import { CharacterBibleRecommendations } from "@/components/character-bible/CharacterBibleRecommendations";
import { ReferenceGraphInspector } from "@/components/character-bible/ReferenceGraphInspector";
import { BibleSectionNav } from "@/components/character-bible/BibleSectionNav";
import { IdentitySectionForm } from "@/components/character-bible/IdentitySectionForm";
import { ReferenceSection } from "@/components/character-bible/ReferenceSection";
import { TurnaroundSection } from "@/components/character-bible/TurnaroundSection";
import { ExpressionsSection } from "@/components/character-bible/ExpressionsSection";
import { DetailsSectionForm } from "@/components/character-bible/DetailsSectionForm";
import { CharacterStoriesSection } from "@/components/CharacterStoriesSection";
import { IDENTITY_ARCHETYPE_LABELS } from "@/types/identity-archetype";
import {
  executeBibleNavigation,
  type BibleNavigationTarget,
} from "@/lib/bible-navigation";
import type { BibleSectionId } from "@/lib/character-bible-recommendations";
import { CharacterBibleFeedback } from "@/components/character-bible/CharacterBibleFeedback";
import type { CreatorFeedback } from "@/types/creator-feedback";
import type { CharacterStoryEntry } from "@/app/actions/stories";

type CharacterBibleViewProps = {
  bundle: CharacterBibleViewBundle;
  storyEntries: CharacterStoryEntry[];
  latestFeedback?: CreatorFeedback | null;
  migrationError?: string;
};

export function CharacterBibleView({
  bundle,
  storyEntries,
  latestFeedback = null,
  migrationError,
}: CharacterBibleViewProps) {
  const [activeSection, setActiveSection] = useState<BibleSectionId>("identity");
  const [pendingNav, setPendingNav] = useState<BibleNavigationTarget | null>(null);
  const sectionPanelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { character, bible, images, slotAssignments, referenceGraph, scores, recommendations } =
    bundle;

  const archetypeLabel =
    IDENTITY_ARCHETYPE_LABELS[bible.identity_archetype] ??
    bible.identity_archetype;

  const navigateTo = useCallback((target: BibleNavigationTarget) => {
    setActiveSection(target.section);
    setPendingNav(target);
  }, []);

  useEffect(() => {
    if (!pendingNav || pendingNav.section !== activeSection) return;

    const timer = window.setTimeout(() => {
      executeBibleNavigation(pendingNav, sectionPanelRef.current);
      setPendingNav(null);
    }, 80);

    return () => window.clearTimeout(timer);
  }, [pendingNav, activeSection]);

  function handleSectionRefresh() {
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/dashboard/characters"
          className="inline-flex items-center gap-1 text-sm text-[var(--brand-text-secondary)] transition hover:text-[var(--brand-text-secondary)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
          Back to Characters
        </Link>
      </div>

      {migrationError && (
        <p className="rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]">
          {migrationError}
        </p>
      )}

      <CharacterBibleMetricsHeader
        scores={scores}
        characterName={character.name}
        archetypeLabel={archetypeLabel}
        creativeFormat={bible.creative_format}
      />

      <ReferenceGraphInspector
        graph={referenceGraph}
        scores={scores}
        onNavigate={navigateTo}
      />

      <CharacterBibleRecommendations
        recommendations={recommendations}
        onNavigate={navigateTo}
      />

      <BibleSectionNav active={activeSection} onChange={setActiveSection} />

      <div
        ref={sectionPanelRef}
        className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 sm:p-6"
      >
        {activeSection === "identity" && (
          <IdentitySectionForm character={character} bible={bible} />
        )}
        {activeSection === "reference" && (
          <ReferenceSection
            characterId={character.id}
            images={images}
            slotAssignments={slotAssignments}
            identityArchetype={bible.identity_archetype}
          />
        )}
        {activeSection === "turnaround" && (
          <TurnaroundSection
            characterId={character.id}
            images={images}
            slotAssignments={slotAssignments}
            identityArchetype={bible.identity_archetype}
            onUpdated={handleSectionRefresh}
          />
        )}
        {activeSection === "expressions" && (
          <ExpressionsSection
            characterId={character.id}
            images={images}
            slotAssignments={slotAssignments}
            identityArchetype={bible.identity_archetype}
            onUpdated={handleSectionRefresh}
          />
        )}
        {activeSection === "details" && (
          <DetailsSectionForm characterId={character.id} bible={bible} />
        )}
      </div>

      <CharacterBibleFeedback
        characterId={character.id}
        initialFeedback={latestFeedback}
      />

      <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 sm:p-6">
        <CharacterStoriesSection entries={storyEntries} embedded />
      </div>
    </div>
  );
}
