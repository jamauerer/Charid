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
    <div className="relative min-h-dvh bg-background font-sans text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(120,119,198,0.15),transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(99,102,241,0.06),transparent)]" />

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold shadow-md shadow-violet-500/25">
              C
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-none tracking-tight">
                CharID
              </h1>
              <p className="mt-0.5 text-[11px] text-zinc-500">
                Character Studio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="hidden max-w-[180px] truncate text-[11px] text-zinc-500 md:block">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-5">
        {error && (
          <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-200">
            {error}
          </div>
        )}

        <div className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                Your Characters
              </h2>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-zinc-400">
                {count}
              </span>
            </div>
            <NewCharacterModal />
          </div>
          <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
            Build and manage character profiles for your creative projects.
          </p>
        </div>

        {count === 0 && !error ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
            <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-300">No characters yet</p>
            <p className="mt-1 text-xs text-zinc-500">
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
