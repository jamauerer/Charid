"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ModalPortal } from "@/components/ModalPortal";
import { CharacterForm } from "@/app/dashboard/CharacterForm";
import { WorldForm } from "@/app/dashboard/WorldForm";
import { StoryForm } from "@/app/dashboard/StoryForm";
import { createProject, type ProjectActionState } from "@/app/actions/projects";
import type { Project } from "@/types/project";
import {
  PROJECT_START_PATH_LABELS,
  PROJECT_WORK_INTENT_LABELS,
  PROJECT_WORK_INTENTS,
  WORK_INTENT_DEFAULT_STORY_TYPE,
  WORK_INTENT_SUGGESTED_TITLES,
  type ProjectStartPath,
  type ProjectWorkIntent,
} from "@/types/project";
import type { Story } from "@/types/story";
import type { World } from "@/types/world";
import type { StoryProjectType } from "@/types/story";

type WizardStep = "intent" | "setup" | "follow-up";

type StartNewProjectWizardProps = {
  open: boolean;
  onClose: () => void;
  /** Called when wizard completes (project created + optional follow-up). */
  onFinished?: () => void;
  /** When true, show a back link to quick-add options (Create modal). */
  showBackToQuickAdd?: boolean;
  onBackToQuickAdd?: () => void;
};

function WizardShell({
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
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
          onClick={onClose}
        />
        <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
          <div className="relative z-10 flex w-full max-w-lg max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] shadow-lg sm:max-h-[calc(100dvh-3rem)]">
            <div className="shrink-0 flex items-center justify-between border-b border-[var(--brand-border)] px-5 py-4">
              <div className="flex items-start gap-2">
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="-ml-1 rounded-md p-1.5 text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--brand-text-secondary)]"
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
                  <h2 className="text-base font-semibold text-[var(--brand-text-secondary)]">{title}</h2>
                  {subtitle && (
                    <p className="mt-0.5 text-xs text-[var(--brand-text-secondary)]">{subtitle}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5 text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--brand-text-secondary)]"
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

const START_PATHS: ProjectStartPath[] = [
  "story",
  "character",
  "world",
  "artwork",
  "describe_idea",
];

export function StartNewProjectWizard({
  open,
  onClose,
  onFinished,
  showBackToQuickAdd,
  onBackToQuickAdd,
}: StartNewProjectWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("intent");
  const [workIntent, setWorkIntent] = useState<ProjectWorkIntent | null>(null);
  const [startPath, setStartPath] = useState<ProjectStartPath>("story");
  const [title, setTitle] = useState("");
  const [ideaDescription, setIdeaDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdProject, setCreatedProject] = useState<Project | null>(null);
  const [followUpWorldId, setFollowUpWorldId] = useState<string | null>(null);
  const [followUpMode, setFollowUpMode] = useState<
    "character" | "world" | "story" | "artwork" | null
  >(null);

  const suggestedTitle = useMemo(
    () => (workIntent ? WORK_INTENT_SUGGESTED_TITLES[workIntent] ?? "" : ""),
    [workIntent]
  );

  const defaultStoryType: StoryProjectType | undefined = workIntent
    ? WORK_INTENT_DEFAULT_STORY_TYPE[workIntent]
    : undefined;

  function resetWizard() {
    setStep("intent");
    setWorkIntent(null);
    setStartPath("story");
    setTitle("");
    setIdeaDescription("");
    setCreating(false);
    setCreateError(null);
    setCreatedProject(null);
    setFollowUpWorldId(null);
    setFollowUpMode(null);
  }

  function finishWizard() {
    resetWizard();
    (onFinished ?? onClose)();
  }

  function handleClose() {
    resetWizard();
    onClose();
  }

  useEffect(() => {
    if (!open) {
      resetWizard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleIntentSelect(intent: ProjectWorkIntent) {
    setWorkIntent(intent);
    setTitle(WORK_INTENT_SUGGESTED_TITLES[intent] ?? "");
    setStep("setup");
  }

  async function handleCreateProject() {
    if (!workIntent || !title.trim()) return;

    setCreating(true);
    setCreateError(null);

    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("work_intent", workIntent);
    if (startPath === "describe_idea" && ideaDescription.trim()) {
      formData.set("description", ideaDescription.trim());
    }

    const result: ProjectActionState = await createProject({}, formData);

    setCreating(false);

    if (result.error || !result.project) {
      setCreateError(result.error ?? "Failed to create project.");
      return;
    }

    setCreatedProject(result.project);

    if (startPath === "describe_idea") {
      finishWizard();
      router.push(`/dashboard/projects/${result.project.id}`);
      router.refresh();
      return;
    }

    if (startPath === "character") {
      setFollowUpMode("character");
      setStep("follow-up");
      return;
    }

    if (startPath === "world") {
      setFollowUpMode("world");
      setStep("follow-up");
      return;
    }

    if (startPath === "story" || startPath === "artwork") {
      setFollowUpMode(startPath === "artwork" ? "artwork" : "story");
      setStep("follow-up");
      return;
    }
  }

  function finishAndGoToProject(projectId?: string) {
    const id = projectId ?? createdProject?.id;
    finishWizard();
    if (id) {
      router.push(`/dashboard/projects/${id}`);
      router.refresh();
    }
  }

  function handleWorldCreated(world: World) {
    if (!createdProject) return;

    if (followUpMode === "artwork") {
      finishWizard();
      router.push(
        `/dashboard/worlds/${world.id}#world-moodboard`
      );
      router.refresh();
      return;
    }

    if (followUpMode === "story") {
      setFollowUpWorldId(world.id);
      return;
    }

    finishAndGoToProject(createdProject.id);
  }

  function handleStoryCreated(story: Story) {
    finishWizard();
    router.push(
      `/dashboard/worlds/${story.world_id}/stories/${story.id}?welcome=1`
    );
  }

  function handleCharacterCreated() {
    if (createdProject) {
      finishAndGoToProject(createdProject.id);
    }
  }

  if (!open) return null;

  if (step === "intent") {
    return (
      <WizardShell
        title="Start New Project"
        subtitle="A container for everything needed to create a finished work."
        onClose={handleClose}
        onBack={showBackToQuickAdd ? onBackToQuickAdd : undefined}
      >
        <p className="mb-4 text-sm text-[var(--brand-text-secondary)]">What are you creating?</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PROJECT_WORK_INTENTS.map((intent) => (
            <button
              key={intent}
              type="button"
              onClick={() => handleIntentSelect(intent)}
              className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-3 text-left transition hover:border-[var(--status-info-border)] hover:bg-[var(--brand-surface-elevated)]"
            >
              <span className="text-sm font-medium text-[var(--brand-text-secondary)]">
                {PROJECT_WORK_INTENT_LABELS[intent]}
              </span>
            </button>
          ))}
        </div>
      </WizardShell>
    );
  }

  if (step === "setup" && workIntent) {
    return (
      <WizardShell
        title="Start New Project"
        subtitle={`${PROJECT_WORK_INTENT_LABELS[workIntent]} — name your project and choose where to begin.`}
        onClose={handleClose}
        onBack={() => setStep("intent")}
      >
        <div className="space-y-5">
          <div>
            <label
              htmlFor="wizard-project-title"
              className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]"
            >
              Project name
            </label>
            <input
              id="wizard-project-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={suggestedTitle || "Children's Dragon Comic"}
              className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5 text-sm text-[var(--brand-text-secondary)] placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
            />
            <p className="mt-1.5 text-xs text-[var(--brand-text-secondary)]">
              Name the finished work — you can have many unrelated projects.
            </p>
          </div>

          <fieldset>
            <legend className="mb-2 text-xs font-medium text-[var(--brand-text-secondary)]">
              How would you like to start?
            </legend>
            <div className="space-y-2">
              {START_PATHS.map((path) => (
                <label
                  key={path}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition ${
                    startPath === path
                      ? "border-[var(--status-info-border)] bg-[var(--status-info-bg)]"
                      : "border-[var(--brand-border)] bg-[var(--brand-surface)] hover:border-white/12"
                  }`}
                >
                  <input
                    type="radio"
                    name="start_path"
                    value={path}
                    checked={startPath === path}
                    onChange={() => setStartPath(path)}
                    className="mt-0.5 accent-[var(--brand-accent)]"
                  />
                  <span>
                    <span className="block text-sm font-medium text-[var(--brand-text-secondary)]">
                      {PROJECT_START_PATH_LABELS[path]}
                    </span>
                    {path === "describe_idea" && (
                      <span className="mt-0.5 block text-xs text-[var(--brand-text-secondary)]">
                        Optional — capture your idea in your own words. AI
                        organization coming later.
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {startPath === "describe_idea" && (
            <div>
              <label
                htmlFor="wizard-idea-description"
                className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]"
              >
                Describe your idea (optional)
              </label>
              <textarea
                id="wizard-idea-description"
                rows={4}
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
                placeholder="A shy dragon who learns to fly by helping friends in a mountain village…"
                className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5 text-sm text-[var(--brand-text-secondary)] placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
              />
            </div>
          )}

          {createError && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
              {createError}
            </p>
          )}

          <button
            type="button"
            disabled={creating || !title.trim()}
            onClick={() => void handleCreateProject()}
            className="w-full rounded-lg bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-accent-foreground)] transition hover:bg-[var(--brand-accent)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Creating project…" : "Create project & continue"}
          </button>
        </div>
      </WizardShell>
    );
  }

  if (step === "follow-up" && createdProject && followUpMode) {
    const projectId = createdProject.id;

    if (followUpMode === "character") {
      return (
        <WizardShell
          title="Add your first character"
          subtitle={createdProject.title}
          onClose={handleClose}
        >
          <CharacterForm
            projectId={projectId}
            onCreated={handleCharacterCreated}
            onSuccess={handleCharacterCreated}
          />
        </WizardShell>
      );
    }

    if (followUpMode === "world") {
      return (
        <WizardShell
          title="Create your setting"
          subtitle={createdProject.title}
          onClose={handleClose}
        >
          <WorldForm
            projectId={projectId}
            onCreated={() => finishAndGoToProject(projectId)}
            onSuccess={() => finishAndGoToProject(projectId)}
          />
        </WizardShell>
      );
    }

    if (followUpMode === "artwork" || followUpMode === "story") {
      if (followUpMode === "story" && followUpWorldId) {
        return (
          <WizardShell
            title="Start your story"
            subtitle={createdProject.title}
            onClose={handleClose}
          >
            <StoryForm
              worldId={followUpWorldId}
              projectId={projectId}
              defaultProjectType={defaultStoryType}
              onSuccess={handleStoryCreated}
            />
          </WizardShell>
        );
      }

      if (followUpMode === "story" && workIntent !== "worldbuilding") {
        return (
          <WizardShell
            title="Start your story"
            subtitle={createdProject.title}
            onClose={handleClose}
          >
            <StoryForm
              projectId={projectId}
              defaultProjectType={defaultStoryType}
              onSuccess={handleStoryCreated}
            />
          </WizardShell>
        );
      }

      return (
        <WizardShell
          title={
            followUpMode === "artwork"
              ? "Add a setting for your artwork"
              : "Create your setting"
          }
          subtitle={createdProject.title}
          onClose={handleClose}
        >
          <WorldForm projectId={projectId} onCreated={handleWorldCreated} />
        </WizardShell>
      );
    }
  }

  return null;
}
