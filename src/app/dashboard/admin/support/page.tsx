import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { getSupportInboxData } from "@/app/actions/support-admin";
import { SupportInbox } from "@/components/admin/SupportInbox";

export default async function AdminSupportPage() {
  const { data, error } = await getSupportInboxData();

  return (
    <div className="space-y-4">
      <AdminBackLink />
      <SupportInbox
        tickets={data?.tickets ?? []}
        counts={
          data?.counts ?? {
            open: 0,
            inProgress: 0,
            resolved: 0,
            total: 0,
          }
        }
        error={error}
      />
    </div>
  );
}
