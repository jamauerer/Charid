"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormModalShell } from "@/components/dashboard/FormModalShell";
import { getCharactersForPicker } from "@/app/actions/characters";
import { createCharacterRelationship } from "@/app/actions/character-relationships";
import {
  RELATIONSHIP_TYPE_DEFS,
  RELATIONSHIP_TYPES,
  type RelationshipType,
} from "@/lib/relationship-types";

type AddRelationshipModalProps = {
  characterId: string;
  excludeCharacterIds?: string[];
};

export function AddRelationshipModal({
  characterId,
  excludeCharacterIds = [],
}: AddRelationshipModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [characters, setCharacters] = useState<
    { id: string; name: string; world_name: string | null }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toCharacterId, setToCharacterId] = useState("");
  const [relationshipType, setRelationshipType] =
    useState<RelationshipType>("friend");
  const [customLabel, setCustomLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const excluded = useMemo(
    () => new Set([characterId, ...excludeCharacterIds]),
    [characterId, excludeCharacterIds]
  );

  const selectable = useMemo(
    () => characters.filter((c) => !excluded.has(c.id)),
    [characters, excluded]
  );

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setLoadError(null);
    setActionError(null);
    setToCharacterId("");
    setRelationshipType("friend");
    setCustomLabel("");
    setNotes("");

    getCharactersForPicker().then((result) => {
      setLoading(false);
      if (result.error) {
        setLoadError(result.error);
        setCharacters([]);
        return;
      }
      setCharacters(result.characters);
    });
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!toCharacterId) {
      setActionError("Choose a character.");
      return;
    }

    setActionError(null);
    startTransition(async () => {
      const result = await createCharacterRelationship({
        fromCharacterId: characterId,
        toCharacterId,
        relationshipType,
        customLabel: relationshipType === "custom" ? customLabel : null,
        notes,
      });

      if (result.error) {
        setActionError(result.error);
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3.5 py-1.5 text-sm font-medium text-[var(--brand-text-secondary)] transition hover:border-neutral-300 hover:bg-[var(--brand-surface-elevated)]"
      >
        Add relationship
      </button>

      {open && (
        <FormModalShell
          title="Add relationship"
          subtitle="Connect this character to someone else in your studio"
          onClose={() => setOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {loadError && (
              <p className="rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]">
                {loadError}
              </p>
            )}
            {actionError && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
                {actionError}
              </p>
            )}

            <div>
              <label
                htmlFor="rel-character"
                className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]"
              >
                Character
              </label>
              {loading ? (
                <p className="text-sm text-[var(--brand-text-secondary)]">Loading characters…</p>
              ) : selectable.length === 0 ? (
                <p className="text-sm text-[var(--brand-text-secondary)]">
                  Create another character first to add a relationship.
                </p>
              ) : (
                <select
                  id="rel-character"
                  value={toCharacterId}
                  onChange={(e) => setToCharacterId(e.target.value)}
                  className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--brand-text-secondary)] outline-none focus:border-violet-500/50"
                >
                  <option value="">Select a character…</option>
                  {selectable.map((character) => (
                    <option key={character.id} value={character.id}>
                      {character.name}
                      {character.world_name ? ` · ${character.world_name}` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label
                htmlFor="rel-type"
                className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]"
              >
                Relationship
              </label>
              <select
                id="rel-type"
                value={relationshipType}
                onChange={(e) =>
                  setRelationshipType(e.target.value as RelationshipType)
                }
                className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--brand-text-secondary)] outline-none focus:border-violet-500/50"
              >
                {RELATIONSHIP_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {RELATIONSHIP_TYPE_DEFS[type].label}
                  </option>
                ))}
              </select>
            </div>

            {relationshipType === "custom" && (
              <div>
                <label
                  htmlFor="rel-custom"
                  className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]"
                >
                  Custom label
                </label>
                <input
                  id="rel-custom"
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  maxLength={80}
                  placeholder="Sworn shield, co-conspirator…"
                  className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--brand-text-secondary)] outline-none placeholder:text-[var(--brand-text-secondary)] focus:border-violet-500/50"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="rel-notes"
                className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]"
              >
                Notes (optional)
              </label>
              <textarea
                id="rel-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="How they know each other…"
                className="w-full resize-y rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--brand-text-secondary)] outline-none placeholder:text-[var(--brand-text-secondary)] focus:border-violet-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={pending || selectable.length === 0}
              className="w-full rounded-lg bg-gradient-to-r bg-[var(--brand-accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-500/15 transition hover:bg-[var(--brand-accent-hover)] disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save relationship"}
            </button>
          </form>
        </FormModalShell>
      )}
    </>
  );
}
