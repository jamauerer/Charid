import Link from "next/link";
import { CharIDLogo } from "@/components/brand/CharIDLogo";

export function PublicSiteHeader() {
  return (
    <header className="relative border-b border-white/[0.06] bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
          <CharIDLogo size="sm" />
          <span className="text-sm font-semibold text-zinc-200">CharID</span>
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}
