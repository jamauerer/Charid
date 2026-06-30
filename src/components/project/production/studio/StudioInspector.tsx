"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import type { ProjectCharacterEntry, ProjectSceneRollupEntry, ProjectStoryEntry } from "@/app/actions/projects";
import type { ComicPanelContentApi } from "@/components/project/production/comic/use-comic-panel-content";
import type { ComicEditorSelection } from "@/components/project/production/studio/production-studio-editor";
import { getArtworkMetadata, getArtworkObject, getTextKind } from "@/lib/canvas/panel-content";
import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";
import { PANEL_BORDER_OPTIONS } from "@/lib/canvas/panel-border-style";
import type { ComicPanel } from "@/types/production/comic";
import type { TextPayloadV1 } from "@/types/canvas/document-v1";

type StudioInspectorProps = {
  projectTitle: string;
  pageName: string;
  issueName: string;
  panels: ComicPanel[];
  selection: ComicEditorSelection;
  panelContent: ComicPanelContentApi;
  panelBorderStyle: PanelBorderStyle;
  layoutPending: boolean;
  panelFrame?: { x: number; y: number; width: number; height: number };
  stories: ProjectStoryEntry[];
  sceneRollup: ProjectSceneRollupEntry[];
  characters: ProjectCharacterEntry[];
  onBorderStyleChange: (style: PanelBorderStyle) => void;
  onDeleteSelection: () => void;
  onDeletePanel: () => void;
  onReorderText: (objectId: string, direction: "front" | "back" | "forward" | "backward") => void;
  onArtworkTransform?: (patch: { opacity?: number; rotation?: number }) => void;
};

export function StudioInspector(props: StudioInspectorProps) {
  const { selection } = props;
  const selectedPanelId =
    selection.kind === "panel"
      ? selection.panelIds[0] ?? null
      : selection.kind === "text" || selection.kind === "artwork"
        ? selection.panelId
        : null;

  const artworkMeta =
    selectedPanelId && selection.kind === "artwork"
      ? (() => {
          const doc = props.panelContent.getPanelDocument(selectedPanelId);
          const obj = getArtworkObject(doc);
          return obj ? getArtworkMetadata(obj) : null;
        })()
      : null;

  const textObject =
    selection.kind === "text"
      ? props.panelContent
          .getPanelTextObjects(selection.panelId)
          .find((o) => o.id === selection.objectId)
      : null;

  const textFrame = textObject
    ? { x: textObject.x, y: textObject.y, width: textObject.width, height: textObject.height }
    : null;

  const selectionLabel = (() => {
    if (selection.kind === "panel") {
      const index = props.panels.findIndex((p) => p.id === selection.panelIds[0]);
      return index >= 0 ? `Panel ${index + 1}` : "Panel";
    }
    if (selection.kind === "artwork") return "Artwork";
    if (selection.kind === "text") {
      const kind = textObject ? getTextKind(textObject) : "text";
      const preview = textObject
        ? ((textObject.payload as TextPayloadV1).content.slice(0, 20) || kind)
        : kind;
      return preview;
    }
    return null;
  })();

  return (
    <>
      <div className="insp-header">
        Inspector
        {selectionLabel && <div className="insp-header-sub">{selectionLabel}</div>}
      </div>
      <div className="insp-body">
        {selection.kind !== "none" && (
          <InspectorSection title="Position & size">
            {(selection.kind === "panel" || selection.kind === "artwork") && props.panelFrame && (
              <FieldGrid
                fields={[
                  ["X", Math.round(props.panelFrame.x)],
                  ["Y", Math.round(props.panelFrame.y)],
                  ["W", Math.round(props.panelFrame.width)],
                  ["H", Math.round(props.panelFrame.height)],
                ]}
                extra={
                  artworkMeta
                    ? [["Rotation", Math.round(artworkMeta.rotation ?? 0)] as [string, number]]
                    : undefined
                }
              />
            )}
            {selection.kind === "text" && textFrame && (
              <FieldGrid
                fields={[
                  ["X", Math.round(textFrame.x)],
                  ["Y", Math.round(textFrame.y)],
                  ["W", Math.round(textFrame.width)],
                  ["H", Math.round(textFrame.height)],
                ]}
              />
            )}
          </InspectorSection>
        )}

        {selection.kind !== "none" && (
          <InspectorSection title="Appearance">
            {selection.kind === "panel" && (
              <label className="insp-field">
                <span className="insp-field-label">Border</span>
                <select
                  value={props.panelBorderStyle}
                  onChange={(e) => props.onBorderStyleChange(e.target.value as PanelBorderStyle)}
                  disabled={props.layoutPending}
                  className="insp-field-val"
                >
                  {PANEL_BORDER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {selection.kind === "artwork" && artworkMeta && (
              <>
                <label className="insp-field mt-2">
                  <span className="insp-field-label">Opacity</span>
                  <div className="insp-slider-wrap">
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={artworkMeta.opacity ?? 1}
                      onChange={(e) =>
                        props.onArtworkTransform?.({ opacity: Number(e.target.value) })
                      }
                      className="insp-range"
                    />
                    <span className="insp-slider-val">
                      {Math.round((artworkMeta.opacity ?? 1) * 100)}%
                    </span>
                  </div>
                </label>
                <label className="insp-field mt-2">
                  <span className="insp-field-label">Rotation</span>
                  <input
                    type="number"
                    min={-180}
                    max={180}
                    value={Math.round(artworkMeta.rotation ?? 0)}
                    onChange={(e) =>
                      props.onArtworkTransform?.({ rotation: Number(e.target.value) })
                    }
                    className="insp-field-val"
                  />
                </label>
              </>
            )}
            {selection.kind === "text" && (
              <p className="insp-hint">
                Font, size, and color are in the top toolbar when text is selected.
              </p>
            )}
          </InspectorSection>
        )}

        <InspectorSection title="Layers — this page">
          <LayersList
            panels={props.panels}
            panelId={selectedPanelId}
            panelContent={props.panelContent}
            selection={selection}
          />
        </InspectorSection>

        {selection.kind !== "none" && (
          <InspectorSection title="Quick actions">
            <div className="insp-qa-list">
              {selection.kind === "text" && (
                <>
                  <button
                    type="button"
                    className="insp-qa-btn"
                    onClick={() => props.onReorderText(selection.objectId, "forward")}
                  >
                    Bring forward
                  </button>
                  <button
                    type="button"
                    className="insp-qa-btn"
                    onClick={() => props.onReorderText(selection.objectId, "backward")}
                  >
                    Send backward
                  </button>
                  <button
                    type="button"
                    className="insp-qa-btn"
                    onClick={() => props.onReorderText(selection.objectId, "front")}
                  >
                    Bring to front
                  </button>
                  <button
                    type="button"
                    className="insp-qa-btn"
                    onClick={() => props.onReorderText(selection.objectId, "back")}
                  >
                    Send to back
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={selection.kind === "panel" ? props.onDeletePanel : props.onDeleteSelection}
                disabled={props.layoutPending}
                className="insp-qa-btn insp-qa-btn-danger"
              >
                {selection.kind === "panel" ? "Delete panel" : "Delete"}
              </button>
            </div>
          </InspectorSection>
        )}

        <InspectorSection title="Story context">
          <StoryContext
            projectTitle={props.projectTitle}
            stories={props.stories}
            sceneRollup={props.sceneRollup}
            characters={props.characters}
          />
        </InspectorSection>
      </div>
    </>
  );
}

function InspectorSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="insp-section">
      <div className="insp-section-title">{title}</div>
      {children}
    </section>
  );
}

function FieldGrid({
  fields,
  extra,
}: {
  fields: [string, string | number][];
  extra?: [string, number][];
}) {
  const all = extra ? [...fields, ...extra] : fields;
  return (
    <div className="insp-pos-grid">
      {all.map(([label, value]) => (
        <label key={label} className="insp-field">
          <span className="insp-field-label">{label}</span>
          <input type="text" readOnly value={value} className="insp-field-val" />
        </label>
      ))}
    </div>
  );
}

function LayersList({
  panels,
  panelId,
  panelContent,
  selection,
}: {
  panels: ComicPanel[];
  panelId: string | null;
  panelContent: ComicPanelContentApi;
  selection: ComicEditorSelection;
}) {
  const textObjects = panelId ? panelContent.getPanelTextObjects(panelId) : [];
  return (
    <ul className="insp-layer-list">
      {panels.map((panel, index) => (
        <li
          key={panel.id}
          className={
            selection.kind === "panel" && selection.panelIds.includes(panel.id)
              ? "insp-layer-item insp-layer-item-selected"
              : "insp-layer-item"
          }
        >
          <span className="insp-layer-icon">P</span>
          <span className="insp-layer-name">Panel {index + 1}</span>
        </li>
      ))}
      {panelId && panelContent.hasArtwork(panelId) && (
        <li
          className={
            selection.kind === "artwork"
              ? "insp-layer-item insp-layer-item-selected"
              : "insp-layer-item"
          }
        >
          <span className="insp-layer-icon">A</span>
          <span className="insp-layer-name">Artwork</span>
        </li>
      )}
      {textObjects.map((obj) => {
        const kind = getTextKind(obj);
        const label = (obj.payload as TextPayloadV1).content.slice(0, 16) || kind;
        return (
          <li
            key={obj.id}
            className={
              selection.kind === "text" && selection.objectId === obj.id
                ? "insp-layer-item insp-layer-item-selected"
                : "insp-layer-item"
            }
          >
            <span className="insp-layer-icon">T</span>
            <span className="insp-layer-name">{label}</span>
          </li>
        );
      })}
      {panels.length === 0 && (
        <li className="insp-layer-item insp-layer-empty">
          No objects on this page yet.
        </li>
      )}
    </ul>
  );
}

function StoryContext({
  projectTitle,
  stories,
  sceneRollup,
  characters,
}: {
  projectTitle: string;
  stories: ProjectStoryEntry[];
  sceneRollup: ProjectSceneRollupEntry[];
  characters: ProjectCharacterEntry[];
}) {
  const story = stories[0];
  const scene = sceneRollup[0];

  return (
    <div className="insp-context">
      <div className="insp-context-row">
        <div className="insp-context-label">Project</div>
        <div className="insp-context-val">{projectTitle}</div>
      </div>
      <div className="insp-context-row">
        <div className="insp-context-label">Story</div>
        <div className="insp-context-val">
          {story ? (
            <Link href={`/dashboard/worlds/${story.world.id}/stories/${story.story.id}`}>
              {story.story.title}
            </Link>
          ) : (
            "—"
          )}
        </div>
      </div>
      <div className="insp-context-row">
        <div className="insp-context-label">Scene</div>
        <div className="insp-context-val insp-context-accent">
          {scene ? (
            <Link
              href={`/dashboard/worlds/${scene.worldId}/stories/${scene.storyId}/scenes/${scene.sceneId}`}
            >
              {scene.sceneTitle}
            </Link>
          ) : (
            "—"
          )}
        </div>
      </div>
      <div className="insp-context-row">
        <div className="insp-context-label">Characters in scene</div>
        <div className="insp-context-val insp-context-sm">
          {characters.length ? characters.map((c) => c.character.name).join(", ") : "—"}
        </div>
      </div>
    </div>
  );
}
