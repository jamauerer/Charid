import Image from "next/image";

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
        <Image
          src="/brand/logo.svg"
          alt=""
          width={markSizes.lg}
          height={markSizes.lg}
          priority
          aria-hidden
        />
        <span className="text-2xl font-bold tracking-tight text-zinc-100">
          CharID
        </span>
      </div>
    );
  }

  return (
    <Image
      src="/brand/logo.svg"
      alt="CharID"
      width={px}
      height={px}
      className={className}
      priority
    />
  );
}
