import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCharacterPhotoUrl } from "@/app/actions/characters";
import { getCharactersByWorldId, getWorldById } from "@/app/actions/worlds";
import {
  getStoryById,
  getStoryCharacters,
} from "@/app/actions/stories";
import { EditStoryForm } from "@/app/dashboard/EditStoryForm";
import { StoryCharacterSection } from "@/components/StoryCharacterSection";
import { StoryStatusBadge } from "@/components/StoryStatusBadge";

type StoryDetailPageProps = {
  params: Promise<{ id: string; storyId: string }>;
};

export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { id: worldId, storyId } = await params;

  const { world, error: worldError } = await getWorldById(worldId);
  if (worldError === "You must be logged in.") {
    redirect("/login");
  }
  if (!world) {
    notFound();
  }

  const { story, error: storyError } = await getStoryById(worldId, storyId);
  if (!story) {
    notFound();
  }
  if (storyError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-amber-300">
        {storyError}
      </div>
    );
  }

  const { entries } = await getStoryCharacters(storyId);
  const { characters: worldCharacters } = await getCharactersByWorldId(worldId);

  const photoUrls: Record<string, string | null> = {};
  await Promise.all(
    entries.map(async ({ character }) => {
      photoUrls[character.id] = await getCharacterPhotoUrl(character.photo_path);
    })
  );

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <div className="mb-6">
        <Link
          href={`/dashboard/worlds/${worldId}`}
          className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
          Back to {world.name}
        </Link>
      </div>

      <div className="mb-8 rounded-xl border border-white/[0.06] bg-[#0f0f11] p-5 sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-400/80">
          Story
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            {story.title}
          </h1>
          <StoryStatusBadge status={story.status} />
        </div>
        {story.summary?.trim() ? (
          <p className="mt-4 max-w-3xl whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-300">
            {story.summary}
          </p>
        ) : (
          <p className="mt-4 text-sm italic text-zinc-600">No summary yet.</p>
        )}
      </div>

      <div className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Characters in this Story
          </h2>
          <StoryCharacterSection
            storyId={storyId}
            initialEntries={entries}
            availableCharacters={worldCharacters}
            photoUrls={photoUrls}
          />
        </section>

        <aside className="rounded-xl border border-white/[0.06] bg-[#0f0f11] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Edit Details
          </h2>
          <EditStoryForm story={story} worldId={worldId} />
        </aside>
      </div>
    </div>
  );
}
