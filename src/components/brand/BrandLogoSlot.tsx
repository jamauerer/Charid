import { CharIDLogo } from "@/components/brand/CharIDLogo";

type BrandLogoSlotProps = {
  /** Mark size in the sidebar/header context */
  size?: "sm" | "md" | "lg";
  variant?: "mark" | "full";
  className?: string;
  showWordmark?: boolean;
};

/** Single swap point for the CharID logo across the app. */
export function BrandLogoSlot({
  size = "md",
  variant = "mark",
  className = "",
  showWordmark = false,
}: BrandLogoSlotProps) {
  if (variant === "full") {
    return <CharIDLogo variant="full" size={size} className={className} />;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <CharIDLogo variant="mark" size={size} />
      {showWordmark && (
        <span className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
          CharID
        </span>
      )}
    </div>
  );
}
