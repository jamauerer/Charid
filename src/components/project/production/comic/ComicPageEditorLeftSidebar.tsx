"use client";

import type { ReactNode } from "react";
import { ComicStudioArtworkSlot } from "@/components/project/production/comic/ComicStudioArtworkSlot";
import { LIBRARY_PLACEHOLDER_SECTIONS } from "@/components/project/production/studio/production-studio-editor";
import {
  PAGE_LAYOUT_TEMPLATES,
  type PageLayoutTemplateId,
} from "@/lib/canvas/page-layout-templates";
import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";
import { PANEL_BORDER_OPTIONS } from "@/lib/canvas/panel-border-style";

type ComicPageEditorLeftSidebarProps = {
  activeTemplateId: PageLayoutTemplateId | null;
  panelBorderStyle: PanelBorderStyle;
  pending: boolean;
  onApplyTemplate: (templateId: PageLayoutTemplateId) => void;
  onBorderStyleChange: (style: PanelBorderStyle) => void;
  onAddPanel: () => void;
};

export function ComicPageEditorLeftSidebar({
  activeTemplateId,
  panelBorderStyle,
  pending,
  onApplyTemplate,
  onBorderStyleChange,
  onAddPanel,
}: ComicPageEditorLeftSidebarProps) {
  return (
    <aside className="production-editor-sidebar production-editor-sidebar-left">
      <SidebarSection title="Layout">
        <select
          value={activeTemplateId ?? ""}
          onChange={(event) => {
            const value = event.target.value as PageLayoutTemplateId;
            if (value) onApplyTemplate(value);
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

      <SidebarSection title="Art Style" soon>
        <p className="text-xs text-[var(--brand-text-muted)]">
          Set your book&apos;s visual style — coming soon.
        </p>
      </SidebarSection>

      <SidebarSection title="Generation" soon>
        <PlaceholderAction label="Generate page" />
      </SidebarSection>

      <SidebarSection title="Upload" soon>
        <PlaceholderAction label="Upload image" />
      </SidebarSection>

      <SidebarSection title="Page Settings">
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
          <span className="ml-1.5 text-[9px] font-normal uppercase text-[var(--brand-text-muted)]">
            Soon
          </span>
        </summary>
        <ul className="mt-2 space-y-1">
          {LIBRARY_PLACEHOLDER_SECTIONS.map((section) => (
            <li key={section}>
              <span className="text-xs text-[var(--brand-text-muted)]">{section}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[10px] text-[var(--brand-text-muted)]">
          Drag references onto the page — coming soon.
        </p>
      </details>
    </aside>
  );
}

function SidebarSection({
  title,
  children,
  soon,
}: {
  title: string;
  children: ReactNode;
  soon?: boolean;
}) {
  return (
    <section className="production-editor-sidebar-section">
      <h2 className="production-editor-sidebar-heading">
        {title}
        {soon && (
          <span className="ml-1.5 text-[9px] font-normal uppercase text-[var(--brand-text-muted)]">
            Soon
          </span>
        )}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function PlaceholderAction({ label }: { label: string }) {
  return (
    <button type="button" disabled className="production-editor-sidebar-action" title="Coming soon">
      {label}
      <span className="text-[9px] uppercase text-[var(--brand-text-muted)]">Soon</span>
    </button>
  );
}

export { ComicStudioArtworkSlot };
