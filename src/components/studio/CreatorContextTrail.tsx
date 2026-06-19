import Link from "next/link";

export type CreatorContextSegment = {
  label: string;
  href?: string;
};

type CreatorContextTrailProps = {
  project: CreatorContextSegment | null;
  story?: CreatorContextSegment | null;
  current?: CreatorContextSegment | null;
  world?: CreatorContextSegment | null;
  className?: string;
};

export function CreatorContextTrail({
  project,
  story,
  current,
  world,
  className = "",
}: CreatorContextTrailProps) {
  const segments: CreatorContextSegment[] = [];

  if (project) {
    segments.push(project);
  }
  if (story) {
    segments.push(story);
  }
  if (current) {
    segments.push(current);
  }

  if (segments.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <nav
        aria-label="Creator context"
        className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
      >
        {segments.map((segment, index) => (
          <span key={`${segment.label}-${index}`} className="inline-flex items-center gap-2">
            {index > 0 && (
              <span className="text-neutral-400" aria-hidden>
                →
              </span>
            )}
            {segment.href ? (
              <Link
                href={segment.href}
                className="font-medium text-neutral-600 transition hover:text-neutral-900"
              >
                {segment.label}
              </Link>
            ) : (
              <span className="font-semibold text-neutral-900">{segment.label}</span>
            )}
          </span>
        ))}
      </nav>
      {world && (
        <p className="text-xs text-neutral-500">
          Setting:{" "}
          {world.href ? (
            <Link href={world.href} className="transition hover:text-neutral-700">
              {world.label}
            </Link>
          ) : (
            world.label
          )}
        </p>
      )}
    </div>
  );
}
