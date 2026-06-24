import { AmmoniteMark } from "@/components/brand/AmmoniteMark";

type CharIDLogoProps = {
  variant?: "mark" | "full";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const markSizes = {
  sm: 28,
  md: 32,
  lg: 48,
} as const;

export function CharIDLogo({
  variant = "mark",
  size = "md",
  className = "",
}: CharIDLogoProps) {
  const px = markSizes[size];

  if (variant === "full") {
    return (
      <div className={`inline-flex flex-col items-center gap-3 ${className}`}>
        <AmmoniteMark
          variant="mark"
          className="h-12 w-12 text-[var(--brand-accent)]"
          title=""
        />
        <span className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          CharID
        </span>
      </div>
    );
  }

  return (
    <AmmoniteMark
      variant="mark"
      className={`text-[var(--brand-accent)] ${className}`}
      style={{ width: px, height: px }}
    />
  );
}
