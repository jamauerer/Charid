"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCharacterRelationship } from "@/app/actions/character-relationships";
import { AddRelationshipModal } from "@/components/character-bible/AddRelationshipModal";
import { formatRelationshipForViewer } from "@/lib/relationship-plain-language";
import type { CharacterRelationshipEntry } from "@/types/character-relationship";

type CharacterRelationshipsSectionProps = {
  characterId: string;
  characterName: string;
  entries: CharacterRelationshipEntry[];
  photoUrls: Record<string, string | null>;
};

export function CharacterRelationshipsSection({
  characterId,
  characterName,
  entries,
  photoUrls,
}: CharacterRelationshipsSectionProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const linkedIds = entries.map((e) => e.otherCharacter.id);

  function handleDelete(relationshipId: string) {
    setPendingId(relationshipId);
    startTransition(async () => {
      await deleteCharacterRelationship(relationshipId, characterId);
      setPendingId(null);
      router.refresh();
    });
  }

  return (
    <section id="character-relationships" className="mb-10 scroll-mt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Relationships
          </h2>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            Who is this character connected to?
          </p>
        </div>
        <AddRelationshipModal
          characterId={characterId}
          characterName={characterName}
          excludeCharacterIds={linkedIds}
        />
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-8 text-center">
          <p className="text-sm text-[var(--brand-text-secondary)]">No relationships yet.</p>
          <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
            Friend · Rival · Mentor · Parent · Companion · Daemon
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {entries.map(({ relationship, direction, otherCharacter }) => {
            const label = formatRelationshipForViewer(
              characterName,
              otherCharacter.name,
              relationship.relationship_type,
              direction,
              relationship.custom_label
            );
            const photoUrl = photoUrls[otherCharacter.id];

            return (
              <li
                key={relationship.id}
                className="flex items-center gap-3 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3"
              >
                <Link
                  href={`/dashboard/characters/${otherCharacter.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3 transition hover:opacity-90"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[var(--brand-border)] bg-[var(--studio-empty-fill)]">
                    {photoUrl ? (
                      <Image
                        src={photoUrl}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[var(--brand-text-secondary)]">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--brand-text-secondary)]">
                      {otherCharacter.name}
                    </p>
                    <p className="text-xs text-neutral-600/80">{label}</p>
                    {relationship.notes && (
                      <p className="mt-0.5 truncate text-xs text-[var(--brand-text-secondary)]">
                        {relationship.notes}
                      </p>
                    )}
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(relationship.id)}
                  disabled={pendingId === relationship.id}
                  className="shrink-0 rounded-md px-2 py-1 text-xs text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--status-danger-text)] disabled:opacity-50"
                  aria-label={`Remove relationship with ${otherCharacter.name}`}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
