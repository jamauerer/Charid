"use client";

import { useEffect, useState } from "react";
import { getWorldSelectOptions } from "@/app/actions/worlds";
import { selectClassName } from "@/components/CharacterFormFields";
import type { Character } from "@/types/character";

type WorldSelectFieldProps = {
  character: Character;
  idPrefix?: string;
};

export function WorldSelectField({
  character,
  idPrefix = "",
}: WorldSelectFieldProps) {
  const [worlds, setWorlds] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorldSelectOptions().then((options) => {
      setWorlds(options);
      setLoading(false);
    });
  }, []);

  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        World
      </legend>
      <label htmlFor={`${idPrefix}world_id`} className="sr-only">
        World
      </label>
      <select
        id={`${idPrefix}world_id`}
        name="world_id"
        defaultValue={character.world_id ?? ""}
        disabled={loading}
        className={selectClassName}
      >
        <option value="">No world (unassigned)</option>
        {worlds.map((world) => (
          <option key={world.id} value={world.id}>
            {world.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-[var(--brand-text-secondary)]">
        Assign this character to one of your worlds.
      </p>
    </fieldset>
  );
}
