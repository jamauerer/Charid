import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AiAdminNav } from "@/components/admin/ai/AiAdminNav";
import { studioAdminSectionTitle, studioEyebrow } from "@/lib/design-system";

export default function AiAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <AdminBackLink href="/dashboard/admin" label="Founder dashboard" />
      <div>
        <p className={studioEyebrow}>Admin</p>
        <h1 className={`mt-1 ${studioAdminSectionTitle}`}>Production AI</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--brand-text-secondary)]">
          Configure the AI systems that power production planning, image generation, video
          generation, creative assistance, and future storytelling workflows throughout CharID.
        </p>
      </div>
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        <aside className="w-full shrink-0 lg:w-52">
          <AiAdminNav />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
