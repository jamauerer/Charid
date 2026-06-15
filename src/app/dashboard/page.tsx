import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCharacters, getCharacterPhotoUrl } from "@/app/actions/characters";
import { LogoutButton } from "@/components/LogoutButton";
import { CharacterGrid } from "./CharacterGrid";
import { NewCharacterModal } from "./NewCharacterModal";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { characters, error } = await getCharacters();

  const charactersWithPhotos = await Promise.all(
    characters.map(async (character) => ({
      character,
      photoUrl: await getCharacterPhotoUrl(character.photo_path),
    }))
  );

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">CharID</h1>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
            {error}
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Your Characters</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Create and manage character profiles with photos.
            </p>
          </div>
          <NewCharacterModal />
        </div>

        {charactersWithPhotos.length === 0 && !error ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
              No characters yet
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Click &ldquo;New Character&rdquo; to create your first one.
            </p>
          </div>
        ) : (
          <CharacterGrid initialCharacters={charactersWithPhotos} />
        )}
      </main>
    </div>
  );
}
