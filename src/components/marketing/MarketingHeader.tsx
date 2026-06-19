import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BrandLogoSlot } from "@/components/brand/BrandLogoSlot";
import { studioBtnPrimarySm, studioBtnSecondary } from "@/lib/visual-identity";

const guestLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#showcase", label: "Showcase" },
  { href: "/#publish", label: "Publish" },
] as const;

export async function MarketingHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--brand-border)] bg-[var(--background)]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 transition hover:opacity-90"
        >
          <BrandLogoSlot size="sm" />
          <span className="text-sm font-semibold text-[var(--foreground)]">
            CharID
          </span>
        </Link>

        {!user && (
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Main navigation"
          >
            {guestLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--foreground)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className={studioBtnPrimarySm}>
              Your studio
            </Link>
          ) : (
            <>
              <Link href="/login" className={studioBtnSecondary}>
                Sign in
              </Link>
              <Link href="/signup" className={studioBtnPrimarySm}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
