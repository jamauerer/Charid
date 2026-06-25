import {
  CANVAS_DOCUMENT_SCHEMA_VERSION,
  type CanvasDocumentV1,
  type LayerDefinitionV1,
  type LayerKind,
} from "@/types/canvas/document-v1";
import type { SurfaceKind } from "@/types/canvas/surface";

const DEFAULT_LAYER_IDS: Record<LayerKind, string> = {
  background: "layer-background",
  artwork: "layer-artwork",
  text: "layer-text",
  bubble: "layer-bubble",
  caption: "layer-caption",
  effects: "layer-effects",
  reference: "layer-reference",
};

function layerDefinition(kind: LayerKind, locked = false): LayerDefinitionV1 {
  return {
    id: DEFAULT_LAYER_IDS[kind],
    kind,
    visible: true,
    locked,
  };
}

const DEFAULT_LAYERS_BY_KIND: Partial<Record<SurfaceKind, LayerKind[]>> = {
  comic_panel: ["background", "artwork", "text"],
  storybook_spread: ["background", "artwork", "text"],
  comic_page_layout: ["background"],
  character_sheet: ["background", "artwork", "text"],
  lore_page: ["background", "artwork", "text"],
  worksheet: ["background", "artwork", "text"],
  portfolio_page: ["background", "artwork", "text"],
  marketing_page: ["background", "artwork", "text"],
};

export function createEmptyCanvasDocumentV1(
  surfaceKind: SurfaceKind
): CanvasDocumentV1 {
  const layerKinds = DEFAULT_LAYERS_BY_KIND[surfaceKind] ?? ["background", "artwork", "text"];

  return {
    schema_version: CANVAS_DOCUMENT_SCHEMA_VERSION,
    layers: layerKinds.map((kind) => layerDefinition(kind, kind === "background")),
    objects: [],
    metadata: {},
  };
}

export function canvasDocumentToJson(document: CanvasDocumentV1): Record<string, unknown> {
  return document as unknown as Record<string, unknown>;
}
