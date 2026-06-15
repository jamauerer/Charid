import type { Character } from "@/types/character";

export const inputClassName =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30";

const labelClassName =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500";

type CharacterFormFieldsProps = {
  character?: Character;
  idPrefix?: string;
};

export function CharacterFormFields({
  character,
  idPrefix = "",
}: CharacterFormFieldsProps) {
  const p = idPrefix;

  return (
    <>
      <fieldset className="space-y-4">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-violet-400/80">
          Identity
        </legend>

        <div>
          <label htmlFor={`${p}name`} className={labelClassName}>
            Character name
          </label>
          <input
            id={`${p}name`}
            name="name"
            type="text"
            required
            defaultValue={character?.name}
            placeholder="e.g. Aria Stormwind"
            className={inputClassName}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${p}gender`} className={labelClassName}>
              Gender
            </label>
            <input
              id={`${p}gender`}
              name="gender"
              type="text"
              defaultValue={character?.gender ?? ""}
              placeholder="e.g. Female"
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor={`${p}age`} className={labelClassName}>
              Age
            </label>
            <input
              id={`${p}age`}
              name="age"
              type="text"
              defaultValue={character?.age ?? ""}
              placeholder="e.g. 28"
              className={inputClassName}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${p}location`} className={labelClassName}>
            Location
          </label>
          <input
            id={`${p}location`}
            name="location"
            type="text"
            defaultValue={character?.location ?? ""}
            placeholder="e.g. Neo-Tokyo"
            className={inputClassName}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-violet-400/80">
          Backstory
        </legend>
        <div>
          <label htmlFor={`${p}backstory`} className={labelClassName}>
            Backstory
          </label>
          <textarea
            id={`${p}backstory`}
            name="backstory"
            rows={5}
            defaultValue={character?.backstory ?? ""}
            placeholder="Origin, personality, goals, key events..."
            className={inputClassName}
          />
        </div>
      </fieldset>
    </>
  );
}
