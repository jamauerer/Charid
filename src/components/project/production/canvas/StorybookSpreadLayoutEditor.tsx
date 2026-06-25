"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Rect } from "react-konva";
import {
  addStorybookSpreadRegion,
  applyStorybookSpreadTemplate,
  deleteStorybookSpreadRegion,
  saveStorybookSpreadLayout,
  type SpreadLayoutState,
} from "@/app/actions/production/spread-layout";
import {
  LayoutCanvasStage,
  layoutRoleFill,
  layoutRoleLabel,
  layoutRoleStroke,
} from "@/components/project/production/canvas/LayoutCanvasStage";
import { LayoutRectShape } from "@/components/project/production/canvas/LayoutRectShape";
import { useLayoutEditorKeyboard } from "@/components/project/production/canvas/useLayoutEditorKeyboard";
import {
  SPREAD_HEIGHT,
  SPREAD_LAYOUT_TEMPLATES,
  SPREAD_WIDTH,
  type SpreadLayoutTemplateId,
} from "@/lib/canvas/spread-layout-templates";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";
import { studioBtnPrimarySm } from "@/lib/visual-identity";
import type { ReadingZoneV1 } from "@/types/canvas/config-profile-v1";

type StorybookSpreadLayoutEditorProps = {
  projectId: string;
  spreadId: string;
  layout: SpreadLayoutState;
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string | null) => void;
  onLayoutChange: () => void;
};

export function StorybookSpreadLayoutEditor({
  projectId,
  spreadId,
  layout,
  selectedZoneId,
  onSelectZone,
  onLayoutChange,
}: StorybookSpreadLayoutEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [zones, setZones] = useState<ReadingZoneV1[]>(layout.zones);
  const [activeTemplateId, setActiveTemplateId] = useState<SpreadLayoutTemplateId | null>(
    layout.templateId
  );
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setZones(layout.zones);
    setActiveTemplateId(layout.templateId);
  }, [layout]);

  const persistLayout = useDebouncedCallback(
    useCallback(
      async (nextZones: ReadingZoneV1[], nextTemplateId: SpreadLayoutTemplateId | null) => {
        setSaveState("saving");
        const result = await saveStorybookSpreadLayout(
          projectId,
          spreadId,
          nextZones,
          nextTemplateId
        );
        if (result.error) {
          setSaveState("error");
          setError(result.error);
          return;
        }
        setSaveState("saved");
        setError(null);
      },
      [projectId, spreadId]
    ),
    600
  );

  function updateZoneFrame(
    zoneId: string,
    frame: Pick<ReadingZoneV1, "x" | "y" | "width" | "height">
  ) {
    setActiveTemplateId(null);
    setZones((current) => {
      const next = current.map((zone) =>
        zone.id === zoneId ? { ...zone, ...frame } : zone
      );
      persistLayout(next, null);
      return next;
    });
  }

  function applyTemplate(templateId: SpreadLayoutTemplateId) {
    startTransition(async () => {
      setError(null);
      const result = await applyStorybookSpreadTemplate(projectId, spreadId, templateId);
      if (result.error || !result.data) {
        setError(result.error ?? "Failed to apply template.");
        return;
      }
      setZones(result.data.zones);
      setActiveTemplateId(templateId);
      onSelectZone(result.data.zones[0]?.id ?? null);
      onLayoutChange();
    });
  }

  function handleAddRegion(role: ReadingZoneV1["role"]) {
    startTransition(async () => {
      setError(null);
      const result = await addStorybookSpreadRegion(projectId, spreadId, role);
      if (result.error) {
        setError(result.error);
        return;
      }
      setZones(result.zones);
      setActiveTemplateId(null);
      onSelectZone(result.zones.at(-1)?.id ?? null);
      onLayoutChange();
    });
  }

  function handleDeleteRegion() {
    if (!selectedZoneId) return;
    startTransition(async () => {
      setError(null);
      const result = await deleteStorybookSpreadRegion(projectId, spreadId, selectedZoneId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setZones(result.zones);
      setActiveTemplateId(null);
      onSelectZone(null);
      onLayoutChange();
    });
  }

  useLayoutEditorKeyboard({
    containerRef: editorRef,
    onEscape: () => onSelectZone(null),
    onDelete: handleDeleteRegion,
  });

  const canvasItems = useMemo(
    () =>
      zones.map((zone, index) => ({
        id: zone.id,
        label: layoutRoleLabel(zone.role) + (zones.length > 1 ? ` ${index + 1}` : ""),
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
        fill: layoutRoleFill(zone.role),
        stroke: layoutRoleStroke(zone.role),
      })),
    [zones]
  );

  return (
    <div ref={editorRef} className={`space-y-3 ${pending ? "opacity-80" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-medium text-[var(--brand-text-secondary)]">
          Spread template
        </label>
        <select
          value={activeTemplateId ?? ""}
          onChange={(event) => {
            const value = event.target.value as SpreadLayoutTemplateId;
            if (value) applyTemplate(value);
          }}
          disabled={pending}
          className="production-editor-select"
        >
          <option value="" disabled>
            Choose a template…
          </option>
          {SPREAD_LAYOUT_TEMPLATES.map((template) => (
            <option key={template.id} value={template.id}>
              {template.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => handleAddRegion("illustration")}
          disabled={pending}
          className="production-editor-btn"
        >
          Add illustration area
        </button>
        <button
          type="button"
          onClick={() => handleAddRegion("text")}
          disabled={pending}
          className="production-editor-btn"
        >
          Add text area
        </button>
        <button
          type="button"
          onClick={handleDeleteRegion}
          disabled={pending || !selectedZoneId}
          className="production-editor-btn production-editor-btn-danger"
        >
          Delete selected
        </button>
        <span className="ml-auto text-xs text-[var(--brand-text-muted)]">
          {saveState === "saving" && "Saving…"}
          {saveState === "saved" && "Saved"}
          {saveState === "error" && "Save failed"}
        </span>
      </div>

      {error && (
        <p className="rounded-lg border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {error}
        </p>
      )}

      <LayoutCanvasStage
        width={SPREAD_WIDTH}
        height={SPREAD_HEIGHT}
        onBackgroundClick={() => onSelectZone(null)}
      >
        <Rect
          x={0}
          y={0}
          width={SPREAD_WIDTH}
          height={SPREAD_HEIGHT}
          fill="#fffef8"
          stroke="#e2e8f0"
          strokeWidth={1}
          listening={false}
          perfectDrawEnabled={false}
        />
        {canvasItems.map((item) => (
          <LayoutRectShape
            key={item.id}
            item={item}
            selected={selectedZoneId === item.id}
            onSelect={() => onSelectZone(item.id)}
            onChange={(frame) => updateZoneFrame(item.id, frame)}
          />
        ))}
      </LayoutCanvasStage>

      {zones.length === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--brand-border)] px-4 py-6 text-center">
          <p className="text-sm text-[var(--brand-text-muted)]">
            Choose a spread template or add regions to start laying out this spread.
          </p>
          <button
            type="button"
            onClick={() => applyTemplate("full-illustration")}
            disabled={pending}
            className={`mt-3 ${studioBtnPrimarySm}`}
          >
            Start with full illustration
          </button>
        </div>
      )}

      <p className="text-xs text-[var(--brand-text-muted)]">
        Drag regions to move them. Use handles to resize. Delete or Escape to deselect.
        Changes save automatically.
      </p>
    </div>
  );
}
