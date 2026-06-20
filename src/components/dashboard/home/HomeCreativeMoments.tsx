import Image from "next/image";
import Link from "next/link";
import type { HomeCreativeMoment } from "@/app/actions/home-page";
import {
  studioEmptyArt,
  studioSectionHeading,
} from "@/lib/visual-identity";

type HomeCreativeMomentsProps = {
  moments: HomeCreativeMoment[];
};

const KIND_LABELS: Record<HomeCreativeMoment["kind"], string> = {
  scene: "Scene",
  chapter: "Chapter",
  story: "Story",
  character: "Character",
  world: "Setting",
};

export function HomeCreativeMoments({ moments }: HomeCreativeMomentsProps) {
  if (moments.length === 0) return null;

  return (
    <section aria-labelledby="home-moments-heading">
      <h2 id="home-moments-heading" className={`mb-3 ${studioSectionHeading}`}>
        Recent
      </h2>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {moments.map((moment) => (
          <Link
            key={`${moment.kind}-${moment.id}`}
            href={moment.href}
            className="group overflow-hidden rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface)] transition hover:border-[var(--brand-ui-accent)]/30"
          >
            <div className="relative aspect-square overflow-hidden bg-[var(--studio-empty-fill)]">
              {moment.imageUrl ? (
                <Image
                  src={moment.imageUrl}
                  alt={moment.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className={studioEmptyArt}>
                  <span className="text-[9px] uppercase tracking-wide">
                    {KIND_LABELS[moment.kind]}
                  </span>
                </div>
              )}
            </div>
            <div className="px-1.5 py-1.5">
              <p className="truncate text-[11px] font-medium text-[var(--foreground)]">
                {moment.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
