import { getLibraryScenes } from "@/app/actions/library";
import { LibraryScenesView } from "@/components/library/LibraryScenesView";

export default async function LibraryScenesPage() {
  const { items, error } = await getLibraryScenes();
  return <LibraryScenesView items={items} error={error} />;
}
