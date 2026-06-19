"use client";

import Link from "next/link";
import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";

type DashboardShellProps = {
  userEmail: string;
  isAdmin?: boolean;
  children: React.ReactNode;
};

export function DashboardShell({
  userEmail,
  isAdmin = false,
  children,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <div className="relative min-h-dvh bg-background font-sans text-[var(--foreground)]">
      <div className="relative flex min-h-dvh">
        <div className="hidden lg:block">
          <div className="fixed inset-y-0 left-0 z-30">
            <DashboardSidebar userEmail={userEmail} isAdmin={isAdmin} />
          </div>
        </div>

        {mobileOpen && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={closeMobile}
          />
        )}

        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <DashboardSidebar
            userEmail={userEmail}
            isAdmin={isAdmin}
            onNavigate={closeMobile}
          />
        </div>

        <div className="flex min-h-dvh flex-1 flex-col lg:pl-[260px]">
          <header className="sticky top-0 z-20 flex h-11 items-center gap-3 border-b border-[var(--brand-border)] bg-background/95 px-4 backdrop-blur-sm lg:hidden">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-1.5 text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface-elevated)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 5.5a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75ZM2.75 10a.75.75 0 0 0 0 1.5h14.5a.75.75 0 0 0 0-1.5H2.75Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              CharID
            </Link>
          </header>

          <main className="relative flex-1 px-4 pb-4 pt-12 sm:px-5 sm:pb-4 sm:pt-11 lg:pt-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
