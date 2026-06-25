import { getLibraryReferenceImages } from "@/app/actions/library";
import { LibraryReferencesView } from "@/components/library/LibraryReferencesView";

export default async function LibraryReferencesPage() {
  const { items, error } = await getLibraryReferenceImages();
  return <LibraryReferencesView items={items} error={error} />;
}
