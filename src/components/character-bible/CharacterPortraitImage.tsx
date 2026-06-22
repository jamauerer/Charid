import Image from "next/image";
import { resolvePortraitFocalY } from "@/types/character";

type CharacterPortraitImageProps = {
  photoUrl: string;
  focalY?: number | null;
  alt: string;
  className?: string;
  sizes?: string;
  unoptimized?: boolean;
};

export function CharacterPortraitImage({
  photoUrl,
  focalY,
  alt,
  className = "",
  sizes,
  unoptimized = true,
}: CharacterPortraitImageProps) {
  const y = resolvePortraitFocalY(focalY);

  return (
    <Image
      src={photoUrl}
      alt={alt}
      fill
      className={`object-cover ${className}`.trim()}
      style={{ objectPosition: `50% ${y}%` }}
      sizes={sizes}
      unoptimized={unoptimized}
    />
  );
}
