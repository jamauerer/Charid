import Link from "next/link";
import {
  studioBtnPrimary,
  studioBtnSecondary,
  studioEyebrow,
  studioMarketingBody,
  studioMarketingHeadline,
  studioMarketingSectionTitle,
  studioPipelineArrow,
  studioPipelineStep,
} from "@/lib/visual-identity";

const PIPELINE = [
  "Idea",
  "Story",
  "Scene",
  "Comic",
  "Publish",
] as const;

const AI_COLLAB = [
  {
    title: "Suggest scenes",
    body: "Ideas to review — you choose what enters your story.",
  },
  {
    title: "Suggest chapters",
    body: "Outline beats without auto-writing your canon.",
  },
  {
    title: "Generate covers",
    body: "Visual directions you approve before they go live.",
  },
] as const;

export function HomePageContent() {
  return (
    <main className="text-sm">
      {/* Hero — compact, no decorative gradients */}
      <section className="border-b border-[var(--brand-border)] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className={studioEyebrow}>CharID</p>
          <h1 className={`mt-2 ${studioMarketingHeadline}`}>
            A place where stories begin.
          </h1>
          <p className={`mt-3 max-w-xl ${studioMarketingBody}`}>
            Characters, worlds, scenes, comics, and books — with an AI partner
            that helps turn ideas into finished work you own.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/signup" className={studioBtnPrimary}>
              Start your first project
            </Link>
            <Link href="/#how-it-works" className={studioBtnSecondary}>
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section
        id="how-it-works"
        className="border-b border-[var(--brand-border)] px-4 py-8 sm:px-6"
      >
        <div className="mx-auto max-w-4xl">
          <h2 className={studioMarketingSectionTitle}>Idea to publish</h2>
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2">
            {PIPELINE.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className={studioPipelineStep}>
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {step}
                  </span>
                </span>
                {i < PIPELINE.length - 1 && (
                  <span className={studioPipelineArrow} aria-hidden>
                    →
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features — dense grid */}
      <section
        id="showcase"
        className="border-b border-[var(--brand-border)] px-4 py-8 sm:px-6"
      >
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
          <div>
            <p className={studioEyebrow}>Characters</p>
            <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
              Portraits and turnarounds — art leads, metadata follows.
            </p>
          </div>
          <div>
            <p className={studioEyebrow}>Worlds</p>
            <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
              Maps, locations, moodboards at the center of the workspace.
            </p>
          </div>
          <div>
            <p className={studioEyebrow}>Stories</p>
            <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
              Chapters and scenes connected to your cast and settings.
            </p>
          </div>
        </div>
      </section>

      {/* AI */}
      <section className="border-b border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className={studioEyebrow}>AI collaboration</p>
          <h2 className={`mt-1 ${studioMarketingSectionTitle}`}>
            A partner, not a replacement
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {AI_COLLAB.map((item) => (
              <article
                key={item.title}
                className="rounded-lg border border-[var(--brand-border)] p-3"
              >
                <h3 className="text-sm font-medium text-[var(--foreground)]">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--brand-text-secondary)]">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Publish */}
      <section
        id="publish"
        className="border-b border-[var(--brand-border)] px-4 py-8 sm:px-6"
      >
        <div className="mx-auto max-w-4xl">
          <p className={studioEyebrow}>Publish</p>
          <p className="mt-1 max-w-xl text-sm text-[var(--brand-text-secondary)]">
            Share finished work through your portfolio when ready — visitors see
            your art, not admin tooling.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--brand-border)] px-4 py-4">
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              Start your first project
            </p>
            <p className="text-xs text-[var(--brand-text-muted)]">
              Free to begin. Private by default.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/signup" className={studioBtnPrimary}>
              Create account
            </Link>
            <Link href="/login" className={studioBtnSecondary}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--brand-border)] px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-[var(--brand-text-muted)]">
            © {new Date().getFullYear()} CharID
          </p>
          <div className="flex gap-3 text-xs text-[var(--brand-text-secondary)]">
            <Link href="/login" className="hover:text-[var(--foreground)]">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-[var(--foreground)]">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
