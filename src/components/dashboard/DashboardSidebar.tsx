"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CreateModal } from "@/components/dashboard/CreateModal";
import { LogoutButton } from "@/components/LogoutButton";
import { BrandLogoSlot } from "@/components/brand/BrandLogoSlot";
import { DashboardNavItem } from "./DashboardNavItem";

type DashboardSidebarProps = {
  userEmail: string;
  isAdmin?: boolean;
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
  isAdmin = false,
  onNavigate,
  className = "",
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const isHome = pathname === "/dashboard";
  const isProjects =
    pathname === "/dashboard/projects" ||
    pathname.startsWith("/dashboard/projects/");
  const isStories =
    pathname === "/dashboard/stories" ||
    pathname.startsWith("/dashboard/stories/");
  const isCharacters =
    pathname === "/dashboard/characters" ||
    pathname.startsWith("/dashboard/characters/");
  const isWorlds =
    pathname === "/dashboard/worlds" ||
    pathname.startsWith("/dashboard/worlds/");
  const isAdminSection = pathname.startsWith("/dashboard/admin");
  const isModerationSection = pathname.startsWith("/dashboard/admin/moderation");

  return (
    <aside
      className={`flex h-full w-[260px] shrink-0 flex-col border-r border-[var(--brand-border)] bg-[var(--brand-sidebar)] ${className}`}
    >
      <div className="flex items-center gap-2.5 px-4 py-4">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex flex-col gap-0.5 transition hover:opacity-90"
        >
          <BrandLogoSlot size="md" showWordmark />
          <p className="pl-10 text-[10px] text-[var(--brand-text-muted)]">
            Creative workspace
          </p>
        </Link>
      </div>

      <div className="px-3 pb-2">
        <CreateModal variant="sidebar" />
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2" aria-label="Main navigation">
        <DashboardNavItem
          href="/dashboard"
          label="Home"
          active={isHome}
          onNavigate={onNavigate}
          icon={
            <NavIcon>
              <path d="M10.707 2.293a1 1 0 0 0-1.414 0l-7 7A1 1 0 0 0 3 10v6a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-6a1 1 0 0 0-.293-.707l-7-7Z" />
            </NavIcon>
          }
        />
        <DashboardNavItem
          href="/dashboard/projects"
          label="Projects"
          active={isProjects}
          onNavigate={onNavigate}
          icon={
            <NavIcon>
              <path d="M2 4.25A2.25 2.25 0 0 1 4.25 2h3.027A2.25 2.25 0 0 1 9.25 3.5h1.5A2.25 2.25 0 0 1 13 5.75v9.5A2.25 2.25 0 0 1 10.75 17.5h-8.5A2.25 2.25 0 0 1 0 15.25V4.25Zm4.25-.75a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-9.5a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 1-.707-.473L9.22 4.72A.75.75 0 0 0 8.5 4.25H6.25Z" />
            </NavIcon>
          }
        />
        <DashboardNavItem
          href="/dashboard/stories"
          label="Stories"
          active={isStories}
          onNavigate={onNavigate}
          icon={
            <NavIcon>
              <path
                fillRule="evenodd"
                d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v11.75A2.75 2.75 0 0 0 16.75 18h-12A2.75 2.75 0 0 1 2 15.25V3.5Zm3.75 7a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Zm0 3a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5ZM3.5 9.75a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z"
                clipRule="evenodd"
              />
            </NavIcon>
          }
        />
        <DashboardNavItem
          href="/dashboard/characters"
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

        <div className="my-2 border-t border-[var(--brand-border)]" />
        <p className="px-2.5 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wide text-[var(--brand-text-muted)]">
          Library
        </p>
        <DashboardNavItem
          href="/dashboard/worlds"
          label="All settings"
          active={isWorlds}
          onNavigate={onNavigate}
          icon={
            <NavIcon>
              <path
                fillRule="evenodd"
                d="M4.25 5.5a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 .75.75v9a.75.75 0 0 1-.75.75H5a.75.75 0 0 1-.75-.75v-9Zm1.5.75v7.5h9v-7.5h-9Z"
                clipRule="evenodd"
              />
              <path d="M8 8.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5A.75.75 0 0 1 8 8.25ZM8 11a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 8 11Z" />
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
        {isAdmin && (
          <>
            <DashboardNavItem
              href="/dashboard/admin"
              label="Admin"
              active={isAdminSection && !isModerationSection}
              onNavigate={onNavigate}
              icon={
                <NavIcon>
                  <path
                    fillRule="evenodd"
                    d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                    clipRule="evenodd"
                  />
                </NavIcon>
              }
            />
            <DashboardNavItem
              href="/dashboard/admin/moderation"
              label="Moderation"
              active={isModerationSection}
              onNavigate={onNavigate}
              icon={
                <NavIcon>
                  <path
                    fillRule="evenodd"
                    d="M10 1a5.002 5.002 0 0 0-4.899 4.096.5.5 0 0 0 .353.604l.353.07V11.5a.5.5 0 0 0 .146.354l4 4a.5.5 0 0 0 .708-.708L6.707 11.793 10.293 8.207a1 1 0 0 0 .293-.707V6.57l.353-.07a.5.5 0 0 0 .354-.604A5.002 5.002 0 0 0 10 1Zm0 2a3 3 0 0 1 2.83 2H7.17A3 3 0 0 1 10 3Z"
                    clipRule="evenodd"
                  />
                </NavIcon>
              }
            />
          </>
        )}
      </nav>

      <div className="mt-auto border-t border-[var(--brand-border)] px-3 py-3">
        <p
          className="truncate px-2.5 pb-2 text-[11px] text-[var(--brand-text-muted)]"
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
