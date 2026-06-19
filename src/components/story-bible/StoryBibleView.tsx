"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StoryBibleViewBundle } from "@/app/actions/story-bible";
import { StoryBibleMetricsHeader } from "@/components/story-bible/StoryBibleMetricsHeader";
import { StoryReferenceChecklist } from "@/components/story-bible/StoryReferenceChecklist";
import { StorySectionNav } from "@/components/story-bible/StorySectionNav";
import { StoryOverviewSectionForm } from "@/components/story-bible/StoryOverviewSectionForm";
import { StoryTimelineSectionForm } from "@/components/story-bible/StoryTimelineSectionForm";
import { StoryMajorEventsSectionForm } from "@/components/story-bible/StoryMajorEventsSectionForm";
import { StoryCharactersSection } from "@/components/story-bible/StoryCharactersSection";
import { StoryLocationsSectionForm } from "@/components/story-bible/StoryLocationsSectionForm";
import { StoryReferenceSection } from "@/components/story-bible/StoryReferenceSection";
import { StoryMetricsSection } from "@/components/story-bible/StoryMetricsSection";
import { StoryBibleRecommendations } from "@/components/story-bible/StoryBibleRecommendations";
import {
  executeStoryNavigation,
  type StoryNavigationTarget,
  type StorySectionId,
} from "@/lib/story-bible-navigation";

type StoryBibleViewProps = {
  bundle: StoryBibleViewBundle;
  migrationError?: string;
  variant?: "default" | "advanced";
};

export function StoryBibleView({
  bundle,
  migrationError,
  variant = "default",
}: StoryBibleViewProps) {
  const [activeSection, setActiveSection] = useState<StorySectionId>("overview");
  const [pendingNav, setPendingNav] = useState<StoryNavigationTarget | null>(
    null
  );
  const sectionPanelRef = useRef<HTMLDivElement>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const {
    story,
    bible,
    images,
    slotAssignments,
    referenceGraph,
    scores,
    recommendations,
  } = bundle;

  const navigateTo = useCallback((target: StoryNavigationTarget) => {
    setActiveSection(target.section);
    setPendingNav(target);
  }, []);

  useEffect(() => {
    if (!pendingNav || pendingNav.section !== activeSection) return;

    const timer = window.setTimeout(() => {
      if (pendingNav.section === "recommendations") {
        recommendationsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        executeStoryNavigation(pendingNav, sectionPanelRef.current);
      }
      setPendingNav(null);
    }, 80);

    return () => window.clearTimeout(timer);
  }, [pendingNav, activeSection]);

  const showPlanningChrome = variant === "default";

  return (
    <div className="space-y-5">
      {migrationError && (
        <p className="rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]">
          {migrationError}
        </p>
      )}

      {showPlanningChrome && (
        <>
          <StoryBibleMetricsHeader
            scores={scores}
            storyTitle={story.title}
            themes={bible.themes}
            tone={bible.tone}
          />

          <StoryReferenceChecklist
            graph={referenceGraph}
            scores={scores}
            onNavigate={navigateTo}
          />

          <div ref={recommendationsRef}>
            <StoryBibleRecommendations
              recommendations={recommendations}
              onNavigate={navigateTo}
            />
          </div>
        </>
      )}

      <StorySectionNav active={activeSection} onChange={setActiveSection} />

      <div
        ref={sectionPanelRef}
        className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 sm:p-6"
      >
        {activeSection === "overview" && (
          <StoryOverviewSectionForm storyId={story.id} bible={bible} />
        )}
        {activeSection === "timeline" && (
          <StoryTimelineSectionForm storyId={story.id} bible={bible} />
        )}
        {activeSection === "major_events" && (
          <StoryMajorEventsSectionForm storyId={story.id} bible={bible} />
        )}
        {activeSection === "characters" && (
          <StoryCharactersSection storyId={story.id} bible={bible} />
        )}
        {activeSection === "locations" && (
          <StoryLocationsSectionForm storyId={story.id} bible={bible} />
        )}
        {activeSection === "assets" && (
          <StoryReferenceSection
            storyId={story.id}
            images={images}
            slotAssignments={slotAssignments}
          />
        )}
        {activeSection === "metrics" && <StoryMetricsSection scores={scores} />}
        {activeSection === "recommendations" && (
          <StoryBibleRecommendations
            recommendations={recommendations}
            onNavigate={navigateTo}
          />
        )}
      </div>
    </div>
  );
}
