import { getLibraryCharacters } from "@/app/actions/library";
import { LibraryCharactersView } from "@/components/library/LibraryCharactersView";

export default async function LibraryCharactersPage() {
  const { items, error } = await getLibraryCharacters();
  return <LibraryCharactersView items={items} error={error} />;
}
