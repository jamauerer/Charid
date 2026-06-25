"use client";

type ComicStudioArtworkSlotProps = {
  label?: string;
  compact?: boolean;
};

/**
 * Unified artwork workflow slot — upload, generate, replace, and remove share this location.
 * Manual and AI workflows will coexist here in future milestones.
 */
export function ComicStudioArtworkSlot({
  label = "Artwork",
  compact = false,
}: ComicStudioArtworkSlotProps) {
  return (
    <div
      className={`production-artwork-slot ${compact ? "production-artwork-slot-compact" : ""}`}
    >
      {!compact && (
        <p className="production-artwork-slot-label">{label}</p>
      )}
      <div className="production-artwork-slot-actions">
        <ArtworkAction label="Upload artwork" />
        <ArtworkAction label="Generate artwork" />
        <ArtworkAction label="Replace artwork" />
        <ArtworkAction label="Remove artwork" muted />
      </div>
    </div>
  );
}

function ArtworkAction({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <button
      type="button"
      disabled
      className={`production-artwork-slot-btn ${muted ? "production-artwork-slot-btn-muted" : ""}`}
      title="Coming soon"
    >
      {label}
    </button>
  );
}
