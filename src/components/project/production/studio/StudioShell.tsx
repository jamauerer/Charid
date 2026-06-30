"use client";

import type { ReactNode } from "react";

type StudioShellProps = {
  toolbar: ReactNode;
  toolbox: ReactNode;
  sidebar: ReactNode;
  canvas: ReactNode;
  inspector: ReactNode;
  layoutPending?: boolean;
  notices?: ReactNode;
};

/**
 * CharID Editor shell — matches docs/charid_editor_layout.html grid.
 * Topbar spans all columns; row 2: rail · sidebar · canvas · inspector.
 */
export function StudioShell({
  toolbar,
  toolbox,
  sidebar,
  canvas,
  inspector,
  layoutPending = false,
  notices,
}: StudioShellProps) {
  return (
    <div
      className={[
        "charid-editor-shell",
        layoutPending ? "charid-editor-shell-pending" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="charid-editor-topbar">{toolbar}</div>
      <nav className="charid-editor-rail" aria-label="Studio tools">
        {toolbox}
      </nav>
      <aside className="charid-editor-sidebar" aria-label="Studio tool panel">
        {sidebar}
      </aside>
      {canvas}
      <aside className="charid-editor-inspector">{inspector}</aside>
      {notices}
    </div>
  );
}
