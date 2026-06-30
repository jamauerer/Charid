"use client";

import { useState } from "react";
import {
  DEFAULT_STUDIO_DOCUMENT_SETTINGS,
  documentPresetsForProjectType,
  isCustomDocumentPreset,
  type DocumentDimensions,
  type DocumentProjectType,
  type DocumentUnit,
  type StudioDocumentSettings,
} from "@/lib/studio/document-settings";

type StudioDocumentSettingsPanelProps = {
  settings?: StudioDocumentSettings;
  onChange?: (settings: StudioDocumentSettings) => void;
  compact?: boolean;
};

const PROJECT_TYPES: { id: DocumentProjectType; label: string }[] = [
  { id: "graphic_novel", label: "Graphic Novel" },
  { id: "storybook", label: "Storybook" },
  { id: "film", label: "Film" },
  { id: "advertisement", label: "Advertisement" },
];

const UNITS: DocumentUnit[] = ["mm", "cm", "in"];

export function StudioDocumentSettingsPanel({
  settings = DEFAULT_STUDIO_DOCUMENT_SETTINGS,
  onChange,
  compact = false,
}: StudioDocumentSettingsPanelProps) {
  const presets = documentPresetsForProjectType(settings.projectType);
  const custom = isCustomDocumentPreset(settings.presetId);
  const dims = settings.customDimensions ?? presets.find((p) => p.id === settings.presetId)?.dimensions ?? presets[0].dimensions;

  function update(patch: Partial<StudioDocumentSettings>) {
    onChange?.({ ...settings, ...patch });
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <label className="block text-[10px] uppercase tracking-wide text-[var(--brand-text-muted)]">
        Project type
        <select
          value={settings.projectType}
          onChange={(e) => {
            const projectType = e.target.value as DocumentProjectType;
            const nextPresets = documentPresetsForProjectType(projectType);
            update({ projectType, presetId: nextPresets[0].id });
          }}
          className="production-editor-select mt-0.5 w-full"
        >
          {PROJECT_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[10px] uppercase tracking-wide text-[var(--brand-text-muted)]">
        Document preset
        <select
          value={settings.presetId}
          onChange={(e) => update({ presetId: e.target.value })}
          className="production-editor-select mt-0.5 w-full"
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      {custom && (
        <div className="grid grid-cols-3 gap-2">
          <DimensionField
            label="Width"
            value={dims.width}
            onChange={(width) =>
              update({ customDimensions: { ...dims, width } as DocumentDimensions })
            }
          />
          <DimensionField
            label="Height"
            value={dims.height}
            onChange={(height) =>
              update({ customDimensions: { ...dims, height } as DocumentDimensions })
            }
          />
          <label className="text-[10px] text-[var(--brand-text-muted)]">
            Units
            <select
              value={dims.unit}
              onChange={(e) =>
                update({
                  customDimensions: { ...dims, unit: e.target.value as DocumentUnit },
                })
              }
              className="production-editor-select mt-0.5 w-full"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      {!custom && (
        <p className="text-[10px] text-[var(--brand-text-muted)]">
          {dims.width} × {dims.height} {dims.unit}
        </p>
      )}
    </div>
  );
}

function DimensionField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="text-[10px] text-[var(--brand-text-muted)]">
      {label}
      <input
        type="number"
        min={1}
        step={0.1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="production-editor-input mt-0.5 w-full"
      />
    </label>
  );
}

export function StudioDocumentSettingsMenu({
  settings,
  onChange,
}: {
  settings?: StudioDocumentSettings;
  onChange?: (settings: StudioDocumentSettings) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        className="production-editor-toolbar-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Document
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Close document settings"
            onClick={() => setOpen(false)}
          />
          <div className="production-editor-zoom-menu charid-studio-doc-menu z-20 w-64 p-3">
            <p className="mb-2 text-xs font-medium text-[var(--foreground)]">Document Settings</p>
            <StudioDocumentSettingsPanel settings={settings} onChange={onChange} compact />
          </div>
        </>
      )}
    </div>
  );
}
