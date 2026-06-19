import Link from "next/link";

export default function PublicPortfolioNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 font-sans text-[var(--brand-text-secondary)]">
      <h1 className="text-lg font-semibold text-[var(--brand-text-secondary)]">Portfolio not found</h1>
      <p className="mt-2 max-w-sm text-center text-sm text-[var(--brand-text-secondary)]">
        This profile is private, does not exist, or has not been set up yet.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg border border-[var(--brand-border)] px-4 py-2 text-sm text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface)]"
      >
        Go to CharID
      </Link>
    </div>
  );
}
