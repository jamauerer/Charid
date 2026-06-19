"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { WorldBibleViewBundle } from "@/app/actions/world-bible";
import { WorldCoverHero } from "@/components/world-bible/WorldCoverHero";
import { WorldGallery } from "@/components/world-bible/WorldGallery";
import { WorldLocationsSection } from "@/components/world-bible/WorldLocationsSection";
import { WorldMapSection } from "@/components/world-bible/WorldMapSection";
import { WorldMoodboardSection } from "@/components/world-bible/WorldMoodboardSection";
import { WorldOverviewSectionForm } from "@/components/world-bible/WorldOverviewSectionForm";
import { WorldRulesSectionForm } from "@/components/world-bible/WorldRulesSectionForm";
import { WorldCulturesSectionForm } from "@/components/world-bible/WorldCulturesSectionForm";
import { WorldReferenceSection } from "@/components/world-bible/WorldReferenceSection";
import { WorldBibleMetricsHeader } from "@/components/world-bible/WorldBibleMetricsHeader";
import { WorldReferenceChecklist } from "@/components/world-bible/WorldReferenceChecklist";
import { CollapsibleWorkspaceSection } from "@/components/dashboard/CollapsibleWorkspaceSection";
import { CreatorProgressBar } from "@/components/dashboard/CreatorProgressBar";
import { studioEyebrow } from "@/lib/visual-identity";
import { WorldStoriesSection } from "@/app/dashboard/worlds/[id]/WorldStoriesSection";
import { WorldCharactersSection } from "@/app/dashboard/worlds/[id]/WorldCharactersSection";
import { computeWorldCreatorProgress } from "@/lib/world-creator-progress";
import { buildWorldSlotAssignmentMap } from "@/lib/world-slot-assignments";
import type { StoryWithCounts } from "@/types/story";
import type { Character } from "@/types/character";
import type { WorldLocationWithCover } from "@/types/world-location";
import type { WorldMapBundle } from "@/types/world-map";
import type { WorldMoodboardBundle } from "@/types/world-moodboard";

type WorldWorkspaceViewProps = {
  bundle: WorldBibleViewBundle;
  coverUrl: string | null;
  stories: StoryWithCounts[];
  storyCoverUrls: Record<string, string | null>;
  characters: { character: Character; photoUrl: string | null }[];
  locations: WorldLocationWithCover[];
  mapBundle: WorldMapBundle | null;
  moodboardBundle: WorldMoodboardBundle | null;
  migrationError?: string;
};

export function WorldWorkspaceView({
  bundle,
  coverUrl,
  stories,
  storyCoverUrls,
  characters,
  locations,
  mapBundle,
  moodboardBundle,
  migrationError,
}: WorldWorkspaceViewProps) {
  const { world, bible, images, slotAssignments, referenceGraph, scores } =
    bundle;

  const slotMap = useMemo(
    () => buildWorldSlotAssignmentMap(images, slotAssignments),
    [images, slotAssignments]
  );

  const progress = useMemo(
    () =>
      computeWorldCreatorProgress({
        hasCover: Boolean(coverUrl || world.cover_image_path),
        slotMap,
        storyCount: stories.length,
        characterCount: characters.length,
        locationCount: locations.length,
        moodboardItemCount: moodboardBundle?.items.length ?? 0,
        hasMap: Boolean(mapBundle?.imageUrl),
      }),
    [
      coverUrl,
      world.cover_image_path,
      slotMap,
      stories.length,
      characters.length,
      locations.length,
      moodboardBundle?.items.length,
      mapBundle?.imageUrl,
    ]
  );

  const galleryImageOptions = useMemo(
    () =>
      images.map((img) => ({
        id: img.id,
        url: img.url,
        caption: img.caption,
      })),
    [images]
  );

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <Link
        href="/dashboard/worlds"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--brand-text-secondary)] transition hover:text-[var(--brand-text-secondary)]"
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
        Back to Worlds
      </Link>

      {migrationError && (
        <p className="mb-6 rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]">
          {migrationError}
        </p>
      )}

      <div className="mb-8">
        <WorldCoverHero world={world} coverUrl={coverUrl} />
      </div>

      <header className="mb-8 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={studioEyebrow}>World</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--brand-text-secondary)] sm:text-3xl">
              {world.name}
            </h1>
            {world.description ? (
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--brand-text-secondary)]">
                {world.description}
              </p>
            ) : (
              <p className="mt-2 text-sm italic text-[var(--brand-text-secondary)]">
                Add a description when you&apos;re ready — your cover leads the way.
              </p>
            )}
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
              world.is_public
                ? "border border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-neutral-600"
                : "bg-stone-500/15 text-[var(--brand-text-secondary)]"
            }`}
          >
            {world.is_public ? "Public" : "Private"}
          </span>
        </div>
        <CreatorProgressBar items={progress.items} percent={progress.percent} />
      </header>

      <WorldGallery
        worldId={world.id}
        images={images}
        slotAssignments={slotAssignments}
      />

      {mapBundle && (
        <WorldMapSection
          worldId={world.id}
          bundle={mapBundle}
          locations={locations}
          galleryImageOptions={galleryImageOptions}
        />
      )}

      {moodboardBundle && (
        <WorldMoodboardSection
          worldId={world.id}
          bundle={moodboardBundle}
          galleryImages={images}
          slotMap={slotMap}
        />
      )}

      <WorldLocationsSection worldId={world.id} locations={locations} />

      <WorldStoriesSection
        worldId={world.id}
        stories={stories}
        coverUrls={storyCoverUrls}
      />

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          Characters in this world
        </h2>
        <WorldCharactersSection
          worldId={world.id}
          worldName={world.name}
          initialCharacters={characters}
        />
      </section>

      <CollapsibleWorkspaceSection
        title="World details"
        hint="Genre, tone, and overview — for when you want to define the basics."
      >
        <WorldOverviewSectionForm worldId={world.id} bible={bible} />
      </CollapsibleWorkspaceSection>

      <CollapsibleWorkspaceSection
        title="Advanced worldbuilding"
        hint="Rules, cultures, and extra reference assets."
      >
        <div className="space-y-8">
          <WorldRulesSectionForm worldId={world.id} bible={bible} />
          <WorldCulturesSectionForm worldId={world.id} bible={bible} />
          <WorldReferenceSection
            worldId={world.id}
            images={images}
            slotAssignments={slotAssignments}
          />
        </div>
      </CollapsibleWorkspaceSection>

      <CollapsibleWorkspaceSection
        title="Continuity insights"
        hint="Reference coverage and consistency — for when you want to go deeper."
      >
        <div className="space-y-5">
          <WorldBibleMetricsHeader
            scores={scores}
            worldName={world.name}
            genre={bible.genre}
            tone={bible.tone}
          />
          <WorldReferenceChecklist
            graph={referenceGraph}
            scores={scores}
            onNavigate={() => {}}
          />
        </div>
      </CollapsibleWorkspaceSection>
    </div>
  );
}
