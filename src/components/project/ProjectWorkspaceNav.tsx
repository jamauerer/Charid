"use client";

import { PROJECT_WORKSPACE_SECTIONS } from "@/lib/project-tabs";

type ProjectWorkspaceNavProps = {
  activeSection?: string | null;
};

export function ProjectWorkspaceNav({ activeSection }: ProjectWorkspaceNavProps) {
  return (
    <nav
      aria-label="Project sections"
      className="sticky top-0 z-10 -mx-1 mb-8 overflow-x-auto border-b border-[var(--brand-border)] bg-[var(--brand-bg)]/95 px-1 pb-px backdrop-blur-sm [-ms-overflow-style:none] [scrollbar-width:thin]"
    >
      <ul className="flex min-w-min gap-1 py-2">
        {PROJECT_WORKSPACE_SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <li key={section.id}>
              <a
                href={`#${section.sectionId}`}
                className={`inline-flex shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-[var(--brand-surface-elevated)] text-[var(--foreground)]"
                    : "text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface)] hover:text-[var(--foreground)]"
                }`}
              >
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
