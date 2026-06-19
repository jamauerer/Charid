import { redirect, notFound } from "next/navigation";
import { getCharacterPhotoUrl } from "@/app/actions/characters";
import {
  getCharactersByWorldId,
  getWorldById,
  getWorldCoverUrl,
} from "@/app/actions/worlds";
import { getWorldBibleBundle } from "@/app/actions/world-bible";
import { getStoriesByWorldId } from "@/app/actions/stories";
import { getStoryCoverUrls } from "@/app/actions/story-images";
import { getWorldLocations } from "@/app/actions/world-locations";
import { getWorldMapBundle } from "@/app/actions/world-maps";
import { getWorldMoodboardBundle } from "@/app/actions/world-moodboards";
import { WorldWorkspaceView } from "@/components/world-bible/WorldWorkspaceView";
import { WorldStoriesSection } from "./WorldStoriesSection";
import { WorldCharactersSection } from "./WorldCharactersSection";

type WorldDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorldDetailPage({ params }: WorldDetailPageProps) {
  const { id } = await params;
  const { world, error } = await getWorldById(id);

  if (error === "You must be logged in.") {
    redirect("/login");
  }

  if (!world) {
    notFound();
  }

  const { bundle, error: bibleError } = await getWorldBibleBundle(id);

  const coverUrl = await getWorldCoverUrl(world.cover_image_path);
  const { characters } = await getCharactersByWorldId(id);
  const { stories } = await getStoriesByWorldId(id);
  const storyCoverUrls = await getStoryCoverUrls(stories.map((story) => story.id));

  const charactersWithPhotos = await Promise.all(
    characters.map(async (character) => ({
      character,
      photoUrl: await getCharacterPhotoUrl(character.photo_path),
    }))
  );

  const { locations: worldLocations, error: locationsError } =
    await getWorldLocations(id);
  const { bundle: mapBundle, error: mapError } = await getWorldMapBundle(id);
  const { bundle: moodboardBundle, error: moodboardError } =
    await getWorldMoodboardBundle(id);

  const foundationError = locationsError ?? mapError ?? moodboardError;

  const migrationError =
    foundationError ??
    (bibleError?.includes("world_bible") ||
    bibleError?.includes("world_image_slot_assignments") ||
    bibleError?.includes("character_relationships")
      ? bibleError
      : undefined);

  if (!bundle) {
    return (
      <div className="mx-auto w-full max-w-[1280px]">
        {bibleError && (
          <p className="mb-10 rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]">
            {bibleError}
          </p>
        )}
        <WorldStoriesSection
          worldId={id}
          stories={stories}
          coverUrls={storyCoverUrls}
        />
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Characters
          </h2>
          <WorldCharactersSection
            worldId={id}
            worldName={world.name}
            initialCharacters={charactersWithPhotos}
          />
        </section>
      </div>
    );
  }

  return (
    <WorldWorkspaceView
      bundle={{
        world: bundle.world,
        bible: bundle.bible,
        images: bundle.images,
        slotAssignments: bundle.slotAssignments,
        referenceGraph: bundle.referenceGraph,
        scores: bundle.scores,
      }}
      coverUrl={coverUrl}
      stories={stories}
      storyCoverUrls={storyCoverUrls}
      characters={charactersWithPhotos}
      locations={worldLocations}
      mapBundle={mapBundle}
      moodboardBundle={moodboardBundle}
      migrationError={migrationError}
    />
  );
}
