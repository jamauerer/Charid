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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" aria-hidden width={48} height={48} className="h-12 w-12" />
        <span className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          CharID
        </span>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/logo.svg"
      alt=""
      aria-hidden
      width={px}
      height={px}
      className={className}
      style={{ width: px, height: px }}
    />
  );
}
