"use client";

import type { ReactNode } from "react";

type CharIDEditorShellProps = {
  topbar: ReactNode;
  iconRail: ReactNode;
  sidebar: ReactNode;
  canvas: ReactNode;
  inspector: ReactNode;
  layoutPending?: boolean;
  notices?: ReactNode;
};

/** Grid shell — matches docs/charid_editor_layout.html `.shell` */
export function CharIDEditorShell({
  topbar,
  iconRail,
  sidebar,
  canvas,
  inspector,
  layoutPending = false,
  notices,
}: CharIDEditorShellProps) {
  return (
    <div className={`shell${layoutPending ? " shell-pending" : ""}`}>
      <header className="topbar">{topbar}</header>
      <nav className="iconrail" aria-label="Studio tools">
        {iconRail}
      </nav>
      <aside className="sidebar" aria-label="Studio tool panel">
        {sidebar}
      </aside>
      {canvas}
      <aside className="inspector">{inspector}</aside>
      {notices}
    </div>
  );
}
