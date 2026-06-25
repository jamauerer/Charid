import { getLibraryAssets } from "@/app/actions/library";
import { LibraryAssetsView } from "@/components/library/LibraryAssetsView";

export default async function LibraryAssetsPage() {
  const { items, error } = await getLibraryAssets();
  return <LibraryAssetsView items={items} error={error} />;
}
