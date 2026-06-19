import { getCharacters, getCharacterPhotoUrl } from "@/app/actions/characters";
import { DashboardCharactersView } from "../DashboardCharactersView";

export default async function CharactersPage() {
  const { characters, error } = await getCharacters();

  const charactersWithPhotos = await Promise.all(
    characters.map(async (character) => ({
      character,
      photoUrl: await getCharacterPhotoUrl(character.photo_path),
    }))
  );

  return (
    <DashboardCharactersView
      initialCharacters={charactersWithPhotos}
      error={error}
    />
  );
}
