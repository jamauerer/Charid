"use client";

import { THEMES, type ThemeId } from "@/lib/theme";
import { useTheme } from "@/components/theme/ThemeProvider";
import { studioPanel } from "@/lib/visual-identity";

function ThemeOption({
  id,
  label,
  description,
  selected,
  onSelect,
}: {
  id: ThemeId;
  label: string;
  description: string;
  selected: boolean;
  onSelect: (id: ThemeId) => void;
}) {
  const preview =
    id === "sunset-light" ? "bg-[#fafafa]" : "bg-[#0a0a0a]";

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition ${
        selected
          ? "border-[var(--brand-ui-accent)]/40 ring-1 ring-[var(--brand-ui-accent)]/20"
          : "border-[var(--brand-border)] bg-[var(--brand-surface)] hover:border-[var(--brand-ui-accent)]/25"
      }`}
    >
      <span
        className={`h-10 w-14 shrink-0 rounded border border-[var(--brand-border)] ${preview}`}
        aria-hidden
      />
      <span>
        <span className="block text-sm font-medium text-[var(--foreground)]">
          {label}
        </span>
        <span className="mt-0.5 block text-xs text-[var(--brand-text-secondary)]">
          {description}
        </span>
      </span>
    </button>
  );
}

export function SettingsAppearancePanel() {
  const { theme, setTheme } = useTheme();

  return (
    <section className={studioPanel}>
      <h2 className="text-sm font-medium text-[var(--foreground)]">
        Appearance
      </h2>
      <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
        Light or dark. Saved on this device.
      </p>
      <div className="mt-3 space-y-2">
        {THEMES.map((t) => (
          <ThemeOption
            key={t.id}
            id={t.id}
            label={t.label}
            description={t.description}
            selected={theme === t.id}
            onSelect={setTheme}
          />
        ))}
      </div>
    </section>
  );
}
