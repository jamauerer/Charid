import { searchLibrary } from "@/app/actions/library";
import { LibrarySearchResultsView } from "@/components/library/LibrarySearchResultsView";

type LibrarySearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function LibrarySearchPage({ searchParams }: LibrarySearchPageProps) {
  const { q } = await searchParams;
  const results = await searchLibrary(q ?? "");
  return <LibrarySearchResultsView results={results} />;
}
