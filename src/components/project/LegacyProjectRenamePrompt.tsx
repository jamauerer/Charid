"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { renameProjectTitle, type RenameProjectState } from "@/app/actions/projects";
import type { ProjectWithCounts } from "@/types/project";
import { isLegacyDefaultProject } from "@/types/project";
import {
  dsAlertError,
  dsBtnPrimary,
  dsBtnSecondary,
  dsInput,
} from "@/lib/design-system";

type LegacyProjectRenamePromptProps = {
  projects: ProjectWithCounts[];
};

const initialState: RenameProjectState = {};

export function LegacyProjectRenamePrompt({
  projects,
}: LegacyProjectRenamePromptProps) {
  const router = useRouter();
  const legacy = projects.find((p) => isLegacyDefaultProject(p));
  const [dismissed, setDismissed] = useState(false);
  const [title, setTitle] = useState("");
  const [state, formAction, pending] = useActionState(
    renameProjectTitle,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
      setDismissed(true);
    }
  }, [state.success, router]);

  if (!legacy || dismissed) return null;

  return (
    <div className="mb-4 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-4">
      <p className="text-sm font-medium text-[var(--foreground)]">Name your project</p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--brand-text-secondary)]">
        Your existing work was grouped under a default project. What finished
        work is this? You can create separate projects anytime for unrelated
        comics, novels, scripts, and more.
      </p>
      <form action={formAction} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input type="hidden" name="project_id" value={legacy.id} />
        <input
          type="text"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Children's Dragon Comic"
          className={`min-w-0 flex-1 ${dsInput}`}
        />
        <div className="flex shrink-0 gap-2">
          <button
            type="submit"
            disabled={pending || !title.trim()}
            className={dsBtnPrimary}
          >
            {pending ? "Saving…" : "Save name"}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className={dsBtnSecondary}
          >
            Later
          </button>
        </div>
      </form>
      {state.error && <p className={`mt-2 text-xs ${dsAlertError}`}>{state.error}</p>}
    </div>
  );
}
