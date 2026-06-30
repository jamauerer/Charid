"use client";

import dynamic from "next/dynamic";
import type {
  ProjectCharacterEntry,
  ProjectSceneRollupEntry,
  ProjectStoryEntry,
} from "@/app/actions/projects";
import type { PageLayoutTemplateId } from "@/lib/canvas/page-layout-templates";
import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";
import type { PanelResizeMode } from "@/lib/canvas/panel-resize-mode";
import type { StudioEditorMode } from "@/components/project/production/studio/production-studio-editor";
import type { ComicPanel } from "@/types/production/comic";

const ComicPageEditorView = dynamic(
  () =>
    import("@/components/project/production/comic/ComicPageEditorView").then(
      (module) => module.ComicPageEditorView
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-[var(--brand-text-muted)]">
        Loading page editor…
      </div>
    ),
  }
);

export type ComicPageEditorShellProps = {
  projectId: string;
  projectTitle: string;
  pageId: string;
  pageName: string;
  issueName: string;
  statusLabel: string;
  panels: ComicPanel[];
  templateId: PageLayoutTemplateId | null;
  panelBorderStyle: PanelBorderStyle;
  panelResizeMode: PanelResizeMode;
  editorMode?: StudioEditorMode;
  reading: {
    currentIndex: number;
    total: number;
    prevHref: string | null;
    nextHref: string | null;
    jumpOptions: { id: string; label: string; href: string }[];
  };
  stories: ProjectStoryEntry[];
  sceneRollup: ProjectSceneRollupEntry[];
  characters: ProjectCharacterEntry[];
};

export function ComicPageEditorShell(props: ComicPageEditorShellProps) {
  return <ComicPageEditorView {...props} />;
}
