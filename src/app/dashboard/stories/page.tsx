import { getStoriesForUser } from "@/app/actions/stories";
import { DashboardStoriesView } from "../DashboardStoriesView";

export default async function StoriesPage() {
  const { entries, error } = await getStoriesForUser();

  return <DashboardStoriesView entries={entries} error={error} />;
}
