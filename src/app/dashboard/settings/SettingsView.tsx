import { SettingsAppearancePanel } from "@/components/settings/SettingsAppearancePanel";

export function SettingsView() {
  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
          Studio preferences and appearance.
        </p>
      </div>
      <SettingsAppearancePanel />
    </div>
  );
}
