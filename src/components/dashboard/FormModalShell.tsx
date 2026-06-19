"use client";

import type { ReactNode } from "react";
import { ModalPortal } from "@/components/ModalPortal";
import {
  dsModalBackdrop,
  dsModalHeader,
  dsModalPanel,
} from "@/lib/design-system";

type FormModalShellProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: "md" | "lg";
};

export function FormModalShell({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = "lg",
}: FormModalShellProps) {
  const widthClass = maxWidth === "md" ? "max-w-md" : "max-w-lg";

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        <button
          type="button"
          aria-label="Close dialog"
          className={dsModalBackdrop}
          onClick={onClose}
        />
        <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
          <div
            className={`${dsModalPanel} w-full ${widthClass} sm:max-h-[calc(100dvh-3rem)]`}
          >
            <div className={dsModalHeader}>
              <div>
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-0.5 text-xs text-[var(--brand-text-muted)]">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5 text-[var(--brand-text-muted)] transition hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--foreground)]"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-5">{children}</div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
