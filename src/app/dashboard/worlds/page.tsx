import { getWorldCoverUrl, getWorlds } from "@/app/actions/worlds";
import { DashboardWorldsView } from "../DashboardWorldsView";

export default async function WorldsPage() {
  const { worlds, error } = await getWorlds();

  const initialWorlds = await Promise.all(
    worlds.map(async (world) => ({
      world,
      coverUrl: await getWorldCoverUrl(world.cover_image_path),
    }))
  );

  return <DashboardWorldsView initialWorlds={initialWorlds} error={error} />;
}
