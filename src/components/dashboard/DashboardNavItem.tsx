"use client";

import Link from "next/link";
import type { ReactNode } from "react";

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
    "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition";

  if (disabled) {
    return (
      <span
        className={`${baseClass} cursor-not-allowed text-zinc-600`}
        aria-disabled="true"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-zinc-600">
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
      className={`${baseClass} ${
        active
          ? "bg-white/[0.07] text-zinc-100 ring-1 ring-inset ring-white/[0.06]"
          : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center ${
          active ? "text-violet-400" : "text-zinc-500 group-hover:text-zinc-400"
        }`}
      >
        {icon}
      </span>
      {label}
      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" aria-hidden />
      )}
    </Link>
  );
}
