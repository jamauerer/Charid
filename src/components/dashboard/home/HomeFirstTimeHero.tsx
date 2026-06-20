"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StartNewProjectWizard } from "@/components/project/StartNewProjectWizard";
import { studioBtnPrimary, studioSectionSub } from "@/lib/visual-identity";

export function HomeFirstTimeHero() {
  const router = useRouter();
  const [wizardOpen, setWizardOpen] = useState(false);

  function handleFinished() {
    setWizardOpen(false);
    router.refresh();
  }

  return (
    <>
      <StartNewProjectWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onFinished={handleFinished}
      />

      <section className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-6 sm:px-5">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
          A place where stories begin.
        </h1>
        <p className={`mt-2 max-w-lg ${studioSectionSub}`}>
          Start a project — your characters, settings, and stories will appear
          here as art.
        </p>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setWizardOpen(true)}
            className={studioBtnPrimary}
          >
            Begin your first project
          </button>
        </div>
      </section>
    </>
  );
}
