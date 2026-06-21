"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ModalPortal } from "@/components/ModalPortal";
import { getProjects } from "@/app/actions/projects";
import { CharacterForm } from "@/app/dashboard/CharacterForm";
import { WorldForm } from "@/app/dashboard/WorldForm";
import { StoryForm } from "@/app/dashboard/StoryForm";
import { StartNewProjectWizard } from "@/components/project/StartNewProjectWizard";
import type { Story } from "@/types/story";
import type { ProjectWithCounts } from "@/types/project";
import {
  studioBtnPrimarySm,
  dsModalBackdrop,
  dsModalHeader,
  dsModalPanel,
  dsBtnPrimary,
  dsCardLink,
  dsAlertWarning,
  dsSectionLabel,
} from "@/lib/design-system";

type CreateModalProps = {
  variant?: "default" | "sidebar";
};

type QuickAddView =
  | "home"
  | "character"
  | "world"
  | "story-select-project"
  | "story";

function ModalShell({
  title,
  subtitle,
  onClose,
  onBack,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onBack?: () => void;
  children: ReactNode;
}) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        <button
          type="button"
          aria-label="Close dialog"
          className={dsModalBackdrop}
          onClick={onClose}
        />
        <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
          <div className={`${dsModalPanel} w-full max-w-lg sm:max-h-[calc(100dvh-3rem)]`}>
            <div className={dsModalHeader}>
              <div className="flex items-start gap-2">
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="-ml-1 rounded-md p-1.5 text-[var(--brand-text-muted)] transition hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--foreground)]"
                    aria-label="Back"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
                <div>
                  <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
                  {subtitle && (
                    <p className="mt-0.5 text-xs text-[var(--brand-text-muted)]">{subtitle}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5 text-[var(--brand-text-muted)] transition hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--foreground)]"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-5">{children}</div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

export function CreateModal({ variant = "default" }: CreateModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [view, setView] = useState<QuickAddView>("home");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectWithCounts[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const triggerClass =
    variant === "sidebar"
      ? `${studioBtnPrimarySm} w-full`
      : studioBtnPrimarySm;

  function resetAndClose() {
    setOpen(false);
    setWizardOpen(false);
    setView("home");
    setSelectedProjectId(null);
    setProjects([]);
    setProjectsError(null);
  }

  function handleOpen() {
    setView("home");
    setSelectedProjectId(null);
    setOpen(true);
  }

  function handleSuccess() {
    resetAndClose();
    router.refresh();
  }

  function handleStorySuccess(story: Story) {
    resetAndClose();
    router.push(
      `/dashboard/worlds/${story.world_id}/stories/${story.id}?welcome=1`
    );
  }

  useEffect(() => {
    if (!open || view !== "story-select-project") return;

    let cancelled = false;
    setProjectsLoading(true);
    setProjectsError(null);

    getProjects().then((result) => {
      if (cancelled) return;
      setProjectsLoading(false);
      if (result.error) {
        setProjectsError(result.error);
        setProjects([]);
        return;
      }
      const list = result.projects;
      setProjects(list);
    });

    return () => {
      cancelled = true;
    };
  }, [open, view]);

  return (
    <>
      <button type="button" onClick={handleOpen} className={triggerClass}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
        </svg>
        Create
      </button>

      <StartNewProjectWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onFinished={resetAndClose}
        showBackToQuickAdd={open}
        onBackToQuickAdd={() => {
          setWizardOpen(false);
          setView("home");
        }}
      />

      {open && view === "home" && !wizardOpen && (
        <ModalShell
          title="Create"
          subtitle="Start a new project or add to your studio"
          onClose={resetAndClose}
        >
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setWizardOpen(true);
              }}
              className={`w-full ${dsCardLink} border-[var(--brand-border)] px-4 py-4`}
            >
              <span className="block text-sm font-semibold text-[var(--foreground)]">
                Start New Project
              </span>
              <span className="mt-1 block text-xs text-[var(--brand-text-secondary)]">
                A container for everything needed to create a finished work.
              </span>
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--brand-border)]" />
              </div>
              <p className={`relative mx-auto w-fit bg-[var(--brand-surface)] px-2 ${dsSectionLabel}`}>
                Quick add
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(
                [
                  { id: "character" as const, label: "Character", desc: "New profile" },
                  { id: "world" as const, label: "Setting", desc: "New place" },
                  { id: "story" as const, label: "Story", desc: "Add to a project" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === "story") {
                      setView("story-select-project");
                    } else {
                      setView(item.id);
                    }
                  }}
                  className={`${dsCardLink} px-3 py-2.5 text-left`}
                >
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {item.label}
                  </span>
                  <p className="mt-0.5 text-[11px] text-[var(--brand-text-muted)]">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </ModalShell>
      )}

      {open && view === "character" && (
        <ModalShell
          title="New Character"
          subtitle="Adds to your default project if none selected"
          onClose={resetAndClose}
          onBack={() => setView("home")}
        >
          <CharacterForm onSuccess={handleSuccess} />
        </ModalShell>
      )}

      {open && view === "world" && (
        <ModalShell
          title="New Setting"
          subtitle="A place for characters and stories"
          onClose={resetAndClose}
          onBack={() => setView("home")}
        >
          <WorldForm onSuccess={handleSuccess} />
        </ModalShell>
      )}

      {open && view === "story-select-project" && (
        <ModalShell
          title="Choose a project"
          subtitle="Your story will live in this project"
          onClose={resetAndClose}
          onBack={() => setView("home")}
        >
          {projectsLoading ? (
            <p className="text-sm text-[var(--brand-text-muted)]">Loading projects…</p>
          ) : projectsError ? (
            <p className={dsAlertWarning}>{projectsError}</p>
          ) : projects.length === 0 ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-[var(--brand-text-secondary)]">
                Start a project before adding a story.
              </p>
              <button
                type="button"
                onClick={() => {
                  setWizardOpen(true);
                }}
                className={dsBtnPrimary}
              >
                Start New Project
              </button>
            </div>
          ) : (
            <ul className="space-y-2">
              {projects.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setView("story");
                    }}
                    className={`flex w-full items-center justify-between ${dsCardLink} px-3 py-3 text-left`}
                  >
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {project.title}
                    </span>
                    <span className="text-xs text-[var(--brand-text-muted)]">
                      {project.story_count}{" "}
                      {project.story_count === 1 ? "story" : "stories"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ModalShell>
      )}

      {open && view === "story" && selectedProjectId && (
        <ModalShell
          title="New Story"
          subtitle="Plan a story within this project"
          onClose={resetAndClose}
          onBack={() => setView("story-select-project")}
        >
          <StoryForm projectId={selectedProjectId} onSuccess={handleStorySuccess} />
        </ModalShell>
      )}
    </>
  );
}
