import { getLibraryStories } from "@/app/actions/library";
import { LibraryStoriesView } from "@/components/library/LibraryStoriesView";

export default async function LibraryStoriesPage() {
  const { items, error } = await getLibraryStories();
  return <LibraryStoriesView items={items} error={error} />;
}
