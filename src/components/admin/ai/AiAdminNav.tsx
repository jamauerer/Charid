"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; exact?: boolean };

const AI_NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Configuration",
    items: [
      { href: "/dashboard/admin/ai", label: "Overview", exact: true },
      { href: "/dashboard/admin/ai/providers", label: "Providers" },
      { href: "/dashboard/admin/ai/models", label: "Models" },
      { href: "/dashboard/admin/ai/prompts", label: "Prompt Templates" },
      { href: "/dashboard/admin/ai/intelligence", label: "Production Intelligence" },
      { href: "/dashboard/admin/ai/project-types", label: "Project Types" },
      { href: "/dashboard/admin/ai/features", label: "AI Features" },
      { href: "/dashboard/admin/ai/settings", label: "Settings" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/dashboard/admin/ai/jobs", label: "AI Jobs" },
      { href: "/dashboard/admin/ai/queue", label: "Queue" },
      { href: "/dashboard/admin/ai/completed", label: "Completed" },
      { href: "/dashboard/admin/ai/failed", label: "Failed" },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { href: "/dashboard/admin/ai/logs", label: "Logs" },
      { href: "/dashboard/admin/ai/usage", label: "Usage" },
      { href: "/dashboard/admin/ai/credits", label: "Credit Usage" },
      { href: "/dashboard/admin/ai/costs", label: "Cost Tracking" },
    ],
  },
];

export function AiAdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-4" aria-label="Production AI admin">
      {AI_NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
            {section.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "bg-[var(--brand-surface-elevated)] text-[var(--foreground)]"
                      : "text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
