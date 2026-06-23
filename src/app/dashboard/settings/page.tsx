import { SettingsView } from "./SettingsView";

type SettingsPageProps = {
  searchParams: Promise<{ billing?: string }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const billingNotice =
    params.billing === "success"
      ? "success"
      : params.billing === "canceled"
        ? "canceled"
        : null;

  return <SettingsView billingNotice={billingNotice} />;
}
