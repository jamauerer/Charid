import { getHomePageData } from "@/app/actions/home-page";
import { DashboardHomeView } from "./DashboardHomeView";

export default async function DashboardPage() {
  const data = await getHomePageData();
  return <DashboardHomeView {...data} />;
}
