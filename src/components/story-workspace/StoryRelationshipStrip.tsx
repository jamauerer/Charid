import Image from "next/image";
import Link from "next/link";
import type { StoryCastBond } from "@/app/actions/story-workspace";
import { studioWarmChip } from "@/lib/visual-identity";

type StoryRelationshipStripProps = {
  bonds: StoryCastBond[];
  photoUrls: Record<string, string | null>;
};

function CharacterAvatar({
  id,
  name,
  photoUrl,
}: {
  id: string;
  name: string;
  photoUrl: string | null;
}) {
  return (
    <Link
      href={`/dashboard/characters/${id}`}
      className="flex shrink-0 items-center gap-2 transition hover:opacity-90"
      title={name}
    >
      <div className="relative h-8 w-8 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--brand-text-secondary)]">
            ?
          </div>
        )}
      </div>
      <span className="hidden max-w-[80px] truncate text-xs text-[var(--brand-text-secondary)] sm:inline">
        {name}
      </span>
    </Link>
  );
}

export function StoryRelationshipStrip({
  bonds,
  photoUrls,
}: StoryRelationshipStripProps) {
  if (bonds.length === 0) {
    return (
      <div className="mt-5 border-t border-[var(--brand-border)] pt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          Connections among your cast
        </h3>
        <p className="mt-2 text-sm text-[var(--brand-text-secondary)]">
          Add relationships on character pages to see cast dynamics here.
        </p>
        <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
          Friend · Rival · Mentor · Parent · Companion · Daemon
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 border-t border-[var(--brand-border)] pt-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
        Connections among your cast
      </h3>
      <ul className="mt-3 space-y-2">
        {bonds.map(({ relationship, fromCharacter, toCharacter, label }) => (
          <li
            key={relationship.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5"
          >
            <CharacterAvatar
              id={fromCharacter.id}
              name={fromCharacter.name}
              photoUrl={photoUrls[fromCharacter.id] ?? null}
            />
            <span className={studioWarmChip}>
              {label}
            </span>
            <CharacterAvatar
              id={toCharacter.id}
              name={toCharacter.name}
              photoUrl={photoUrls[toCharacter.id] ?? null}
            />
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-[var(--brand-text-secondary)]">
        Edit relationships on{" "}
        <Link
          href={`/dashboard/characters/${bonds[0]?.fromCharacter.id}?focus=relationships`}
          className="text-[var(--brand-text-secondary)] underline-offset-2 hover:text-[var(--brand-text-secondary)] hover:underline"
        >
          character pages
        </Link>
        .
      </p>
    </div>
  );
}
