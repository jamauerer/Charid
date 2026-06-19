"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { dsAlertInfo, dsBtnSecondary } from "@/lib/design-system";

type StoryWelcomeBannerProps = {
  storyTitle: string;
};

export function StoryWelcomeBanner({ storyTitle }: StoryWelcomeBannerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const showWelcome = searchParams.get("welcome") === "1";

  if (!showWelcome) {
    return null;
  }

  function dismiss() {
    router.replace(pathname);
  }

  return (
    <div
      role="status"
      className={`mb-6 flex flex-wrap items-start justify-between gap-4 ${dsAlertInfo} px-5 py-4`}
    >
      <div>
        <p className="text-sm font-semibold">Your story is ready</p>
        <p className="mt-1 max-w-xl text-sm leading-relaxed opacity-90">
          <span className="font-medium">{storyTitle}</span> is set up. Add your
          first chapter or link characters when you&apos;re ready — there&apos;s
          no wrong order.
        </p>
      </div>
      <button type="button" onClick={dismiss} className={dsBtnSecondary}>
        Got it
      </button>
    </div>
  );
}
