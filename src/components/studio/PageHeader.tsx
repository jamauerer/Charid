import type { ReactNode } from "react";
import { dsPageSubtitle, dsPageTitle } from "@/lib/design-system";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-[var(--brand-border)] pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className={dsPageTitle}>{title}</h1>
        {subtitle && <p className={dsPageSubtitle}>{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
