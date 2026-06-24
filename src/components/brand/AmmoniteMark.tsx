import type { CSSProperties } from "react";
import {
  FAVICON_STROKE_PATHS,
  MARK_STROKE_PATHS,
} from "@/lib/brand-ammonite";

type AmmoniteMarkProps = {
  /** Mark density — favicon uses a simplified 3-chamber derivative. */
  variant?: "mark" | "favicon";
  className?: string;
  style?: CSSProperties;
  title?: string;
};

export function AmmoniteMark({
  variant = "mark",
  className = "",
  style,
  title = "CharID",
}: AmmoniteMarkProps) {
  const paths = variant === "favicon" ? FAVICON_STROKE_PATHS : MARK_STROKE_PATHS;
  const viewBox = variant === "favicon" ? "0 0 32 32" : "0 0 64 64";
  const strokeWidth = variant === "favicon" ? 2 : 2.25;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill="none"
      role="img"
      aria-label={title}
      className={className}
      style={style}
    >
      <g
        aria-hidden={title ? undefined : true}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
