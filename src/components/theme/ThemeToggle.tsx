"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { ThemeId } from "@/lib/theme";

const OPTIONS: { id: ThemeId; label: string }[] = [
  { id: "sunset-light", label: "Light" },
  { id: "sunset-dark", label: "Dark" },
];

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`flex rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-0.5 ${className}`}
      role="group"
      aria-label="Theme"
    >
      {OPTIONS.map(({ id, label }) => {
        const selected = theme === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            aria-pressed={selected}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
              selected
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-foreground)]"
                : "text-[var(--brand-text-secondary)] hover:text-[var(--foreground)]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
