"use client";

import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";

type DashboardShellProps = {
  userEmail: string;
  children: React.ReactNode;
};

export function DashboardShell({ userEmail, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <div className="relative min-h-dvh bg-background font-sans text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(120,119,198,0.08),transparent)]" />

      <div className="relative flex min-h-dvh">
        <div className="hidden lg:block">
          <div className="fixed inset-y-0 left-0 z-30">
            <DashboardSidebar userEmail={userEmail} />
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
          <DashboardSidebar userEmail={userEmail} onNavigate={closeMobile} />
        </div>

        <div className="flex min-h-dvh flex-1 flex-col lg:pl-[260px]">
          <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-white/[0.06] bg-background/90 px-4 backdrop-blur-xl lg:hidden">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
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
            <span className="text-sm font-semibold text-zinc-200">CharID</span>
          </header>

          <main className="relative flex-1 px-4 pb-4 pt-14 sm:px-6 sm:pb-5 sm:pt-[4.5rem] lg:pt-20">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
