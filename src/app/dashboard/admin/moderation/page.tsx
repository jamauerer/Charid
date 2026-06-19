import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { getModerationQueueData } from "@/app/actions/moderation-admin";
import { sanitizeFounderError } from "@/lib/founder-messages";
import { ModerationQueue } from "@/components/admin/ModerationQueue";

export default async function AdminModerationPage() {
  const { data, error } = await getModerationQueueData("all");

  return (
    <div className="space-y-4">
      <AdminBackLink />
      <ModerationQueue
        items={data?.items ?? []}
        summary={
          data?.summary ?? {
            pendingCount: 0,
            escalatedCount: 0,
            pendingImages: 0,
            pendingText: 0,
            flagged7d: 0,
          }
        }
        error={sanitizeFounderError(error)}
      />
    </div>
  );
}
