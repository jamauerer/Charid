import { getProjectCoverUrl, getProjects } from "@/app/actions/projects";
import { DashboardProjectsView } from "./DashboardProjectsView";

export default async function ProjectsPage() {
  const { projects, error } = await getProjects();

  const initialProjects = await Promise.all(
    projects.map(async (project) => ({
      project,
      coverUrl: await getProjectCoverUrl(project.cover_image_path),
    }))
  );

  return (
    <DashboardProjectsView initialProjects={initialProjects} error={error} />
  );
}
