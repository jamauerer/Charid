"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createComicIssue,
  createComicPage,
  createComicPanel,
  deleteComicIssue,
  deleteComicPage,
  deleteComicPanel,
  renameComicIssue,
  renameComicPage,
  renameComicPanel,
  reorderComicIssues,
  reorderComicPages,
  reorderComicPanels,
} from "@/app/actions/production/comic";
import { ProductionAccordion } from "@/components/project/production/ProductionAccordion";
import { ProductionEntityList } from "@/components/project/production/ProductionEntityList";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { reorderById } from "@/lib/production-reorder";
import { studioBtnPrimarySm } from "@/lib/visual-identity";
import type { ComicIssueWithPages } from "@/types/production/comic";

type ComicIssuesPanelProps = {
  projectId: string;
  issues: ComicIssueWithPages[];
};

export function ComicIssuesPanel({
  projectId,
  issues: initialIssues,
}: ComicIssuesPanelProps) {
  const router = useRouter();
  const [issues, setIssues] = useState(initialIssues);
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [dropTargetIssueId, setDropTargetIssueId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setIssues(initialIssues);
  }, [initialIssues]);

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

  const persistIssueOrder = useCallback(
    (ordered: ComicIssueWithPages[]) => {
      startTransition(async () => {
        setError(null);
        const result = await reorderComicIssues(
          projectId,
          ordered.map((issue) => issue.id)
        );
        if (result.error) {
          setError(result.error);
          setIssues(initialIssues);
        }
      });
    },
    [projectId, initialIssues]
  );

  if (issues.length === 0) {
    return (
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <StudioEmptyState
          headline="No issues yet"
          description="Add your first issue to begin organizing pages and panels."
        />
        <button
          type="button"
          onClick={() => runAction(() => createComicIssue(projectId))}
          disabled={pending}
          className={studioBtnPrimarySm}
        >
          Add Issue
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${pending ? "opacity-80" : ""}`}>
      {error && <ErrorBanner message={error} />}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[var(--brand-text-muted)]">
          Drag issues to reorder. Pages and panels live inside each issue.
        </p>
        <button
          type="button"
          onClick={() => runAction(() => createComicIssue(projectId))}
          disabled={pending}
          className={studioBtnPrimarySm}
        >
          Add Issue
        </button>
      </div>

      <div className="space-y-3">
        {issues.map((issue, issueIndex) => (
          <IssueAccordion
            key={issue.id}
            issue={issue}
            issueIndex={issueIndex}
            projectId={projectId}
            pending={pending}
            draggedIssueId={draggedIssueId}
            dropTargetIssueId={dropTargetIssueId}
            onDragStart={() => setDraggedIssueId(issue.id)}
            onDragEnd={() => {
              setDraggedIssueId(null);
              setDropTargetIssueId(null);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDropTargetIssueId(issue.id);
            }}
            onDrop={() => {
              if (!draggedIssueId || draggedIssueId === issue.id) return;
              const next = reorderById(issues, draggedIssueId, issue.id);
              setIssues(next);
              setDraggedIssueId(null);
              setDropTargetIssueId(null);
              persistIssueOrder(next);
            }}
            runAction={runAction}
          />
        ))}
      </div>
    </div>
  );
}

type IssueAccordionProps = {
  issue: ComicIssueWithPages;
  issueIndex: number;
  projectId: string;
  pending: boolean;
  draggedIssueId: string | null;
  dropTargetIssueId: string | null;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: () => void;
  runAction: (action: () => Promise<{ error?: string }>) => void;
};

function IssueAccordion({
  issue,
  issueIndex,
  projectId,
  pending,
  draggedIssueId,
  dropTargetIssueId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  runAction,
}: IssueAccordionProps) {
  const [pages, setPages] = useState(issue.pages);
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);
  const [dropTargetPageId, setDropTargetPageId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setPages(issue.pages);
  }, [issue.pages]);

  function persistPageOrder(ordered: typeof pages) {
    startTransition(async () => {
      await reorderComicPages(
        projectId,
        issue.id,
        ordered.map((page) => page.id)
      );
    });
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={
        draggedIssueId === issue.id
          ? "opacity-60"
          : dropTargetIssueId === issue.id
            ? "ring-2 ring-[var(--brand-accent)] ring-offset-2 ring-offset-[var(--brand-bg)]"
            : undefined
      }
    >
      <ProductionAccordion
        title={issue.name}
        count={pages.length}
        defaultExpanded={issueIndex === 0}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span className="cursor-grab text-[var(--brand-text-muted)]">⠿</span>
            <button
              type="button"
              onClick={() => runAction(() => createComicPage(projectId, issue.id))}
              disabled={pending}
              className="rounded-lg border border-[var(--brand-border)] px-2 py-1 text-xs font-medium"
            >
              Add Page
            </button>
            <button
              type="button"
              onClick={() => {
                const next = prompt("Rename issue", issue.name);
                if (next?.trim()) {
                  runAction(() => renameComicIssue(projectId, issue.id, next.trim()));
                }
              }}
              disabled={pending}
              className="rounded-lg px-2 py-1 text-xs font-medium text-[var(--brand-text-secondary)]"
            >
              Rename
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete "${issue.name}" and all pages/panels?`)) {
                  runAction(() => deleteComicIssue(projectId, issue.id));
                }
              }}
              disabled={pending}
              className="rounded-lg px-2 py-1 text-xs font-medium text-[var(--status-danger-text)]"
            >
              Delete
            </button>
          </div>
        }
      >
        {pages.length === 0 ? (
          <p className="text-sm text-[var(--brand-text-muted)]">No pages yet.</p>
        ) : (
          <div className="space-y-3">
            {pages.map((page, pageIndex) => (
              <div
                key={page.id}
                draggable
                onDragStart={() => setDraggedPageId(page.id)}
                onDragEnd={() => {
                  setDraggedPageId(null);
                  setDropTargetPageId(null);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropTargetPageId(page.id);
                }}
                onDrop={() => {
                  if (!draggedPageId || draggedPageId === page.id) return;
                  const next = reorderById(pages, draggedPageId, page.id);
                  setPages(next);
                  setDraggedPageId(null);
                  setDropTargetPageId(null);
                  persistPageOrder(next);
                }}
                className={
                  draggedPageId === page.id
                    ? "opacity-60"
                    : dropTargetPageId === page.id
                      ? "ring-2 ring-[var(--brand-accent)] rounded-xl"
                      : undefined
                }
              >
                <ProductionAccordion
                  title={page.name}
                  count={page.panels.length}
                  defaultExpanded={pageIndex === 0}
                  action={
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="cursor-grab text-[var(--brand-text-muted)]">⠿</span>
                      <button
                        type="button"
                        onClick={() =>
                          runAction(() => createComicPanel(projectId, page.id))
                        }
                        disabled={pending}
                        className="rounded-lg border border-[var(--brand-border)] px-2 py-1 text-xs font-medium"
                      >
                        Add Panel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = prompt("Rename page", page.name);
                          if (next?.trim()) {
                            runAction(() =>
                              renameComicPage(projectId, page.id, next.trim())
                            );
                          }
                        }}
                        disabled={pending}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-[var(--brand-text-secondary)]"
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete "${page.name}" and all panels?`)) {
                            runAction(() => deleteComicPage(projectId, page.id));
                          }
                        }}
                        disabled={pending}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-[var(--status-danger-text)]"
                      >
                        Delete
                      </button>
                    </div>
                  }
                >
                  <ProductionEntityList
                    items={page.panels}
                    onReorder={(orderedIds) =>
                      reorderComicPanels(projectId, page.id, orderedIds)
                    }
                    onRename={(id, name) => renameComicPanel(projectId, id, name)}
                    onDelete={(id) => deleteComicPanel(projectId, id)}
                    emptyMessage="No panels on this page yet."
                  />
                </ProductionAccordion>
              </div>
            ))}
          </div>
        )}
      </ProductionAccordion>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-3 py-2 text-sm text-[var(--status-danger-text)]">
      {message}
    </p>
  );
}
