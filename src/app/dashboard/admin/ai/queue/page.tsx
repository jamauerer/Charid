import { AiJobsPanel } from "@/components/admin/ai/AiAdminPanels";

export default function AiQueuePage() {
  return <AiJobsPanel filter="queued" />;
}
