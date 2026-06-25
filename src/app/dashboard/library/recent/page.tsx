import { getLibraryContinueCreating } from "@/app/actions/library";
import { LibraryContinueCreatingView } from "@/components/library/LibraryRecentView";

export default async function LibraryContinueCreatingPage() {
  const { items, error } = await getLibraryContinueCreating();
  return <LibraryContinueCreatingView items={items} error={error} />;
}
