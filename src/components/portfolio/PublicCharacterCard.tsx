import Image from "next/image";
import Link from "next/link";
import type { CharacterDisplay } from "@/types/character";
import { getPublicCharacterPath } from "@/lib/public-profile";

type PublicCharacterCardProps = {
  username: string;
  character: CharacterDisplay;
  photoUrl: string | null;
};

function formatMetadata(character: CharacterDisplay): string | null {
  const parts = [character.gender, character.age, character.location].filter(
    Boolean
  ) as string[];
  return parts.length > 0 ? parts.join(" • ") : null;
}

export function PublicCharacterCard({
  username,
  character,
  photoUrl,
}: PublicCharacterCardProps) {
  const metadata = formatMetadata(character);
  const href = getPublicCharacterPath(username, character.id);

  return (
    <article className="overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] transition hover:border-[var(--brand-border)] hover:bg-[var(--brand-sidebar)]">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-[var(--studio-empty-fill)]">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={character.name}
            fill
            className="object-cover transition duration-300 hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 bg-[var(--studio-empty-fill)]">
            <span className="text-[10px] text-[var(--brand-text-secondary)]">No portrait</span>
          </div>
        )}
      </Link>
      <div className="px-3 py-2.5">
        <Link href={href} className="block">
          <h3 className="truncate text-sm font-bold tracking-tight text-[var(--brand-text-secondary)] transition hover:text-neutral-600">
            {character.name}
          </h3>
        </Link>
        {metadata && (
          <p className="mt-1 truncate text-xs text-[var(--brand-text-secondary)]">{metadata}</p>
        )}
      </div>
    </article>
  );
}
