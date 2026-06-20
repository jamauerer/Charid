type ProjectNotesSectionProps = {
  description: string | null;
};

export function ProjectNotesSection({ description }: ProjectNotesSectionProps) {
  return (
    <div className="space-y-2 text-sm text-[var(--brand-text-secondary)]">
      {description ? (
        <p className="leading-relaxed whitespace-pre-wrap">{description}</p>
      ) : (
        <p className="text-[var(--brand-text-muted)]">
          Add a project description when you create a project, or edit project details later.
        </p>
      )}
    </div>
  );
}
