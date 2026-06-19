"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StartNewProjectWizard } from "@/components/project/StartNewProjectWizard";
import { studioBtnSecondary } from "@/lib/visual-identity";

export function HomeSecondaryActions() {
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

      <div className="flex flex-wrap gap-2 border-t border-[var(--brand-border)] pt-4">
        <button
          type="button"
          onClick={() => setWizardOpen(true)}
          className={studioBtnSecondary}
        >
          Create project
        </button>
        <Link href="/dashboard/portfolio" className={studioBtnSecondary}>
          Portfolio
        </Link>
      </div>
    </>
  );
}
