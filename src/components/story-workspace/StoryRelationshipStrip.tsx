import Image from "next/image";
import Link from "next/link";
import type { StoryCastBond } from "@/app/actions/story-workspace";
import { formatDirectedRelationship } from "@/lib/relationship-plain-language";

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
      <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-8 text-center">
        <p className="text-sm text-[var(--brand-text-secondary)]">
          No relationships among your cast yet.
        </p>
        <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
          Add relationships on character pages to see them here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ul className="space-y-2">
        {bonds.map(({ relationship, fromCharacter, toCharacter }) => {
          const sentence = formatDirectedRelationship(
            fromCharacter.name,
            toCharacter.name,
            relationship.relationship_type,
            relationship.custom_label
          );

          return (
            <li
              key={relationship.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5"
            >
              <CharacterAvatar
                id={fromCharacter.id}
                name={fromCharacter.name}
                photoUrl={photoUrls[fromCharacter.id] ?? null}
              />
              <p className="min-w-0 flex-1 text-sm text-[var(--brand-text-secondary)]">
                {sentence}
              </p>
              <CharacterAvatar
                id={toCharacter.id}
                name={toCharacter.name}
                photoUrl={photoUrls[toCharacter.id] ?? null}
              />
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-[var(--brand-text-secondary)]">
        Edit relationships on{" "}
        <Link
          href={`/dashboard/characters/${bonds[0]?.fromCharacter.id}?focus=relationships`}
          className="text-[var(--brand-text-secondary)] underline-offset-2 hover:underline"
        >
          character pages
        </Link>
        .
      </p>
    </div>
  );
}
