import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/types/character";
import { getPublicCharacterPath } from "@/lib/public-profile";

type PublicCharacterCardProps = {
  username: string;
  character: Character;
  photoUrl: string | null;
};

function formatMetadata(character: Character): string | null {
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
    <article className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#0f0f11] transition hover:border-white/10 hover:bg-[#111113]">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-zinc-900">
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
          <div className="flex h-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
            <span className="text-[10px] text-zinc-600">No portrait</span>
          </div>
        )}
      </Link>
      <div className="px-3 py-2.5">
        <Link href={href} className="block">
          <h3 className="truncate text-sm font-bold tracking-tight text-zinc-100 transition hover:text-violet-300">
            {character.name}
          </h3>
        </Link>
        {metadata && (
          <p className="mt-1 truncate text-xs text-zinc-500">{metadata}</p>
        )}
      </div>
    </article>
  );
}
