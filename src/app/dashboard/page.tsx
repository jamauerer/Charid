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

  const count = charactersWithPhotos.length;

  return (
    <div className="min-h-full bg-[#09090b] font-sans text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.18),transparent)]" />

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold shadow-lg shadow-violet-500/20">
              C
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">CharID</h1>
              <p className="text-xs text-zinc-500">Character Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden truncate text-xs text-zinc-500 sm:block">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {error}
          </div>
        )}

        <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Your Characters
              </h2>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs font-medium text-zinc-400">
                {count}
              </span>
            </div>
            <p className="text-sm text-zinc-500">
              Build and manage character profiles for your creative projects.
            </p>
          </div>
          <NewCharacterModal />
        </div>

        {count === 0 && !error ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-6 w-6"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
            <p className="font-medium text-zinc-300">No characters yet</p>
            <p className="mt-1 text-sm text-zinc-500">
              Create your first character profile to get started.
            </p>
          </div>
        ) : (
          <CharacterGrid initialCharacters={charactersWithPhotos} />
        )}
      </main>
    </div>
  );
}
