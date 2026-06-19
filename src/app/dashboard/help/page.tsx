import { ContactSupportForm } from "@/components/support/ContactSupportForm";
import { getMySupportTickets } from "@/app/actions/support";
import { SUPPORT_CATEGORY_LABELS } from "@/types/support-ticket";

export default async function HelpPage() {
  const { tickets, error } = await getMySupportTickets();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="border-b border-[var(--brand-border)] pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Help
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--brand-text-secondary)]">
          Contact Support
        </h1>
        <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
          Report bugs, request features, or ask for help with your account.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 sm:p-6">
        <ContactSupportForm />
      </div>

      {error && (
        <p className="rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]">
          {error}
        </p>
      )}

      {tickets.length > 0 && (
        <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 sm:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Your recent tickets
          </h2>
          <ul className="mt-4 space-y-3">
            {tickets.slice(0, 5).map((ticket) => (
              <li
                key={ticket.id}
                className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-[var(--brand-text-secondary)]">
                    {ticket.subject}
                  </p>
                  <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--brand-text-secondary)]">
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
                  {SUPPORT_CATEGORY_LABELS[ticket.category]} ·{" "}
                  {new Date(ticket.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
