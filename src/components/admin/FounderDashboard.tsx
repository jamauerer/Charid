import Link from "next/link";
import type { FounderDashboardData } from "@/app/actions/founder-analytics";
import type { DatabaseHealthItem } from "@/app/actions/database-health";
import {
  founderHealthLabel,
  platformHealthSummary,
  sanitizeFounderError,
} from "@/lib/founder-messages";
import {
  formatSupportCategory,
  formatSupportStatus,
} from "@/lib/founder-labels";
import { labelRiskCategories } from "@/lib/moderation/labels";
import {
  studioAdminCard,
  studioAdminSectionTitle,
  studioEyebrow,
  dsAlertInfo,
  dsBtnGhost,
} from "@/lib/design-system";

function MetricCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const card = (
    <div className={studioAdminCard}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--foreground)]">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-[var(--brand-text-muted)]">{hint}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition hover:opacity-90">
        {card}
      </Link>
    );
  }
  return card;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className={studioAdminSectionTitle}>{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function HealthPill({
  label,
  detail,
  tone,
}: {
  label: string;
  detail: string;
  tone: "ok" | "warn" | "error" | "neutral";
}) {
  const styles = {
    ok: "rounded-xl border border-[var(--status-success-border)] bg-[var(--status-success-bg)] p-4 text-[var(--status-success-text)]",
    warn: "rounded-xl border border-[var(--status-info-border)] bg-[var(--status-info-bg)] p-4 text-[var(--status-info-text)]",
    error: "rounded-xl border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] p-4 text-[var(--status-danger-text)]",
    neutral:
      "rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 text-neutral-600",
  };

  return (
    <div className={`rounded-xl border p-4 ${styles[tone]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-1 text-xs opacity-80">{detail}</p>
    </div>
  );
}

export function FounderDashboard({
  data,
  databaseHealth,
  databaseHealthError,
  analyticsError,
}: {
  data: FounderDashboardData | null;
  databaseHealth: DatabaseHealthItem[];
  databaseHealthError?: string;
  analyticsError?: string;
}) {
  const overview = data?.overview;
  const support = data?.support;
  const moderation = data?.moderation;
  const feedback = data?.feedback;

  const dbSummary = platformHealthSummary(databaseHealth);
  const friendlyAnalyticsError = sanitizeFounderError(analyticsError);
  const friendlyDbError = sanitizeFounderError(databaseHealthError);

  const publishedWorks = overview
    ? Math.max(
        overview.publicPortfolios,
        data?.funnel.publishedWork ?? 0
      )
    : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="border-b border-[var(--brand-border)] pb-6">
        <p className={studioEyebrow}>Platform operations</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Admin Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--brand-text-secondary)]">
          Operate CharID as a creative platform — creators, content, and
          community at a glance.
        </p>
        <nav className="mt-4 flex flex-wrap gap-2">
          <Link href="/dashboard/admin/support" className={dsBtnGhost}>
            Support inbox
          </Link>
          <Link href="/dashboard/admin/feedback" className={dsBtnGhost}>
            Feedback inbox
          </Link>
          <Link href="/dashboard/admin/moderation" className={dsBtnGhost}>
            Moderation
          </Link>
          <Link href="/dashboard/admin/ai" className={dsBtnGhost}>
            Production AI
          </Link>
        </nav>
      </header>

      {!data && friendlyAnalyticsError && (
        <div className={dsAlertInfo}>
          <p className="font-medium">Founder analytics unavailable</p>
          <p className="mt-1 opacity-90">{friendlyAnalyticsError}</p>
        </div>
      )}

      <Section
        title="Platform overview"
        description="Creative work across the platform."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            label="Users"
            value={overview?.totalUsers ?? "—"}
          />
          <MetricCard
            label="Projects"
            value={overview?.projectsCreated ?? "—"}
          />
          <MetricCard
            label="Stories"
            value={overview?.storiesCreated ?? "—"}
          />
          <MetricCard
            label="Characters"
            value={overview?.charactersCreated ?? "—"}
          />
          <MetricCard
            label="Worlds"
            value={overview?.worldsCreated ?? "—"}
          />
          <MetricCard
            label="Published works"
            value={publishedWorks || "—"}
            hint="Public portfolios & work"
          />
        </div>
      </Section>

      <Section
        title="Needs attention"
        description="Items waiting for a founder decision."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard
            label="Support awaiting reply"
            value={overview?.supportTicketsOpen ?? support?.open ?? "—"}
            href="/dashboard/admin/support"
          />
          <MetricCard
            label="Feedback awaiting review"
            value={overview?.newFeedback7d ?? feedback?.totalRatings ?? "—"}
            hint="Recent creator feedback"
            href="/dashboard/admin/feedback"
          />
          <MetricCard
            label="Moderation awaiting review"
            value={overview?.moderationQueuePending ?? moderation?.pending ?? "—"}
            href="/dashboard/admin/moderation"
          />
        </div>
      </Section>

      <Section
        title="Platform health"
        description="Is the platform ready for creators?"
      >
        {friendlyDbError && (
          <p className={dsAlertInfo}>{friendlyDbError}</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HealthPill
            label="Database"
            detail={dbSummary.detail}
            tone={dbSummary.tone}
          />
          <HealthPill
            label="Storage"
            detail="Monitoring coming soon."
            tone="neutral"
          />
          <HealthPill
            label="AI queue"
            detail="Monitoring coming soon."
            tone="neutral"
          />
          <HealthPill
            label="Background jobs"
            detail="Monitoring coming soon."
            tone="neutral"
          />
        </div>
        {databaseHealth.length > 0 && dbSummary.tone !== "ok" && (
          <details className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
            <summary className="cursor-pointer text-sm font-medium text-[var(--foreground)]">
              Service details
            </summary>
            <ul className="mt-3 space-y-2">
              {databaseHealth.map((item) => (
                <li
                  key={item.label}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--brand-text-secondary)]"
                >
                  <span>{founderHealthLabel(item.label)}</span>
                  <span className="text-xs uppercase tracking-wide text-[var(--brand-text-muted)]">
                    {item.status === "Ready"
                      ? "Connected"
                      : item.status === "Warning"
                        ? "Degraded"
                        : "Not connected"}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </Section>

      {data && (
        <Section
          title="Recent activity"
          description="What's happening on the platform."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="New users (7 days)"
              value={overview!.newUsers7d}
            />
            <MetricCard
              label="New feedback (7 days)"
              value={overview!.newFeedback7d}
            />
            <MetricCard
              label="Flagged content (7 days)"
              value={moderation!.flagged7d}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className={studioAdminCard}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
                Recent support
              </h3>
              <ul className="mt-3 space-y-2">
                {(support?.recentTickets ?? []).length === 0 ? (
                  <li className="text-sm text-[var(--brand-text-muted)]">No tickets yet.</li>
                ) : (
                  support!.recentTickets.slice(0, 5).map((ticket) => (
                    <li
                      key={ticket.id}
                      className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-3 py-2 text-sm"
                    >
                      <p className="truncate font-medium text-[var(--foreground)]">
                        {ticket.subject}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--brand-text-muted)]">
                        {formatSupportCategory(ticket.category)} ·{" "}
                        {formatSupportStatus(ticket.status)}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className={studioAdminCard}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
                Recent moderation
              </h3>
              <ul className="mt-3 space-y-2">
                {(moderation?.recentActivity ?? []).length === 0 ? (
                  <li className="text-sm text-[var(--brand-text-muted)]">
                    No moderation activity yet.
                  </li>
                ) : (
                  moderation!.recentActivity.slice(0, 5).map((item) => (
                    <li
                      key={item.id}
                      className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-3 py-2 text-sm"
                    >
                      <p className="text-[var(--foreground)]">
                        {item.content_type} ·{" "}
                        {item.entity_type.replace(/_/g, " ")}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--brand-text-muted)]">
                        {item.status}
                        {item.risk_categories.length > 0 &&
                          ` · ${labelRiskCategories(item.risk_categories)}`}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}
