"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SpreadLayoutState } from "@/app/actions/production/spread-layout";
import { ProductionPlaceholderSection } from "@/components/project/production/ProductionPlaceholderSection";
import { layoutRoleLabel } from "@/components/project/production/canvas/LayoutCanvasStage";
import type { ReadingZoneV1 } from "@/types/canvas/config-profile-v1";

const StorybookSpreadLayoutEditor = dynamic(
  () =>
    import("@/components/project/production/canvas/StorybookSpreadLayoutEditor").then(
      (module) => module.StorybookSpreadLayoutEditor
    ),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-[var(--brand-text-muted)]">Loading spread editor…</p>
    ),
  }
);

type StorybookSpreadLayoutWorkspaceProps = {
  projectId: string;
  spreadId: string;
  layout: SpreadLayoutState;
};

function SpreadRegionsList({
  zones,
  selectedZoneId,
  onSelectZone,
}: {
  zones: ReadingZoneV1[];
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
}) {
  if (zones.length === 0) {
    return (
      <p className="text-sm text-[var(--brand-text-muted)]">
        No regions on this spread yet. Choose a template above to get started.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {zones.map((zone, index) => (
        <li key={zone.id}>
          <button
            type="button"
            onClick={() => onSelectZone(zone.id)}
            className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
              selectedZoneId === zone.id
                ? "border-[var(--brand-accent)] bg-[var(--tag-primary-bg)] text-[var(--foreground)]"
                : "border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] text-[var(--foreground)] hover:border-[var(--brand-accent)]"
            }`}
          >
            {layoutRoleLabel(zone.role)}
            {zones.length > 1 ? ` ${index + 1}` : ""}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function StorybookSpreadLayoutWorkspace({
  projectId,
  spreadId,
  layout,
}: StorybookSpreadLayoutWorkspaceProps) {
  const router = useRouter();
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  function refreshLayout() {
    router.refresh();
  }

  return (
    <>
      <ProductionPlaceholderSection
        title="Spread layout"
        description="Design your spread by choosing a template and arranging illustration and text areas."
      >
        <StorybookSpreadLayoutEditor
          projectId={projectId}
          spreadId={spreadId}
          layout={layout}
          selectedZoneId={selectedZoneId}
          onSelectZone={setSelectedZoneId}
          onLayoutChange={refreshLayout}
        />
      </ProductionPlaceholderSection>

      <ProductionPlaceholderSection
        title="Regions"
        description="Select a region to highlight it on the spread."
      >
        <SpreadRegionsList
          zones={layout.zones}
          selectedZoneId={selectedZoneId}
          onSelectZone={setSelectedZoneId}
        />
      </ProductionPlaceholderSection>
    </>
  );
}
