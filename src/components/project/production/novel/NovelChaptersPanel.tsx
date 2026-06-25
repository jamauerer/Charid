"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createNovelChapter,
  createNovelPart,
  deleteNovelChapter,
  deleteNovelPart,
  renameNovelChapter,
  renameNovelPart,
  reorderNovelChapters,
  reorderNovelParts,
} from "@/app/actions/production/novel";
import { ProductionEntityList } from "@/components/project/production/ProductionEntityList";
import { ProductionUnitCard } from "@/components/project/production/ProductionUnitCard";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { groupNovelChaptersByPart } from "@/lib/production-reading-order";
import { novelChapterWorkspacePath } from "@/lib/production-routes";
import { studioBtnPrimarySm } from "@/lib/visual-identity";
import type { NovelPartWithChapters } from "@/types/production/novel";

type NovelChaptersPanelProps = {
  projectId: string;
  parts: NovelPartWithChapters[];
};

export function NovelChaptersPanel({ projectId, parts }: NovelChaptersPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const groups = groupNovelChaptersByPart(parts);
  const hasChapters = groups.some((group) => group.chapters.length > 0);

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

  if (!hasChapters && parts.length === 0) {
    return (
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <StudioEmptyState
          headline="No manuscript yet"
          description="Start organizing your novel into parts and chapters."
        />
        <button
          type="button"
          onClick={() => runAction(() => createNovelPart(projectId))}
          disabled={pending}
          className={studioBtnPrimarySm}
        >
          Start manuscript
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${pending ? "opacity-80" : ""}`}>
      {error && <ErrorBanner message={error} />}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[var(--brand-text-muted)]">
          Open a chapter to work on your manuscript. Story scenes stay in your
          Story Layer.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runAction(() => createNovelPart(projectId))}
            disabled={pending}
            className="rounded-lg border border-[var(--brand-border)] px-2 py-1 text-xs font-medium"
          >
            Add part
          </button>
          {parts.length === 1 && (
            <button
              type="button"
              onClick={() => runAction(() => createNovelChapter(projectId, parts[0].id))}
              disabled={pending}
              className={studioBtnPrimarySm}
            >
              Add chapter
            </button>
          )}
        </div>
      </div>

      {groups.map((group) => (
        <section key={group.partId} className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            {group.partName}
          </h3>
          {group.chapters.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--brand-border)] px-4 py-6 text-center">
              <p className="text-sm text-[var(--brand-text-muted)]">
                No chapters in this part yet.
              </p>
              <button
                type="button"
                onClick={() => runAction(() => createNovelChapter(projectId, group.partId))}
                disabled={pending}
                className={`mt-3 ${studioBtnPrimarySm}`}
              >
                Add chapter to {group.partName}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.chapters.map((chapter) => (
                  <ProductionUnitCard
                    key={chapter.id}
                    href={novelChapterWorkspacePath(projectId, chapter.id)}
                    indexLabel={`Chapter ${chapter.chapterNumber}`}
                    title={chapter.name}
                    subtitle={chapter.partName}
                    meta="Manuscript chapter"
                    status={chapter.status}
                  />
                ))}
              </div>
              <details className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
                  Reorder & manage chapters
                </summary>
                <div className="mt-3">
                  <ProductionEntityList
                    items={group.chapters.map((chapter) => ({
                      id: chapter.id,
                      name: chapter.name,
                    }))}
                    onReorder={(orderedIds) =>
                      reorderNovelChapters(projectId, group.partId, orderedIds)
                    }
                    onRename={(id, name) => renameNovelChapter(projectId, id, name)}
                    onDelete={(id) => deleteNovelChapter(projectId, id)}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      runAction(() => createNovelChapter(projectId, group.partId))
                    }
                    disabled={pending}
                    className={`mt-3 ${studioBtnPrimarySm}`}
                  >
                    Add chapter to {group.partName}
                  </button>
                </div>
              </details>
            </>
          )}
        </section>
      ))}

      {parts.length > 0 && (
        <details className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Book structure
          </summary>
          <p className="mt-2 text-xs text-[var(--brand-text-muted)]">
            Parts organize your manuscript in reading order.
          </p>
          <div className="mt-3">
            <ProductionEntityList
              items={parts.map((part) => ({ id: part.id, name: part.name }))}
              onReorder={(orderedIds) => reorderNovelParts(projectId, orderedIds)}
              onRename={(id, name) => renameNovelPart(projectId, id, name)}
              onDelete={(id) => deleteNovelPart(projectId, id)}
            />
          </div>
        </details>
      )}
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
