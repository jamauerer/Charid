"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveCharacterPersonality } from "@/app/actions/characters";
import {
  parsePersonalityTraits,
  serializePersonalityTraits,
  SUGGESTED_PERSONALITY_TRAITS,
} from "@/lib/personality-traits";

type CharacterPersonalitySectionProps = {
  characterId: string;
  initialPersonality: string | null;
};

export function CharacterPersonalitySection({
  characterId,
  initialPersonality,
}: CharacterPersonalitySectionProps) {
  const router = useRouter();
  const [traits, setTraits] = useState<string[]>(() =>
    parsePersonalityTraits(initialPersonality)
  );
  const [customTrait, setCustomTrait] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const customOnly = useMemo(() => {
    const suggested = new Set<string>(SUGGESTED_PERSONALITY_TRAITS);
    return traits.filter((trait) => !suggested.has(trait as typeof SUGGESTED_PERSONALITY_TRAITS[number]));
  }, [traits]);

  function persist(nextTraits: string[]) {
    setError(null);
    startTransition(async () => {
      const result = await saveCharacterPersonality(
        characterId,
        serializePersonalityTraits(nextTraits)
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function toggleTrait(trait: string) {
    const next = traits.includes(trait)
      ? traits.filter((t) => t !== trait)
      : [...traits, trait];
    setTraits(next);
    persist(next);
  }

  function addCustomTrait() {
    const trimmed = customTrait.trim();
    if (!trimmed || traits.includes(trimmed)) {
      setCustomTrait("");
      return;
    }
    const next = [...traits, trimmed];
    setTraits(next);
    setCustomTrait("");
    persist(next);
  }

  return (
    <section className="mb-10">
      <div className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          Personality
        </h2>
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
          Tap traits that describe your character — or add your own.
        </p>
      </div>
      <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5">
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PERSONALITY_TRAITS.map((trait) => {
            const selected = traits.includes(trait);
            return (
              <button
                key={trait}
                type="button"
                disabled={pending}
                onClick={() => toggleTrait(trait)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition disabled:opacity-60 ${
                  selected
                    ? "border border-neutral-900 bg-neutral-900 text-white"
                    : "border border-[var(--brand-border)] bg-[var(--brand-surface)] text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"
                }`}
              >
                {trait}
              </button>
            );
          })}
          {customOnly.map((trait) => (
            <button
              key={trait}
              type="button"
              disabled={pending}
              onClick={() => toggleTrait(trait)}
              className="rounded-full border border-neutral-900 bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
            >
              {trait} ×
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            type="text"
            value={customTrait}
            onChange={(e) => setCustomTrait(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomTrait();
              }
            }}
            placeholder="Add your own trait"
            maxLength={40}
            className="min-w-[10rem] flex-1 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-neutral-600 outline-none placeholder:text-neutral-400 focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)]"
          />
          <button
            type="button"
            disabled={pending || !customTrait.trim()}
            onClick={addCustomTrait}
            className="rounded-lg border border-[var(--brand-border)] px-4 py-2 text-sm font-medium text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface)] disabled:opacity-50"
          >
            Add
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-[var(--status-danger-text)]">{error}</p>
        )}
        {pending && (
          <p className="mt-3 text-xs text-[var(--brand-text-secondary)]">Saving…</p>
        )}
      </div>
    </section>
  );
}
