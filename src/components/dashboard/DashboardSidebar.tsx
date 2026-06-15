"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { NewCharacterModal } from "@/app/dashboard/NewCharacterModal";
import { LogoutButton } from "@/components/LogoutButton";
import { CharIDLogo } from "@/components/brand/CharIDLogo";
import { DashboardNavItem } from "./DashboardNavItem";

type DashboardSidebarProps = {
  userEmail: string;
  onNavigate?: () => void;
  className?: string;
};

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function DashboardSidebar({
  userEmail,
  onNavigate,
  className = "",
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const isCharacters =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/characters/");

  return (
    <aside
      className={`flex h-full w-[260px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0c0c0e] ${className}`}
    >
      <div className="flex items-center gap-2.5 px-4 py-4">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 transition hover:opacity-90"
        >
          <CharIDLogo size="md" />
          <div>
            <p className="text-sm font-semibold leading-none tracking-tight text-zinc-100">
              CharID
            </p>
            <p className="mt-0.5 text-[10px] text-zinc-500">Character Studio</p>
          </div>
        </Link>
      </div>

      <div className="px-3 pb-2">
        <NewCharacterModal variant="sidebar" />
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2" aria-label="Main navigation">
        <DashboardNavItem
          href="/dashboard"
          label="Characters"
          active={isCharacters}
          onNavigate={onNavigate}
          icon={
            <NavIcon>
              <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm-4.25 8.25a5.25 5.25 0 1 1 10.5 0 .75.75 0 0 1-1.5 0 3.75 3.75 0 1 0-7.5 0 .75.75 0 0 1-1.5 0ZM15.75 12a4.5 4.5 0 0 0-4.5 4.5.75.75 0 0 1-1.5 0 6 6 0 1 1 12 0 .75.75 0 0 1-1.5 0 4.5 4.5 0 0 0-4.5-4.5Z" />
            </NavIcon>
          }
        />
        <DashboardNavItem
          href="/dashboard/portfolio"
          label="Portfolio"
          active={pathname === "/dashboard/portfolio"}
          onNavigate={onNavigate}
          icon={
            <NavIcon>
              <path
                fillRule="evenodd"
                d="M4 2a2 2 0 0 0-2 2v11a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V4a2 2 0 0 0-2-2H4Zm3 2h6v4H7V4Zm7 0h3v11a1.5 1.5 0 0 1-1.5 1.5H17V4h-3Zm-5 6H7v4h2V10Zm2 0h2v4h-2v-4Z"
                clipRule="evenodd"
              />
            </NavIcon>
          }
        />
        <DashboardNavItem
          href="/dashboard/explore"
          label="Explore"
          active={pathname === "/dashboard/explore"}
          onNavigate={onNavigate}
          icon={
            <NavIcon>
              <path
                fillRule="evenodd"
                d="M8.5 3.75a4.75 4.75 0 1 0 0 9.5 4.75 4.75 0 0 0 0-9.5ZM2.25 8.5a6.25 6.25 0 1 1 12.5 0 6.25 6.25 0 0 1-12.5 0Zm9.28 8.03a.75.75 0 0 1 1.06 0l2.5 2.5a.75.75 0 1 1-1.06 1.06l-2.5-2.5a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </NavIcon>
          }
        />
      </nav>

      <div className="mt-auto border-t border-white/[0.06] px-3 py-3">
        <p
          className="truncate px-2.5 pb-2 text-[11px] text-zinc-500"
          title={userEmail}
        >
          {userEmail}
        </p>
        <DashboardNavItem
          href="/dashboard/settings"
          label="Settings"
          active={pathname === "/dashboard/settings"}
          onNavigate={onNavigate}
          icon={
            <NavIcon>
              <path
                fillRule="evenodd"
                d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.212l-1.268 1.27a7.053 7.053 0 0 1 0 2.228l1.268 1.27a1 1 0 0 1 .205 1.212l-1.18 2.044a1 1 0 0 1-1.186.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.331 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.212l1.268-1.27a7.053 7.053 0 0 1 0-2.228L2.83 6.01a1 1 0 0 1-.205-1.212l1.18-2.044a1 1 0 0 1 1.186-.447l1.598.54A6.993 6.993 0 0 1 8.698 1.71l.331-1.652a1 1 0 0 1 .811-.804ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                clipRule="evenodd"
              />
            </NavIcon>
          }
        />
        <div className="mt-2 px-2.5">
          <LogoutButton variant="sidebar" />
        </div>
      </div>
    </aside>
  );
}
