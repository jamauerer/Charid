import Image from "next/image";
import Link from "next/link";
import type { HomeStudioItem } from "@/app/actions/home-studio";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { STUDIO_EMPTY_COPY } from "@/lib/studio-empty-copy";
import { studioEmptyArt } from "@/lib/visual-identity";

type HomeRecentWorkProps = {
  items: HomeStudioItem[];
};

const TYPE_LABELS: Record<HomeStudioItem["type"], string> = {
  story: "Story",
  character: "Character",
  world: "World",
};

export function HomeRecentWork({ items }: HomeRecentWorkProps) {
  if (items.length === 0) {
    return (
      <StudioEmptyState
        headline={STUDIO_EMPTY_COPY.studio.headline}
        description={STUDIO_EMPTY_COPY.studio.description}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <Link
          key={`${item.type}-${item.id}`}
          href={item.href}
          className="group overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] shadow-sm transition hover:border-[var(--status-info-border)] hover:shadow-md "
        >
          <div className="relative aspect-square bg-[var(--studio-empty-fill)]">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                unoptimized
              />
            ) : (
              <div className={studioEmptyArt}>
                <span className="text-[10px] uppercase tracking-wide text-[var(--brand-text-secondary)]">
                  {TYPE_LABELS[item.type]}
                </span>
              </div>
            )}
            <span className="absolute left-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-neutral-600/90 backdrop-blur-sm">
              {TYPE_LABELS[item.type]}
            </span>
          </div>
          <div className="px-2.5 py-2">
            <p className="truncate text-xs font-semibold text-[var(--foreground)] group-hover:text-neutral-700 [data-theme=sunset-dark]:group-hover:text-neutral-900">
              {item.title}
            </p>
            {item.subtitle && (
              <p className="mt-0.5 truncate text-[10px] text-[var(--brand-text-secondary)]">
                {item.subtitle}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
