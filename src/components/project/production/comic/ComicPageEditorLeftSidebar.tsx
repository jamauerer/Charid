"use client";

import { useState, type ReactNode } from "react";
import { ConfirmDialog } from "@/components/studio/ConfirmDialog";
import {
  PAGE_LAYOUT_TEMPLATES,
  type PageLayoutTemplateId,
} from "@/lib/canvas/page-layout-templates";
import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";
import { PANEL_BORDER_OPTIONS } from "@/lib/canvas/panel-border-style";
import { PANEL_RESIZE_MODES, type PanelResizeMode } from "@/lib/canvas/panel-resize-mode";

type ComicPageEditorLeftSidebarProps = {
  activeTemplateId: PageLayoutTemplateId | null;
  panelBorderStyle: PanelBorderStyle;
  panelResizeMode: PanelResizeMode;
  pending: boolean;
  pageHasContent: boolean;
  onApplyTemplate: (templateId: PageLayoutTemplateId) => void;
  onBorderStyleChange: (style: PanelBorderStyle) => void;
  onResizeModeChange: (mode: PanelResizeMode) => void;
  onAddPanel: () => void;
};

export function ComicPageEditorLeftSidebar({
  activeTemplateId,
  panelBorderStyle,
  panelResizeMode,
  pending,
  pageHasContent,
  onApplyTemplate,
  onBorderStyleChange,
  onResizeModeChange,
  onAddPanel,
}: ComicPageEditorLeftSidebarProps) {
  const [pendingTemplate, setPendingTemplate] = useState<PageLayoutTemplateId | null>(null);

  function requestTemplate(templateId: PageLayoutTemplateId) {
    if (templateId === activeTemplateId) return;
    if (pageHasContent) {
      setPendingTemplate(templateId);
      return;
    }
    onApplyTemplate(templateId);
  }

  return (
    <>
      <aside className="production-editor-sidebar production-editor-sidebar-left">
        <SidebarSection title="Layout">
          <select
            value={activeTemplateId ?? ""}
            onChange={(event) => {
              const value = event.target.value as PageLayoutTemplateId;
              if (value) requestTemplate(value);
            }}
            disabled={pending}
            className="production-editor-select w-full"
          >
            <option value="" disabled>
              Choose template…
            </option>
            {PAGE_LAYOUT_TEMPLATES.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label}
              </option>
            ))}
          </select>
        </SidebarSection>

        <SidebarSection title="Panel mode">
          <select
            value={panelResizeMode}
            onChange={(event) => onResizeModeChange(event.target.value as PanelResizeMode)}
            disabled={pending}
            className="production-editor-select w-full"
          >
            {PANEL_RESIZE_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode === "linked"
                  ? "Linked — panels resize together"
                  : mode === "independent"
                    ? "Independent — panels move freely"
                    : "Freeform — overlap allowed"}
              </option>
            ))}
          </select>
        </SidebarSection>

        <SidebarSection title="Page settings">
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--brand-text-muted)]">
            Panel borders
          </label>
          <select
            value={panelBorderStyle}
            onChange={(event) => onBorderStyleChange(event.target.value as PanelBorderStyle)}
            disabled={pending}
            className="production-editor-select w-full"
          >
            {PANEL_BORDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onAddPanel}
            disabled={pending}
            className="production-editor-btn mt-2 w-full"
          >
            Add panel
          </button>
        </SidebarSection>

        <details className="production-editor-libraries">
          <summary className="production-editor-sidebar-heading cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden">
            Libraries
          </summary>
          <p className="mt-2 text-xs text-[var(--brand-text-muted)]">
            Drag characters, assets, and references into panels — available in a future milestone.
          </p>
        </details>

        <details className="production-editor-ai-reserved mt-auto">
          <summary className="production-editor-sidebar-heading cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden">
            AI tools
          </summary>
          <div className="production-ai-prompt-reserved mt-2 rounded border border-dashed border-[var(--brand-border)] px-2 py-2 text-[10px] text-[var(--brand-text-muted)]">
            Generation and rewrite panels reserved for Milestone 11.
          </div>
        </details>
      </aside>

      <ConfirmDialog
        open={pendingTemplate !== null}
        title="Change page layout?"
        description="Changing the page layout will remove existing panel content."
        confirmLabel="Continue"
        cancelLabel="Cancel"
        variant="default"
        pending={pending}
        onCancel={() => setPendingTemplate(null)}
        onConfirm={() => {
          if (pendingTemplate) {
            onApplyTemplate(pendingTemplate);
            setPendingTemplate(null);
          }
        }}
      />
    </>
  );
}

function SidebarSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="production-editor-sidebar-section">
      <h2 className="production-editor-sidebar-heading">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
