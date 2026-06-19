"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { dsNavActive, dsNavInactive, dsNavIndicator } from "@/lib/design-system";

type DashboardNavItemProps = {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onNavigate?: () => void;
};

export function DashboardNavItem({
  href,
  label,
  icon,
  active = false,
  disabled = false,
  onNavigate,
}: DashboardNavItemProps) {
  const baseClass =
    "relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition";

  if (disabled) {
    return (
      <span
        className={`${baseClass} cursor-not-allowed text-[var(--brand-text-muted)]`}
        aria-disabled="true"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center opacity-50">
          {icon}
        </span>
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`${baseClass} group ${
        active ? dsNavActive : dsNavInactive
      }`}
    >
      {active && <span className={dsNavIndicator} aria-hidden />}
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center ${
          active
            ? "text-[var(--foreground)]"
            : "text-[var(--brand-text-secondary)] group-hover:text-[var(--foreground)]"
        }`}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}
