"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createComicIssue,
  createComicPage,
  deleteComicIssue,
  deleteComicPage,
  renameComicIssue,
  renameComicPage,
  reorderComicIssues,
  reorderComicPages,
} from "@/app/actions/production/comic";
import { ProductionEntityList } from "@/components/project/production/ProductionEntityList";
import { ProductionUnitCard } from "@/components/project/production/ProductionUnitCard";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import {
  groupComicPagesByIssue,
  type ComicPageListItem,
} from "@/lib/production-reading-order";
import { comicPageStudioPath } from "@/lib/production-routes";
import { studioBtnPrimarySm } from "@/lib/visual-identity";
import type { ComicIssueWithPages } from "@/types/production/comic";

type ComicPagesPanelProps = {
  projectId: string;
  issues: ComicIssueWithPages[];
};

export function ComicPagesPanel({ projectId, issues }: ComicPagesPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const groups = groupComicPagesByIssue(issues);
  const hasPages = groups.some((group) => group.pages.length > 0);

  function refresh() {
    router.refresh();
  }

  function runAction(action: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (result.error) setError(result.error);
      else refresh();
    });
  }

  if (!hasPages && issues.length === 0) {
    return (
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <StudioEmptyState
          headline="No pages yet"
          description="Start your graphic novel by adding your first page."
        />
        <button
          type="button"
          onClick={() =>
            runAction(async () => {
              const issueResult = await createComicIssue(projectId);
              if (issueResult.error || !issueResult.issue) {
                return { error: issueResult.error ?? "Failed to create page." };
              }
              return createComicPage(projectId, issueResult.issue.id);
            })
          }
          disabled={pending}
          className={studioBtnPrimarySm}
        >
          Add first page
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${pending ? "opacity-80" : ""}`}>
      {error && <ErrorBanner message={error} />}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[var(--brand-text-muted)]">
          Open a page to work on panels and layout. Volumes group pages in reading
          order.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runAction(() => createComicIssue(projectId))}
            disabled={pending}
            className="rounded-lg border border-[var(--brand-border)] px-2 py-1 text-xs font-medium"
          >
            Add volume
          </button>
          {issues.length === 1 && (
            <button
              type="button"
              onClick={() => runAction(() => createComicPage(projectId, issues[0].id))}
              disabled={pending}
              className={studioBtnPrimarySm}
            >
              Add page
            </button>
          )}
        </div>
      </div>

      {groups.map((group) => (
        <section key={group.issueId} className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            {group.issueName}
          </h3>
          {group.pages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--brand-border)] px-4 py-6 text-center">
              <p className="text-sm text-[var(--brand-text-muted)]">
                No pages in this volume yet.
              </p>
              <button
                type="button"
                onClick={() => runAction(() => createComicPage(projectId, group.issueId))}
                disabled={pending}
                className={`mt-3 ${studioBtnPrimarySm}`}
              >
                Add page to {group.issueName}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.pages.map((page) => (
                  <PageCard key={page.id} projectId={projectId} page={page} />
                ))}
              </div>
              <details className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
                  Reorder & manage pages
                </summary>
                <div className="mt-3">
                  <ProductionEntityList
                    items={group.pages.map((page) => ({ id: page.id, name: page.name }))}
                    onReorder={(orderedIds) =>
                      reorderComicPages(projectId, group.issueId, orderedIds)
                    }
                    onRename={(id, name) => renameComicPage(projectId, id, name)}
                    onDelete={(id) => deleteComicPage(projectId, id)}
                  />
                  <button
                    type="button"
                    onClick={() => runAction(() => createComicPage(projectId, group.issueId))}
                    disabled={pending}
                    className={`mt-3 ${studioBtnPrimarySm}`}
                  >
                    Add page to {group.issueName}
                  </button>
                </div>
              </details>
            </>
          )}
        </section>
      ))}

      {issues.length > 0 && (
        <details className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Book structure
          </summary>
          <p className="mt-2 text-xs text-[var(--brand-text-muted)]">
            Volumes organize your comic in reading order.
          </p>
          <div className="mt-3">
            <ProductionEntityList
              items={issues.map((issue) => ({ id: issue.id, name: issue.name }))}
              onReorder={(orderedIds) => reorderComicIssues(projectId, orderedIds)}
              onRename={(id, name) => renameComicIssue(projectId, id, name)}
              onDelete={(id) => deleteComicIssue(projectId, id)}
            />
          </div>
        </details>
      )}
    </div>
  );
}

function PageCard({
  projectId,
  page,
}: {
  projectId: string;
  page: ComicPageListItem;
}) {
  return (
    <ProductionUnitCard
      href={comicPageStudioPath(projectId, page.id)}
      indexLabel={`Page ${page.pageNumber}`}
      title={page.name}
      subtitle={page.issueName}
      meta={`${page.panelCount} panel${page.panelCount === 1 ? "" : "s"}`}
      status={page.status}
    />
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-3 py-2 text-sm text-[var(--status-danger-text)]">
      {message}
    </p>
  );
}
