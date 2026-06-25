import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/studio/PageHeader";
import { projectProductionPath } from "@/lib/production-routes";

type ProductionWorkspaceFrameProps = {
  projectId: string;
  title: string;
  subtitle?: string;
  backLabel?: string;
  children: ReactNode;
};

export function ProductionWorkspaceFrame({
  projectId,
  title,
  subtitle,
  backLabel = "Back to production",
  children,
}: ProductionWorkspaceFrameProps) {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8">
      <Link
        href={projectProductionPath(projectId)}
        className="mb-4 inline-flex text-sm text-[var(--brand-text-secondary)] transition hover:text-[var(--foreground)]"
      >
        ← {backLabel}
      </Link>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="space-y-5">{children}</div>
    </div>
  );
}
