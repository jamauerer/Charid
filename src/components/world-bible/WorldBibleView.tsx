"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WorldBibleViewBundle } from "@/app/actions/world-bible";
import { WorldBibleMetricsHeader } from "@/components/world-bible/WorldBibleMetricsHeader";
import { WorldReferenceChecklist } from "@/components/world-bible/WorldReferenceChecklist";
import { WorldSectionNav } from "@/components/world-bible/WorldSectionNav";
import { WorldOverviewSectionForm } from "@/components/world-bible/WorldOverviewSectionForm";
import { WorldRulesSectionForm } from "@/components/world-bible/WorldRulesSectionForm";
import { WorldCulturesSectionForm } from "@/components/world-bible/WorldCulturesSectionForm";
import { WorldReferenceSection } from "@/components/world-bible/WorldReferenceSection";
import { WorldLocationSlotsSection } from "@/components/world-bible/WorldLocationSlotsSection";
import {
  executeWorldNavigation,
  type WorldNavigationTarget,
  type WorldSectionId,
} from "@/lib/world-bible-navigation";

type WorldBibleViewProps = {
  bundle: WorldBibleViewBundle;
  migrationError?: string;
};

export function WorldBibleView({ bundle, migrationError }: WorldBibleViewProps) {
  const [activeSection, setActiveSection] = useState<WorldSectionId>("overview");
  const [pendingNav, setPendingNav] = useState<WorldNavigationTarget | null>(
    null
  );
  const sectionPanelRef = useRef<HTMLDivElement>(null);
  const { world, bible, images, slotAssignments, referenceGraph, scores } =
    bundle;

  const navigateTo = useCallback((target: WorldNavigationTarget) => {
    setActiveSection(target.section);
    setPendingNav(target);
  }, []);

  useEffect(() => {
    if (!pendingNav || pendingNav.section !== activeSection) return;

    const timer = window.setTimeout(() => {
      executeWorldNavigation(pendingNav, sectionPanelRef.current);
      setPendingNav(null);
    }, 80);

    return () => window.clearTimeout(timer);
  }, [pendingNav, activeSection]);

  return (
    <div className="space-y-5">
      {migrationError && (
        <p className="rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]">
          {migrationError}
        </p>
      )}

      <WorldBibleMetricsHeader
        scores={scores}
        worldName={world.name}
        genre={bible.genre}
        tone={bible.tone}
      />

      <WorldReferenceChecklist
        graph={referenceGraph}
        scores={scores}
        onNavigate={navigateTo}
      />

      <WorldSectionNav active={activeSection} onChange={setActiveSection} />

      <div
        ref={sectionPanelRef}
        className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 sm:p-6"
      >
        {activeSection === "overview" && (
          <WorldOverviewSectionForm worldId={world.id} bible={bible} />
        )}
        {activeSection === "locations" && (
          <WorldLocationSlotsSection
            worldId={world.id}
            images={images}
            slotAssignments={slotAssignments}
          />
        )}
        {activeSection === "cultures" && (
          <WorldCulturesSectionForm worldId={world.id} bible={bible} />
        )}
        {activeSection === "rules" && (
          <WorldRulesSectionForm worldId={world.id} bible={bible} />
        )}
        {activeSection === "assets" && (
          <WorldReferenceSection
            worldId={world.id}
            images={images}
            slotAssignments={slotAssignments}
          />
        )}
      </div>
    </div>
  );
}
