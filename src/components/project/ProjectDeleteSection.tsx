"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProject } from "@/app/actions/projects";
import { ConfirmDialog } from "@/components/studio/ConfirmDialog";

type ProjectDeleteSectionProps = {
  projectId: string;
  projectTitle: string;
};

export function ProjectDeleteSection({
  projectId,
  projectTitle,
}: ProjectDeleteSectionProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteProject(projectId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/dashboard/projects");
    });
  }

  return (
    <>
      <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--status-danger-text)]">
          Danger Zone
        </h3>
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
          Permanently delete this project. Stories and characters in the project
          will remain in your library but will no longer be grouped here.
        </p>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={pending}
          className="mt-3 inline-flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-1.5 text-sm font-medium text-[var(--status-danger-text)] transition hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-60"
        >
          {pending ? "Deleting…" : "Delete project"}
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete project"
        description={`Delete "${projectTitle}"? This cannot be undone.`}
        confirmLabel={pending ? "Deleting…" : "Delete project"}
        pending={pending}
        error={error}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!pending) {
            setConfirmOpen(false);
            setError(null);
          }
        }}
      />
    </>
  );
}
