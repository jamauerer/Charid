import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { Suspense } from "react";
import { getFeedbackInboxData } from "@/app/actions/feedback-admin";
import { FeedbackInbox } from "@/components/admin/FeedbackInbox";

type PageProps = {
  searchParams: Promise<{ rating?: string }>;
};

function parseRating(value: string | undefined): number | null {
  if (!value) return null;
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  return rating;
}

async function FeedbackInboxLoader({
  ratingFilter,
}: {
  ratingFilter: number | null;
}) {
  const { data, error } = await getFeedbackInboxData(ratingFilter);

  return (
    <FeedbackInbox
      items={data?.items ?? []}
      avgRating={data?.avgRating ?? null}
      totalCount={data?.totalCount ?? 0}
      activeRating={ratingFilter}
      error={error}
    />
  );
}

export default async function AdminFeedbackPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const ratingFilter = parseRating(params.rating);

  return (
    <div className="space-y-4">
      <AdminBackLink />
      <Suspense
        fallback={
          <p className="text-sm text-[var(--brand-text-muted)]">Loading feedback inbox…</p>
        }
      >
        <FeedbackInboxLoader ratingFilter={ratingFilter} />
      </Suspense>
    </div>
  );
}
