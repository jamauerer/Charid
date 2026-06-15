import Link from "next/link";

export default function PublicPortfolioNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 font-sans text-zinc-100">
      <h1 className="text-lg font-semibold text-zinc-200">Portfolio not found</h1>
      <p className="mt-2 max-w-sm text-center text-sm text-zinc-500">
        This profile is private, does not exist, or has not been set up yet.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04]"
      >
        Go to CharID
      </Link>
    </div>
  );
}
