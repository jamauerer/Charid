import { getDatabaseHealth } from "@/app/actions/database-health";
import { getFounderDashboardData } from "@/app/actions/founder-analytics";
import { sanitizeFounderError } from "@/lib/founder-messages";
import { FounderDashboard } from "@/components/admin/FounderDashboard";

export default async function AdminDashboardPage() {
  const [{ data, error }, { items: databaseHealth, error: databaseHealthError }] =
    await Promise.all([getFounderDashboardData(), getDatabaseHealth()]);

  return (
    <FounderDashboard
      data={data}
      databaseHealth={databaseHealth}
      databaseHealthError={sanitizeFounderError(databaseHealthError)}
      analyticsError={sanitizeFounderError(error)}
    />
  );
}
