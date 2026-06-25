"use client";

import Link from "next/link";
import { ProductionEditorReadingBar } from "@/components/project/production/ProductionEditorReadingBar";
import { ComicPageEditorZoomMenu } from "@/components/project/production/comic/ComicPageEditorZoomMenu";
import type { LayoutCanvasZoomState } from "@/components/project/production/canvas/useLayoutCanvasZoom";
import type { StudioEditorMode } from "@/components/project/production/studio/production-studio-editor";
import {
  comicPageStudioPath,
  comicPageWorkspacePath,
  projectProductionPath,
} from "@/lib/production-routes";

type ComicPageEditorToolbarProps = {
  projectId: string;
  projectTitle: string;
  pageId: string;
  pageName: string;
  issueName: string;
  saveLabel: string;
  editorMode: StudioEditorMode;
  zoom: LayoutCanvasZoomState;
  reading: {
    currentIndex: number;
    total: number;
    prevHref: string | null;
    nextHref: string | null;
    jumpOptions: { id: string; label: string; href: string }[];
  };
};

export function ComicPageEditorToolbar({
  projectId,
  projectTitle,
  pageId,
  pageName,
  issueName,
  saveLabel,
  editorMode,
  zoom,
  reading,
}: ComicPageEditorToolbarProps) {
  const isFullStudio = editorMode === "full";
  const toggleHref = isFullStudio
    ? comicPageWorkspacePath(projectId, pageId)
    : comicPageStudioPath(projectId, pageId);
  const toggleLabel = isFullStudio ? "Exit full studio" : "Full studio";

  return (
    <header className="production-page-editor-toolbar">
      <div className="production-page-editor-toolbar-zone production-page-editor-toolbar-left">
        <Link
          href={projectProductionPath(projectId)}
          className="production-page-editor-back"
          title="All pages"
        >
          ← Pages
        </Link>
        <span className="production-page-editor-divider" aria-hidden>
          |
        </span>
        {isFullStudio && (
          <>
            <span className="production-page-editor-project" title={projectTitle}>
              {projectTitle}
            </span>
            <span className="production-page-editor-divider" aria-hidden>
              |
            </span>
          </>
        )}
        <h1 className="production-page-editor-title">{pageName}</h1>
        <span className="production-page-editor-issue">{issueName}</span>
      </div>

      <div className="production-page-editor-toolbar-zone production-page-editor-toolbar-center">
        <ProductionEditorReadingBar
          currentIndex={reading.currentIndex}
          total={reading.total}
          prevHref={reading.prevHref}
          nextHref={reading.nextHref}
          jumpOptions={reading.jumpOptions}
        />
      </div>

      <div className="production-page-editor-toolbar-zone production-page-editor-toolbar-right">
        {saveLabel && (
          <span
            className={`production-page-editor-save ${saveLabel === "Save failed" ? "production-page-editor-save-error" : ""}`}
            aria-live="polite"
          >
            {saveLabel}
          </span>
        )}
        <ComicPageEditorZoomMenu zoom={zoom} />
        <Link href={toggleHref} className="production-editor-toolbar-btn" title={toggleLabel}>
          {toggleLabel}
        </Link>
      </div>
    </header>
  );
}
