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
        Setting (optional)
      </legend>
      <label htmlFor={`${idPrefix}world_id`} className="sr-only">
        Setting
      </label>
      <select
        id={`${idPrefix}world_id`}
        name="world_id"
        defaultValue={character.world_id ?? ""}
        disabled={loading}
        className={selectClassName}
      >
        <option value="">No setting assigned</option>
        {worlds.map((world) => (
          <option key={world.id} value={world.id}>
            {world.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-[var(--brand-text-secondary)]">
        Optionally link this character to a setting for locations and references.
      </p>
    </fieldset>
  );
}
