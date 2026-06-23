import { getBillingSummary } from "@/app/actions/billing";
import { SettingsAppearancePanel } from "@/components/settings/SettingsAppearancePanel";
import { SettingsBillingPanel } from "@/components/settings/SettingsBillingPanel";

type SettingsViewProps = {
  billingNotice?: "success" | "canceled" | null;
};

export async function SettingsView({ billingNotice = null }: SettingsViewProps) {
  const { summary, error } = await getBillingSummary();

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
          Studio preferences, billing, and appearance.
        </p>
      </div>
      <SettingsBillingPanel
        summary={summary}
        error={error}
        billingNotice={billingNotice}
      />
      <SettingsAppearancePanel />
    </div>
  );
}
