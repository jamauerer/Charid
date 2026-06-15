import Image from "next/image";
import type { Character } from "@/types/character";

type PublicCharacterCardProps = {
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
  character,
  photoUrl,
}: PublicCharacterCardProps) {
  const metadata = formatMetadata(character);

  return (
    <article className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#0f0f11]">
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={character.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
            <span className="text-[10px] text-zinc-600">No portrait</span>
          </div>
        )}
      </div>
      <div className="px-3 py-2.5">
        <h3 className="truncate text-sm font-bold tracking-tight text-zinc-100">
          {character.name}
        </h3>
        {metadata && (
          <p className="mt-1 truncate text-xs text-zinc-500">{metadata}</p>
        )}
      </div>
    </article>
  );
}
