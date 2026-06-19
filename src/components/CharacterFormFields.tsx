import type { Character } from "@/types/character";

export const inputClassName =
  "w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--brand-text-secondary)] placeholder:text-[var(--brand-text-secondary)] outline-none transition focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)]";

export const selectClassName =
  "w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5 text-sm text-[var(--brand-text-secondary)] outline-none transition focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)] disabled:cursor-not-allowed disabled:opacity-60";

export const selectClassNameCompact =
  "w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface)] px-2 py-1.5 text-xs text-[var(--brand-text-secondary)] outline-none transition focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)] disabled:cursor-not-allowed disabled:opacity-60";

const labelClassName =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]";

type CharacterFormFieldsProps = {
  character?: Character;
  ageDefault?: string | null;
  idPrefix?: string;
};

export function CharacterFormFields({
  character,
  ageDefault,
  idPrefix = "",
}: CharacterFormFieldsProps) {
  const p = idPrefix;

  return (
    <>
      <fieldset className="space-y-4">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
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
              defaultValue={ageDefault ?? ""}
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
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
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
