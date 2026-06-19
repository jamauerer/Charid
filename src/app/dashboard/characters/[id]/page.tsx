import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCharacterBibleBundle } from "@/app/actions/character-bible";
import { getLatestCharacterVisionFeedback } from "@/app/actions/creator-feedback";
import { getStoriesForCharacter } from "@/app/actions/stories";
import {
  getCharacterRelationships,
  getRelationshipPhotoUrls,
} from "@/app/actions/character-relationships";
import { CharacterWorkspaceView } from "@/components/character-bible/CharacterWorkspaceView";

type CharacterDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CharacterDetailPage({
  params,
}: CharacterDetailPageProps) {
  const { id } = await params;
  const { bundle, error } = await getCharacterBibleBundle(id);

  if (error === "You must be logged in.") {
    redirect("/login");
  }

  if (!bundle) {
    if (error?.includes("Character not found")) {
      notFound();
    }

    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <Link
          href="/dashboard/characters"
          className="text-sm text-[var(--brand-text-secondary)] transition hover:text-[var(--brand-text-secondary)]"
        >
          ← Back to Characters
        </Link>
        <p className="mt-6 rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]">
          {error ??
            "Could not load Character Bible. Run the character_bible migration in Supabase."}
        </p>
      </div>
    );
  }

  const { entries: storyEntries } = await getStoriesForCharacter(id);
  const { feedback: latestFeedback } = await getLatestCharacterVisionFeedback(id);
  const { entries: relationshipEntries, error: relationshipsError } =
    await getCharacterRelationships(id);
  const relationshipPhotoUrls =
    await getRelationshipPhotoUrls(relationshipEntries);

  const migrationError =
    relationshipsError ??
    (error?.includes("character_bible") ||
    error?.includes("character_image_slot_assignments")
      ? error
      : undefined);

  return (
    <CharacterWorkspaceView
      bundle={{
        character: bundle.character,
        bible: bundle.bible,
        images: bundle.images,
        slotAssignments: bundle.slotAssignments,
        referenceGraph: bundle.referenceGraph,
        scores: bundle.scores,
        recommendations: bundle.recommendations,
      }}
      storyEntries={storyEntries}
      relationshipEntries={relationshipEntries}
      relationshipPhotoUrls={relationshipPhotoUrls}
      latestFeedback={latestFeedback}
      migrationError={migrationError}
    />
  );
}
