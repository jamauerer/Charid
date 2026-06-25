import Link from "next/link";
import type { LibrarySearchResults } from "@/app/actions/library";
import { formatLibraryDate } from "@/components/library/LibraryToolbar";
import { studioCardSurface } from "@/lib/visual-identity";

type LibrarySearchResultsViewProps = {
  results: LibrarySearchResults;
};

type SearchRow = {
  key: string;
  title: string;
  href: string;
  kind: string;
  projectTitle: string | null;
  projectHref: string | null;
  storyTitle: string | null;
  storyHref: string | null;
  meta?: string;
};

export function LibrarySearchResultsView({ results }: LibrarySearchResultsViewProps) {
  const rows: { title: string; items: SearchRow[] }[] = [];

  if (results.projects.length > 0) {
    rows.push({
      title: "Projects",
      items: results.projects.map((project) => ({
        key: project.id,
        title: project.title,
        href: project.href,
        kind: "Project",
        projectTitle: project.title,
        projectHref: project.href,
        storyTitle: null,
        storyHref: null,
        meta: formatLibraryDate(project.updatedAt),
      })),
    });
  }

  if (results.characters.length > 0) {
    rows.push({
      title: "Characters",
      items: results.characters.map((character) => ({
        key: character.id,
        title: character.name,
        href: character.href,
        kind: "Character",
        projectTitle: character.project?.title ?? null,
        projectHref: character.project?.href ?? null,
        storyTitle: character.storyTitles[0] ?? null,
        storyHref: character.stories[0]?.href ?? null,
        meta:
          character.storyCount > 0
            ? `${character.storyCount} stor${character.storyCount === 1 ? "y" : "ies"}`
            : undefined,
      })),
    });
  }

  if (results.stories.length > 0) {
    rows.push({
      title: "Stories",
      items: results.stories.map((story) => ({
        key: story.id,
        title: story.title,
        href: story.href,
        kind: "Story",
        projectTitle: story.project?.title ?? null,
        projectHref: story.project?.href ?? null,
        storyTitle: story.title,
        storyHref: story.href,
        meta: story.status,
      })),
    });
  }

  if (results.scenes.length > 0) {
    rows.push({
      title: "Scenes",
      items: results.scenes.map((scene) => ({
        key: scene.id,
        title: scene.title,
        href: scene.href,
        kind: "Scene",
        projectTitle: scene.project?.title ?? null,
        projectHref: scene.project?.href ?? null,
        storyTitle: scene.storyTitle,
        storyHref: scene.storyHref,
        meta: `#${scene.timelinePosition}`,
      })),
    });
  }

  if (results.assets.length > 0) {
    rows.push({
      title: "Assets",
      items: results.assets.map((asset) => ({
        key: `${asset.assetType}-${asset.id}`,
        title: asset.name,
        href: asset.href,
        kind: asset.assetType,
        projectTitle: asset.project?.title ?? null,
        projectHref: asset.project?.href ?? null,
        storyTitle: asset.storyTitles[0] ?? null,
        storyHref: null,
        meta: asset.assetType,
      })),
    });
  }

  if (results.references.length > 0) {
    rows.push({
      title: "Reference Images",
      items: results.references.map((reference) => ({
        key: reference.id,
        title: reference.characterName,
        href: reference.href,
        kind: "Reference",
        projectTitle: reference.project?.title ?? null,
        projectHref: reference.project?.href ?? null,
        storyTitle: null,
        storyHref: null,
        meta: reference.tags.join(", ") || "Reference",
      })),
    });
  }

  const total = rows.reduce((sum, group) => sum + group.items.length, 0);

  if (!results.query) {
    return (
      <p className="text-sm text-[var(--brand-text-muted)]">
        Enter a search term above to find characters, stories, scenes, assets, and more.
      </p>
    );
  }

  if (total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-8 text-center">
        <p className="text-sm font-medium text-[var(--foreground)]">
          No results for &ldquo;{results.query}&rdquo;
        </p>
        <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
          Try a different name, project, or tag.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--brand-text-secondary)]">
        {total} result{total === 1 ? "" : "s"} for &ldquo;{results.query}&rdquo;
      </p>

      {rows.map((group) => (
        <SearchGroup key={group.title} title={group.title} items={group.items} />
      ))}
    </div>
  );
}

function SearchGroup({ title, items }: { title: string; items: SearchRow[] }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
        {title}
        <span className="ml-2 font-normal text-[var(--brand-text-muted)]">({items.length})</span>
      </h2>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.key}>
            <div
              className={`library-search-result grid gap-2 px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${studioCardSurface}`}
              data-library-kind={item.kind.toLowerCase()}
              data-library-id={item.key}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--foreground)]">{item.title}</p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-[var(--brand-text-muted)]">
                  <span>
                    Project:{" "}
                    {item.projectHref ? (
                      <Link
                        href={item.projectHref}
                        className="font-medium text-[var(--brand-text-secondary)] hover:text-[var(--foreground)]"
                      >
                        {item.projectTitle}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </span>
                  {item.storyTitle && (
                    <span>
                      Story:{" "}
                      {item.storyHref ? (
                        <Link
                          href={item.storyHref}
                          className="font-medium text-[var(--brand-text-secondary)] hover:text-[var(--foreground)]"
                        >
                          {item.storyTitle}
                        </Link>
                      ) : (
                        item.storyTitle
                      )}
                    </span>
                  )}
                  {item.meta && <span>{item.meta}</span>}
                </div>
              </div>
              <Link
                href={item.href}
                className="inline-flex shrink-0 items-center justify-center rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--brand-accent)] transition hover:border-[var(--brand-accent)]"
              >
                Quick open
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
