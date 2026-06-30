"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  adminRetryAiJob,
  getAiAdminIntelligenceSnapshots,
  getAiAdminJobs,
  getAiAdminLogs,
  getAiAdminModels,
  getAiAdminPromptTemplates,
  getAiAdminProviders,
  getAiAdminSettings,
  getAiAdminUsage,
  saveAiAdminSettings,
  saveAiPromptTemplate,
  toggleAiProvider,
} from "@/app/actions/ai/admin";
import {
  computeOverviewMetrics,
  deriveModelPurpose,
  formatDurationMs,
  groupPromptTemplates,
  TEXT_PROVIDER_IDS,
} from "@/lib/ai/admin-display";
import { studioAdminCard } from "@/lib/design-system";
import type { ProductionIntelligenceBundle } from "@/types/ai/production-intelligence";
import {
  AI_FEATURE_IDS,
  AI_FEATURE_LABELS,
  AI_PROJECT_TYPE_IDS,
  AI_PROJECT_TYPE_LABELS,
  type AiFeatureId,
  type AiProjectTypeId,
  type AiProviderId,
} from "@/types/ai/core";
import type {
  AiJob,
  AiLogEntry,
  AiPromptTemplate,
  AiProviderConfig,
  AiSettings,
} from "@/types/ai/core";

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${studioAdminCard} space-y-4 p-5`}>
      <div>
        <h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2>
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-[var(--brand-text-muted)]">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function MetricCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className={`${studioAdminCard} flex flex-col gap-1.5 p-4`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
        {title}
      </p>
      <p className="text-xl font-semibold tabular-nums text-[var(--foreground)]">{value}</p>
      {hint && <p className="text-xs text-[var(--brand-text-muted)]">{hint}</p>}
    </div>
  );
}

export function AiOverviewPanel() {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getAiAdminUsage>>["summary"]>(null);
  const [metrics, setMetrics] = useState<ReturnType<typeof computeOverviewMetrics> | null>(null);

  useEffect(() => {
    void Promise.all([
      getAiAdminUsage(),
      getAiAdminSettings(),
      getAiAdminProviders(),
      getAiAdminJobs(),
      getAiAdminLogs(),
    ]).then(([usage, settings, providers, jobs, logs]) => {
      setSummary(usage.summary);
      if (settings.settings) {
        setMetrics(
          computeOverviewMetrics({
            jobs: jobs.jobs,
            logs: logs.logs,
            providers: providers.providers,
            defaultProvider: settings.settings.defaultTextProvider,
          })
        );
      }
    });
  }, []);

  if (!summary) {
    return <p className="text-sm text-[var(--brand-text-muted)]">Loading…</p>;
  }

  const planningTime = formatDurationMs(metrics?.avgPlanningTimeMs ?? null);
  const imageTime = formatDurationMs(metrics?.avgImageTimeMs ?? null);
  const videoTime = formatDurationMs(metrics?.avgVideoTimeMs ?? null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[var(--foreground)]">Production overview</h2>
        <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
          Visual storytelling pipeline metrics from current AI jobs and provider configuration.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Total jobs" value={summary.totalJobs} />
        <MetricCard title="Completed" value={summary.completedJobs} />
        <MetricCard title="Failed" value={summary.failedJobs} />
        {metrics && (
          <>
            <MetricCard title="Providers enabled" value={metrics.providersEnabled} />
            <MetricCard
              title="Default provider"
              value={metrics.defaultProvider}
              hint="Primary text provider for production planning"
            />
            <MetricCard title="Active models" value={metrics.activeModels} hint="From enabled providers" />
            <MetricCard
              title="Today's cost"
              value={`$${metrics.todaysCostUsd.toFixed(4)}`}
              hint="Completed job cost today"
            />
          </>
        )}
        <MetricCard title="Credits used" value={summary.totalCredits} />
        <MetricCard title="Est. cost (USD)" value={`$${summary.totalCostUsd.toFixed(4)}`} />
        {planningTime && (
          <MetricCard title="Average planning time" value={planningTime} hint="Story, scene, and page planning" />
        )}
        {imageTime && (
          <MetricCard title="Average image time" value={imageTime} hint="Image prompt jobs" />
        )}
        {videoTime && (
          <MetricCard title="Average video time" value={videoTime} hint="Video prompt jobs" />
        )}
      </div>
    </div>
  );
}

export function AiProvidersPanel() {
  const [providers, setProviders] = useState<AiProviderConfig[]>([]);
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(() => {
    void Promise.all([getAiAdminProviders(), getAiAdminSettings()]).then(([p, s]) => {
      setProviders(p.providers);
      setSettings(s.settings);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function toggle(id: AiProviderConfig["id"], enabled: boolean) {
    startTransition(async () => {
      const r = await toggleAiProvider(id, enabled);
      setProviders(r.providers ?? providers);
    });
  }

  function setDefaultProvider(providerId: AiProviderId) {
    startTransition(async () => {
      const r = await saveAiAdminSettings({ defaultTextProvider: providerId });
      if (r.settings) setSettings(r.settings);
    });
  }

  function moveFallback(index: number, direction: -1 | 1) {
    if (!settings) return;
    const order = [...settings.providerFallbackOrder];
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target]!, order[index]!];
    startTransition(async () => {
      const r = await saveAiAdminSettings({ providerFallbackOrder: order });
      if (r.settings) setSettings(r.settings);
    });
  }

  const textProviders = providers.filter((p) => TEXT_PROVIDER_IDS.includes(p.id as (typeof TEXT_PROVIDER_IDS)[number]));

  return (
    <div className="space-y-5">
      <Card
        title="Default provider"
        description="Primary text provider for production planning and creative workflows."
      >
        <div className="space-y-2">
          {textProviders.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="defaultProvider"
                checked={settings?.defaultTextProvider === p.id}
                disabled={pending || !p.enabled}
                onChange={() => setDefaultProvider(p.id)}
              />
              <span className={p.enabled ? "" : "text-[var(--brand-text-muted)]"}>{p.name}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card
        title="Fallback order"
        description="When the default provider is unavailable, CharID tries providers in this order."
      >
        <ol className="space-y-2">
          {(settings?.providerFallbackOrder ?? []).map((id, index) => {
            const provider = providers.find((p) => p.id === id);
            return (
              <li
                key={id}
                className="flex items-center justify-between gap-2 rounded-lg border border-[var(--brand-border)] px-3 py-2 text-sm"
              >
                <span>
                  <span className="mr-2 text-[var(--brand-text-muted)]">{index + 1}.</span>
                  {provider?.name ?? id}
                </span>
                <span className="flex gap-1">
                  <button
                    type="button"
                    disabled={pending || index === 0}
                    onClick={() => moveFallback(index, -1)}
                    className="rounded px-1.5 py-0.5 text-xs text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-elevated)] disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={pending || index === (settings?.providerFallbackOrder.length ?? 0) - 1}
                    onClick={() => moveFallback(index, 1)}
                    className="rounded px-1.5 py-0.5 text-xs text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-elevated)] disabled:opacity-40"
                  >
                    ↓
                  </button>
                </span>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card title="Providers" description="Enable or disable AI provider plugins.">
        <ul className="space-y-2">
          {providers.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-[var(--brand-border)] px-3 py-2.5 text-sm"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-[var(--brand-text-muted)]">
                  {p.capabilities.join(", ")} · {p.models.length} models
                </p>
              </div>
              <label className="flex shrink-0 items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={p.enabled}
                  disabled={pending}
                  onChange={(e) => toggle(p.id, e.target.checked)}
                />
                Enabled
              </label>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export function AiModelsPanel() {
  const [models, setModels] = useState<Awaited<ReturnType<typeof getAiAdminModels>>["models"]>([]);

  useEffect(() => {
    void getAiAdminModels().then((r) => setModels(r.models));
  }, []);

  return (
    <Card title="Models" description="Available models across all registered providers.">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--brand-border)] text-[var(--brand-text-muted)]">
              <th className="py-2 pr-4 font-medium">Provider</th>
              <th className="py-2 pr-4 font-medium">Model</th>
              <th className="py-2 pr-4 font-medium">Purpose</th>
              <th className="py-2 font-medium">Capabilities</th>
            </tr>
          </thead>
          <tbody>
            {models.map((row) => (
              <tr key={`${row.providerId}-${row.model.id}`} className="border-b border-[var(--brand-border)]">
                <td className="py-2.5 pr-4">{row.providerName}</td>
                <td className="py-2.5 pr-4 font-medium">{row.model.label}</td>
                <td className="py-2.5 pr-4 text-[var(--brand-text-secondary)]">
                  {deriveModelPurpose(row.model.capabilities)}
                </td>
                <td className="py-2.5">{row.model.capabilities.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function AiPromptsPanel() {
  const [templates, setTemplates] = useState<AiPromptTemplate[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<AiPromptTemplate>>({});
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    void getAiAdminPromptTemplates().then((r) => {
      setTemplates(r.templates);
      if (r.templates[0]) setSelected(r.templates[0].id);
    });
  }, []);

  useEffect(() => {
    const t = templates.find((x) => x.id === selected);
    if (t) setDraft(t);
  }, [selected, templates]);

  function save() {
    if (!selected) return;
    startTransition(async () => {
      const r = await saveAiPromptTemplate(selected, {
        name: draft.name,
        description: draft.description,
        systemPrompt: draft.systemPrompt,
        userPromptTemplate: draft.userPromptTemplate,
      });
      if (r.template) {
        setTemplates((prev) => prev.map((t) => (t.id === r.template!.id ? r.template! : t)));
      }
    });
  }

  const groups = groupPromptTemplates(templates);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="Templates" description="Grouped by production workflow category.">
        <div className="max-h-[32rem] space-y-5 overflow-y-auto pr-1">
          {groups.map((group) => (
            <div key={group.category}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.templates.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(t.id)}
                      className={`w-full rounded-lg px-2.5 py-2 text-left text-sm transition ${
                        selected === t.id
                          ? "bg-[var(--brand-surface-elevated)] font-medium text-[var(--foreground)]"
                          : "text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface)]"
                      }`}
                    >
                      {t.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
      {draft && (
        <Card title="Edit template">
          <p className="-mt-2 text-xs text-[var(--brand-text-muted)]">{draft.description}</p>
          <label className="block text-xs text-[var(--brand-text-muted)]">
            System prompt
            <textarea
              value={draft.systemPrompt ?? ""}
              onChange={(e) => setDraft({ ...draft, systemPrompt: e.target.value })}
              rows={4}
              className="mt-1.5 w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-2.5 text-xs leading-relaxed"
            />
          </label>
          <label className="mt-3 block text-xs text-[var(--brand-text-muted)]">
            User prompt template
            <textarea
              value={draft.userPromptTemplate ?? ""}
              onChange={(e) => setDraft({ ...draft, userPromptTemplate: e.target.value })}
              rows={6}
              className="mt-1.5 w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-2.5 font-mono text-xs leading-relaxed"
            />
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="mt-4 rounded-lg bg-[var(--brand-accent)] px-3 py-1.5 text-xs font-medium text-[var(--brand-accent-foreground)]"
          >
            Save template
          </button>
        </Card>
      )}
    </div>
  );
}

export function AiProjectTypesPanel() {
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    void getAiAdminSettings().then((r) => setSettings(r.settings));
  }, []);

  function toggleType(id: AiProjectTypeId, enabled: boolean) {
    if (!settings) return;
    const projectTypes = { ...settings.projectTypes, [id]: enabled };
    setSettings({ ...settings, projectTypes });
    startTransition(async () => {
      const r = await saveAiAdminSettings({ projectTypes });
      if (r.settings) setSettings(r.settings);
    });
  }

  if (!settings) return <p className="text-sm text-[var(--brand-text-muted)]">Loading…</p>;

  return (
    <Card
      title="Project types"
      description="Configure which visual storytelling project types are supported by future AI production workflows."
    >
      <ul className="space-y-2">
        {AI_PROJECT_TYPE_IDS.map((id) => (
          <li
            key={id}
            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--brand-border)] px-3 py-2.5"
          >
            <span className="text-sm font-medium">{AI_PROJECT_TYPE_LABELS[id]}</span>
            <label className="flex items-center gap-2 text-xs text-[var(--brand-text-muted)]">
              <input
                type="checkbox"
                checked={settings.projectTypes[id]}
                disabled={pending}
                onChange={(e) => toggleType(id, e.target.checked)}
              />
              Enabled
            </label>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function AiFeaturesPanel() {
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    void getAiAdminSettings().then((r) => setSettings(r.settings));
  }, []);

  function toggleFeature(id: AiFeatureId, enabled: boolean) {
    if (!settings) return;
    const features = { ...settings.features, [id]: enabled };
    setSettings({ ...settings, features });
    startTransition(async () => {
      const r = await saveAiAdminSettings({ features });
      if (r.settings) setSettings(r.settings);
    });
  }

  if (!settings) return <p className="text-sm text-[var(--brand-text-muted)]">Loading…</p>;

  return (
    <Card
      title="AI features"
      description="Feature flags for production planning, creative assistance, and future storytelling workflows. No backend wiring yet."
    >
      <ul className="space-y-2">
        {AI_FEATURE_IDS.map((id) => (
          <li
            key={id}
            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--brand-border)] px-3 py-2.5"
          >
            <span className="text-sm">{AI_FEATURE_LABELS[id]}</span>
            <label className="flex shrink-0 items-center gap-2 text-xs text-[var(--brand-text-muted)]">
              <input
                type="checkbox"
                checked={settings.features[id]}
                disabled={pending}
                onChange={(e) => toggleFeature(id, e.target.checked)}
              />
              Enabled
            </label>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function JobsTable({ jobs, onRetry }: { jobs: AiJob[]; onRetry?: (id: string) => void }) {
  if (jobs.length === 0) {
    return <p className="text-sm text-[var(--brand-text-muted)]">No jobs yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-[var(--brand-border)] text-[var(--brand-text-muted)]">
            <th className="py-2 pr-3 font-medium">Status</th>
            <th className="py-2 pr-3 font-medium">Provider</th>
            <th className="py-2 pr-3 font-medium">Model</th>
            <th className="py-2 pr-3 font-medium">Credits</th>
            <th className="py-2 pr-3 font-medium">Cost</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-b border-[var(--brand-border)] align-top">
              <td className="py-2.5 pr-3 capitalize">{job.status}</td>
              <td className="py-2.5 pr-3">{job.providerId}</td>
              <td className="py-2.5 pr-3">{job.modelId}</td>
              <td className="py-2.5 pr-3">{job.actualCredits ?? job.estimatedCredits} est.</td>
              <td className="py-2.5 pr-3">${(job.actualCostUsd ?? job.estimatedCostUsd).toFixed(4)}</td>
              <td className="py-2.5">
                {onRetry && job.status === "failed" && (
                  <button type="button" onClick={() => onRetry(job.id)} className="underline">
                    Retry
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AiJobsPanel({ filter }: { filter?: string }) {
  const [jobs, setJobs] = useState<AiJob[]>([]);

  const load = useCallback(() => {
    void getAiAdminJobs(filter).then((r) => setJobs(r.jobs));
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Card title="AI jobs">
      <JobsTable
        jobs={jobs}
        onRetry={(id) => {
          void adminRetryAiJob(id).then(load);
        }}
      />
    </Card>
  );
}

export function AiLogsPanel() {
  const [logs, setLogs] = useState<AiLogEntry[]>([]);
  const [query, setQuery] = useState("");

  function search(q: string) {
    void getAiAdminLogs(q).then((r) => setLogs(r.logs));
  }

  useEffect(() => {
    search("");
  }, []);

  return (
    <Card title="Logs" description="Searchable record of prompts, responses, and job outcomes.">
      <input
        type="search"
        placeholder="Search prompts, responses, models…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          search(e.target.value);
        }}
        className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-xs"
      />
      <div className="max-h-96 space-y-2 overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="rounded-lg border border-[var(--brand-border)] p-3 text-xs">
            <p className="font-medium capitalize">
              {log.status} · {log.providerId}/{log.modelId}
            </p>
            <p className="mt-1 truncate text-[var(--brand-text-muted)]">{log.prompt.slice(0, 120)}…</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function AiUsagePanel() {
  return <AiOverviewPanel />;
}

const PRODUCTION_CREDIT_ACTIONS = [
  { label: "Story Analysis", credits: 2 },
  { label: "Scene Planning", credits: 1 },
  { label: "Page Planning", credits: 3 },
  { label: "Panel Planning", credits: 1 },
  { label: "Image Generation", credits: "TBD" },
  { label: "Video Generation", credits: "TBD" },
] as const;

export function AiCreditsPanel() {
  return (
    <div className="space-y-5">
      <Card
        title="Credit usage"
        description="Production planning actions deduct credits through the existing ledger via consumeCredits. No billing logic changes."
      >
        <ul className="space-y-2 text-sm text-[var(--brand-text-secondary)]">
          {PRODUCTION_CREDIT_ACTIONS.map((action) => (
            <li key={action.label} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--brand-border)] px-3 py-2">
              <span>{action.label}</span>
              <span className="tabular-nums text-[var(--brand-text-muted)]">
                {typeof action.credits === "number" ? `${action.credits} credits` : action.credits}
              </span>
            </li>
          ))}
        </ul>
      </Card>
      <AiOverviewPanel />
    </div>
  );
}

export function AiCostsPanel() {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getAiAdminUsage>>["summary"]>(null);

  useEffect(() => {
    void getAiAdminUsage().then((r) => setSummary(r.summary));
  }, []);

  return (
    <Card title="Cost tracking" description="Estimated provider COGS from completed jobs.">
      <p className="text-3xl font-semibold tabular-nums">${summary?.totalCostUsd.toFixed(4) ?? "0.0000"}</p>
    </Card>
  );
}

export function AiSettingsPanel() {
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    void getAiAdminSettings().then((r) => setSettings(r.settings));
  }, []);

  if (!settings) return <p className="text-sm text-[var(--brand-text-muted)]">Loading…</p>;

  return (
    <Card title="Settings" description="Global Production AI behavior and simulation options.">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={settings.simulateProviders}
          onChange={(e) => {
            const next = { ...settings, simulateProviders: e.target.checked };
            setSettings(next);
            startTransition(async () => {
              const r = await saveAiAdminSettings({ simulateProviders: e.target.checked });
              if (r.settings) setSettings(r.settings);
            });
          }}
        />
        Simulate providers when API keys unavailable
      </label>
      <p className="text-xs text-[var(--brand-text-muted)]">
        Default text: {settings.defaultTextProvider} / {settings.defaultTextModel}
      </p>
      <p className="text-xs text-[var(--brand-text-muted)]">
        Default image: {settings.defaultImageProvider} / {settings.defaultImageModel}
      </p>
    </Card>
  );
}

const INTELLIGENCE_STAGES = [
  { id: "story", label: "Story Analysis" },
  { id: "scene", label: "Scene Analysis" },
  { id: "page", label: "Page Planning" },
  { id: "panel", label: "Panel Planning" },
  { id: "film", label: "Future Film Planning" },
  { id: "advertisement", label: "Future Advertisement Planning" },
] as const;

function IntelligenceSnapshotCard({ snapshot }: { snapshot: ProductionIntelligenceBundle }) {
  return (
    <div className="space-y-3 rounded-lg border border-[var(--brand-border)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{AI_PROJECT_TYPE_LABELS[snapshot.projectType]}</p>
        <p className="text-xs text-[var(--brand-text-muted)]">
          {new Date(snapshot.createdAt).toLocaleString()}
        </p>
      </div>
      <p className="text-xs text-[var(--brand-text-secondary)]">{snapshot.summary.productionSummary}</p>
      <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-[var(--brand-text-muted)]">Pages</dt>
          <dd className="font-medium tabular-nums">{snapshot.summary.estimatedPages}</dd>
        </div>
        <div>
          <dt className="text-[var(--brand-text-muted)]">Panels</dt>
          <dd className="font-medium tabular-nums">{snapshot.summary.estimatedPanels}</dd>
        </div>
        <div>
          <dt className="text-[var(--brand-text-muted)]">Credits</dt>
          <dd className="font-medium tabular-nums">{snapshot.summary.estimatedCredits}</dd>
        </div>
        <div>
          <dt className="text-[var(--brand-text-muted)]">Pacing</dt>
          <dd>{snapshot.story.pacing}</dd>
        </div>
      </dl>
      <details className="text-xs">
        <summary className="cursor-pointer font-medium text-[var(--brand-text-secondary)]">
          {snapshot.scenes.length} scenes analyzed
        </summary>
        <ul className="mt-2 space-y-1 text-[var(--brand-text-muted)]">
          {snapshot.scenes.slice(0, 6).map((scene) => (
            <li key={scene.sceneId}>
              {scene.sceneTitle} — {scene.purpose}, {scene.estimatedPanels} panels
            </li>
          ))}
        </ul>
      </details>
      {snapshot.filmPreview && (
        <p className="text-xs text-[var(--brand-text-muted)]">
          Film preview: {snapshot.filmPreview.estimatedShotCount} shots ·{" "}
          {snapshot.filmPreview.cameraMotionSuggestion}
        </p>
      )}
      {snapshot.advertisementPreview && (
        <p className="text-xs text-[var(--brand-text-muted)]">
          Ad preview: {snapshot.advertisementPreview.recommendedLayoutStyle}
        </p>
      )}
    </div>
  );
}

export function AiProductionIntelligencePanel() {
  const [snapshots, setSnapshots] = useState<ProductionIntelligenceBundle[]>([]);

  useEffect(() => {
    void getAiAdminIntelligenceSnapshots().then((r) => setSnapshots(r.snapshots));
  }, []);

  return (
    <div className="space-y-5">
      <Card
        title="Production Intelligence"
        description="Reasoning layer for story, scene, page, and panel planning before generation. Visibility into recent planning runs."
      >
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {INTELLIGENCE_STAGES.map((stage) => (
            <li
              key={stage.id}
              className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-3 py-2 text-xs"
            >
              <span className="font-medium text-[var(--foreground)]">{stage.label}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Recent planning runs" description="In-memory snapshots from creator planning workflows.">
        {snapshots.length === 0 ? (
          <p className="text-sm text-[var(--brand-text-muted)]">
            No Production Intelligence runs yet. Run Generate Comic from a project to populate snapshots.
          </p>
        ) : (
          <div className="space-y-3">
            {snapshots.map((snapshot, index) => (
              <IntelligenceSnapshotCard key={`${snapshot.createdAt}-${index}`} snapshot={snapshot} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
