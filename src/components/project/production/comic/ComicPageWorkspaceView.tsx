import type {
  ProjectCharacterEntry,
  ProjectSceneRollupEntry,
  ProjectStoryEntry,
} from "@/app/actions/projects";
import type { ComicPageWorkspaceData } from "@/app/actions/production/workspace";
import { ComicPageEditorShell } from "@/components/project/production/comic/ComicPageEditorShell";
import type { StudioEditorMode } from "@/components/project/production/studio/production-studio-editor";
import {
  formatProductionUnitStatus,
  flattenComicPages,
} from "@/lib/production-reading-order";
import { comicPageEditorPath } from "@/lib/production-routes";
import type { PageLayoutTemplateId } from "@/lib/canvas/page-layout-templates";
import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";
import type { ComicIssueWithPages } from "@/types/production/comic";

type ComicPageWorkspaceViewProps = {
  projectId: string;
  data: ComicPageWorkspaceData;
  templateId: PageLayoutTemplateId | null;
  panelBorderStyle: PanelBorderStyle;
  stories: ProjectStoryEntry[];
  sceneRollup: ProjectSceneRollupEntry[];
  characters: ProjectCharacterEntry[];
  issues: ComicIssueWithPages[];
  editorMode?: StudioEditorMode;
};

export function ComicPageWorkspaceView({
  projectId,
  data,
  templateId,
  panelBorderStyle,
  stories,
  sceneRollup,
  characters,
  issues,
  editorMode = "embedded",
}: ComicPageWorkspaceViewProps) {
  const { page, issueName, reading, projectTitle } = data;
  const flatPages = flattenComicPages(issues);
  const pageListItem = flatPages.find((entry) => entry.id === page.id);
  const status = pageListItem?.status ?? "empty";

  const prevHref =
    reading.currentIndex > 0
      ? comicPageEditorPath(projectId, reading.orderedIds[reading.currentIndex - 1], editorMode)
      : null;
  const nextHref =
    reading.currentIndex < reading.total - 1
      ? comicPageEditorPath(projectId, reading.orderedIds[reading.currentIndex + 1], editorMode)
      : null;

  const jumpOptions = flatPages.map((entry) => ({
    id: entry.id,
    label: `Page ${entry.pageNumber} — ${entry.name}`,
    href: comicPageEditorPath(projectId, entry.id, editorMode),
  }));

  return (
    <ComicPageEditorShell
      projectId={projectId}
      projectTitle={projectTitle}
      pageId={page.id}
      pageName={page.name}
      issueName={issueName}
      statusLabel={formatProductionUnitStatus(status)}
      panels={page.panels}
      templateId={templateId}
      panelBorderStyle={panelBorderStyle}
      editorMode={editorMode}
      reading={{
        currentIndex: reading.currentIndex,
        total: reading.total,
        prevHref,
        nextHref,
        jumpOptions,
      }}
      stories={stories}
      sceneRollup={sceneRollup}
      characters={characters}
    />
  );
}
