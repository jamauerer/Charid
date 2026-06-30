"use client";

import type { BubbleLibraryCategoryId } from "@/lib/studio/bubble-library";

type BubblePreviewProps = {
  categoryId: BubbleLibraryCategoryId;
  active?: boolean;
  className?: string;
};

/** Placeholder bubble previews until SVG assets are provided. */
export function BubblePreview({ categoryId, active = false, className = "" }: BubblePreviewProps) {
  return (
    <svg
      viewBox="0 0 80 48"
      className={`bubble-preview ${active ? "bubble-preview-active" : ""} ${className}`}
      aria-hidden
    >
      <BubbleShape categoryId={categoryId} />
    </svg>
  );
}

function BubbleShape({ categoryId }: { categoryId: BubbleLibraryCategoryId }) {
  switch (categoryId) {
    case "thought":
      return (
        <>
          <ellipse cx="40" cy="22" rx="32" ry="18" fill="#fff" stroke="#0f172a" strokeWidth="2.5" />
          <circle cx="28" cy="38" r="4" fill="#fff" stroke="#0f172a" strokeWidth="2" />
          <circle cx="22" cy="44" r="2.5" fill="#fff" stroke="#0f172a" strokeWidth="1.5" />
        </>
      );
    case "caption":
      return (
        <rect x="8" y="12" width="64" height="24" rx="4" fill="rgba(15,23,42,0.88)" stroke="#0f172a" strokeWidth="2" />
      );
    case "sfx":
      return (
        <text x="40" y="30" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#0f172a" stroke="#fff" strokeWidth="1">
          POW!
        </text>
      );
    case "whisper":
      return (
        <ellipse cx="40" cy="24" rx="30" ry="16" fill="#fff" stroke="#0f172a" strokeWidth="1.5" strokeDasharray="4 3" />
      );
    case "shout":
      return (
        <path
          d="M40 4 L52 20 L48 20 L54 40 L40 26 L26 40 L32 20 L28 20 Z"
          fill="#fff"
          stroke="#0f172a"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      );
    case "radio":
      return (
        <>
          <rect x="12" y="14" width="56" height="22" rx="3" fill="#fff" stroke="#0f172a" strokeWidth="2" />
          <path d="M16 18 H20 M60 18 H64" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case "electronic":
      return (
        <rect x="10" y="12" width="60" height="26" rx="2" fill="#fff" stroke="#0f172a" strokeWidth="2" />
      );
    case "narration":
      return (
        <rect x="8" y="16" width="64" height="18" fill="rgba(248,250,252,0.95)" stroke="#64748b" strokeWidth="1.5" />
      );
    case "speech":
    default:
      return (
        <>
          <ellipse cx="40" cy="22" rx="32" ry="18" fill="#fff" stroke="#0f172a" strokeWidth="2.5" />
          <path d="M22 36 L16 46 L30 38 Z" fill="#fff" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
        </>
      );
  }
}
