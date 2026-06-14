import Image from "next/image";
import type { Character } from "@/types/character";
import { getCharacterPhotoUrl } from "@/app/actions/characters";

type CharacterCardProps = {
  character: Character;
};

export async function CharacterCard({ character }: CharacterCardProps) {
  const photoUrl = await getCharacterPhotoUrl(character.photo_path);

  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={character.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            No photo
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {character.name}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
          {character.physical_description}
        </p>
        <p className="mt-3 text-xs text-zinc-400">
          Created{" "}
          {new Date(character.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </article>
  );
}
