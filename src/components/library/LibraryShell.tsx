"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { PageHeader } from "@/components/studio/PageHeader";
import { dsInput } from "@/lib/design-system";
import { LIBRARY_SECTIONS, librarySearchPath } from "@/lib/library-routes";

type LibraryShellProps = {
  children: ReactNode;
};

export function LibraryShell({ children }: LibraryShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [globalQuery, setGlobalQuery] = useState("");

  function handleGlobalSearch(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = globalQuery.trim();
    if (!trimmed) return;
    router.push(librarySearchPath(trimmed));
  }

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <PageHeader
        title="Library"
        subtitle="Browse, understand, and reuse everything you've created. Open an item in its project to keep working."
      />

      <form onSubmit={handleGlobalSearch} className="mb-4">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-text-muted)]"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="search"
            value={globalQuery}
            onChange={(event) => setGlobalQuery(event.target.value)}
            placeholder="Search characters, stories, scenes, assets, projects…"
            className={`${dsInput} w-full py-2.5 pl-9`}
            aria-label="Search library"
          />
        </div>
      </form>

      <nav
        aria-label="Library sections"
        className="mb-6 overflow-x-auto border-b border-[var(--brand-border)] [-ms-overflow-style:none] [scrollbar-width:thin]"
      >
        <ul className="flex min-w-min gap-1 pb-px">
          {LIBRARY_SECTIONS.map((section) => {
            const active = pathname === section.href || pathname.startsWith(`${section.href}/`);
            return (
              <li key={section.id}>
                <Link
                  href={section.href}
                  className={`inline-flex shrink-0 rounded-t-lg px-3 py-2 text-xs font-medium transition ${
                    active
                      ? "border border-b-0 border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--foreground)]"
                      : "text-[var(--brand-text-secondary)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {section.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {children}
    </div>
  );
}
