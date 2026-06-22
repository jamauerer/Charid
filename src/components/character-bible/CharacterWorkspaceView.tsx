"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { CharacterBibleViewBundle } from "@/app/actions/character-bible";
import { CharacterGallery } from "@/components/character-bible/CharacterGallery";
import { CharacterPersonalitySection } from "@/components/character-bible/CharacterPersonalitySection";
import { CharacterRelationshipsSection } from "@/components/character-bible/CharacterRelationshipsSection";
import { CharacterStoriesPanel } from "@/components/character-bible/CharacterStoriesPanel";
import { IdentitySectionForm } from "@/components/character-bible/IdentitySectionForm";
import { DetailsSectionForm } from "@/components/character-bible/DetailsSectionForm";
import { CharacterBibleMetricsHeader } from "@/components/character-bible/CharacterBibleMetricsHeader";
import { CharacterBibleRecommendations } from "@/components/character-bible/CharacterBibleRecommendations";
import { ReferenceGraphInspector } from "@/components/character-bible/ReferenceGraphInspector";
import { CharacterBibleFeedback } from "@/components/character-bible/CharacterBibleFeedback";
import { CollapsibleWorkspaceSection } from "@/components/dashboard/CollapsibleWorkspaceSection";
import { CreatorProgressBar } from "@/components/dashboard/CreatorProgressBar";
import { studioEyebrow } from "@/lib/visual-identity";
import { assignableRolesForArchetype } from "@/lib/assignable-image-roles";
import { computeCharacterCreatorProgress } from "@/lib/character-creator-progress";
import { buildSlotAssignmentMap } from "@/lib/character-slot-assignments";
import { IDENTITY_ARCHETYPE_LABELS } from "@/types/identity-archetype";
import type { CharacterStoryEntry } from "@/app/actions/stories";
import type { CreatorFeedback } from "@/types/creator-feedback";
import type { CharacterRelationshipEntry } from "@/types/character-relationship";

type CharacterWorkspaceViewProps = {
  bundle: CharacterBibleViewBundle;
  storyEntries: CharacterStoryEntry[];
  relationshipEntries: CharacterRelationshipEntry[];
  relationshipPhotoUrls: Record<string, string | null>;
  latestFeedback?: CreatorFeedback | null;
  migrationError?: string;
};

export function CharacterWorkspaceView({
  bundle,
  storyEntries,
  relationshipEntries,
  relationshipPhotoUrls,
  latestFeedback = null,
  migrationError,
}: CharacterWorkspaceViewProps) {
  const { character, bible, images, slotAssignments, referenceGraph, scores, recommendations } =
    bundle;

  const archetypeLabel =
    IDENTITY_ARCHETYPE_LABELS[bible.identity_archetype] ?? bible.identity_archetype;

  const assignableRoles = useMemo(
    () => assignableRolesForArchetype(bible.identity_archetype),
    [bible.identity_archetype]
  );

  const slotMap = useMemo(
    () => buildSlotAssignmentMap(images, slotAssignments),
    [images, slotAssignments]
  );

  const progress = useMemo(
    () =>
      computeCharacterCreatorProgress({
        slotMap,
        corePersonality: character.core_personality,
        storyCount: storyEntries.length,
        relationshipCount: relationshipEntries.length,
        includeTurnaround: assignableRoles.includes("turnaround_front"),
        includeExpressions: assignableRoles.includes("expression_neutral"),
      }),
    [
      slotMap,
      character.core_personality,
      storyEntries.length,
      relationshipEntries.length,
      assignableRoles,
    ]
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <Link
        href="/dashboard/characters"
        className="inline-flex items-center gap-1 text-sm text-[var(--brand-text-secondary)] transition hover:text-[var(--brand-text-secondary)]"
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
        Back to Characters
      </Link>

      {migrationError && (
        <p className="rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]">
          {migrationError}
        </p>
      )}

      <CharacterGallery
        characterId={character.id}
        portraitFocalY={character.portrait_focal_y}
        images={images}
        slotAssignments={slotAssignments}
        identityArchetype={bible.identity_archetype}
      />

      <header className="space-y-4">
        <div>
          <p className={studioEyebrow}>Character</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--brand-text-secondary)] sm:text-3xl">
            {character.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
            {character.species || "Your character"}
            {archetypeLabel ? ` · ${archetypeLabel}` : ""}
          </p>
        </div>
        <CreatorProgressBar items={progress.items} percent={progress.percent} />
      </header>

      <CharacterPersonalitySection
        characterId={character.id}
        initialPersonality={character.core_personality}
      />

      <CharacterRelationshipsSection
        characterId={character.id}
        characterName={character.name}
        entries={relationshipEntries}
        photoUrls={relationshipPhotoUrls}
      />

      <CharacterStoriesPanel
        worldId={character.world_id}
        projectId={character.project_id}
        entries={storyEntries}
      />

      <CollapsibleWorkspaceSection
        title="Character details"
        hint="Backstory, appearance, and identity fields — when you're ready to go deeper."
      >
        <div className="space-y-8">
          <IdentitySectionForm character={character} bible={bible} />
          <DetailsSectionForm characterId={character.id} bible={bible} />
        </div>
      </CollapsibleWorkspaceSection>

      <CollapsibleWorkspaceSection
        title="Continuity insights"
        hint="Reference coverage and suggestions — for when you want to go deeper."
      >
        <div className="space-y-5">
          <CharacterBibleMetricsHeader
            scores={scores}
            characterName={character.name}
            archetypeLabel={archetypeLabel}
            creativeFormat={bible.creative_format}
          />
          <ReferenceGraphInspector
            graph={referenceGraph}
            scores={scores}
            onNavigate={() => {}}
          />
          <CharacterBibleRecommendations
            recommendations={recommendations}
            onNavigate={() => {}}
          />
          <CharacterBibleFeedback
            characterId={character.id}
            initialFeedback={latestFeedback}
          />
        </div>
      </CollapsibleWorkspaceSection>
    </div>
  );
}
