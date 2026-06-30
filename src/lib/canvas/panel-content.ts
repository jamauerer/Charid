import type {
  BubblePreset,
  TailAnchor,
  ThoughtDot,
} from "@/lib/canvas/comic-bubble-presets";
import type { ComicFontPreset } from "@/lib/canvas/comic-font-presets";
import {
  defaultStyleForKind,
  parseComicTextStyle,
  type ComicTextStyle,
} from "@/lib/canvas/comic-text-style";
import { estimateBubbleSizeForContent, fitTextToBubble } from "@/lib/canvas/text-bubble-fit";
import { createEmptyCanvasDocumentV1 } from "@/lib/canvas/create-empty-document-v1";
import type {
  CanvasDocumentV1,
  CanvasObjectV1,
  ImagePayloadV1,
  TextPayloadV1,
} from "@/types/canvas/document-v1";

export type { ComicTextStyle };
export { parseComicTextStyle, defaultStyleForKind };

function newObjectId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `obj-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const PANEL_ARTWORK_OBJECT_ID = "panel-artwork";

export const TEXT_OBJECT_KINDS = [
  "speech",
  "thought",
  "caption",
  "narration",
  "sfx",
  "free",
] as const;

export type TextObjectKind = (typeof TEXT_OBJECT_KINDS)[number];

export type ImageFitMode = "fit" | "fill" | "contain";

export type PanelArtworkMetadata = {
  storage_path?: string;
  image_fit?: ImageFitMode;
  offset_x?: number;
  offset_y?: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
};

export type TextObjectMetadata = {
  text_kind: TextObjectKind;
};

export type PanelContentSnapshot = {
  panelId: string;
  surfaceId: string | null;
  document: CanvasDocumentV1;
};

export function parsePanelDocument(raw: unknown): CanvasDocumentV1 {
  if (
    raw &&
    typeof raw === "object" &&
    "schema_version" in raw &&
    "layers" in raw &&
    "objects" in raw
  ) {
    return raw as CanvasDocumentV1;
  }
  return createEmptyCanvasDocumentV1("comic_panel");
}

export function getArtworkObject(document: CanvasDocumentV1): CanvasObjectV1 | null {
  return (
    document.objects.find(
      (obj) => obj.type === "image" && obj.id === PANEL_ARTWORK_OBJECT_ID
    ) ?? null
  );
}

export function getArtworkMetadata(object: CanvasObjectV1): PanelArtworkMetadata {
  const meta = object.metadata ?? {};
  return {
    storage_path:
      typeof meta.storage_path === "string" ? meta.storage_path : undefined,
    image_fit:
      meta.image_fit === "fit" ||
      meta.image_fit === "fill" ||
      meta.image_fit === "contain"
        ? meta.image_fit
        : "fill",
    offset_x: typeof meta.offset_x === "number" ? meta.offset_x : 0,
    offset_y: typeof meta.offset_y === "number" ? meta.offset_y : 0,
    scale: typeof meta.scale === "number" ? meta.scale : 1,
    rotation: typeof meta.rotation === "number" ? meta.rotation : 0,
    opacity: typeof meta.opacity === "number" ? meta.opacity : 1,
  };
}

export function payloadFitForMode(mode: ImageFitMode): ImagePayloadV1["fit"] {
  return mode === "contain" || mode === "fit" ? "contain" : "cover";
}

export function computeArtworkBaseSize(
  naturalWidth: number,
  naturalHeight: number,
  panelWidth: number,
  panelHeight: number,
  fitMode: ImageFitMode
): { width: number; height: number } {
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return { width: panelWidth, height: panelHeight };
  }

  if (fitMode === "fit") {
    const ratio = Math.min(1, panelWidth / naturalWidth, panelHeight / naturalHeight);
    return { width: naturalWidth * ratio, height: naturalHeight * ratio };
  }

  if (fitMode === "contain") {
    const ratio = Math.min(panelWidth / naturalWidth, panelHeight / naturalHeight);
    return { width: naturalWidth * ratio, height: naturalHeight * ratio };
  }

  const ratio = Math.max(panelWidth / naturalWidth, panelHeight / naturalHeight);
  return { width: naturalWidth * ratio, height: naturalHeight * ratio };
}

export function computeArtworkLayout(
  naturalWidth: number,
  naturalHeight: number,
  panelWidth: number,
  panelHeight: number,
  fitMode: ImageFitMode,
  scale: number,
  offsetX: number,
  offsetY: number
) {
  const base = computeArtworkBaseSize(
    naturalWidth,
    naturalHeight,
    panelWidth,
    panelHeight,
    fitMode
  );
  const width = base.width * scale;
  const height = base.height * scale;
  return {
    x: offsetX + (panelWidth - width) / 2,
    y: offsetY + (panelHeight - height) / 2,
    width,
    height,
    baseWidth: base.width,
    baseHeight: base.height,
  };
}

export function centeredArtworkOffsets(
  naturalWidth: number,
  naturalHeight: number,
  panelWidth: number,
  panelHeight: number,
  fitMode: ImageFitMode,
  scale: number
): { offset_x: number; offset_y: number } {
  return { offset_x: 0, offset_y: 0 };
}

export function createArtworkObject(
  panelWidth: number,
  panelHeight: number,
  storagePath: string,
  fitMode: ImageFitMode = "fill"
): CanvasObjectV1 {
  return {
    id: PANEL_ARTWORK_OBJECT_ID,
    type: "image",
    x: 0,
    y: 0,
    width: panelWidth,
    height: panelHeight,
    rotation: 0,
    layer_id: "layer-artwork",
    z_index: 0,
    locked: false,
    hidden: false,
    metadata: {
      storage_path: storagePath,
      image_fit: fitMode,
      offset_x: 0,
      offset_y: 0,
      scale: 1,
    },
    payload: {
      asset_ref: null,
      fit: payloadFitForMode(fitMode),
    },
  };
}

export function upsertArtworkObject(
  document: CanvasDocumentV1,
  panelWidth: number,
  panelHeight: number,
  storagePath: string,
  fitMode?: ImageFitMode
): CanvasDocumentV1 {
  const existing = getArtworkObject(document);
  const nextObject = existing
    ? {
        ...existing,
        width: panelWidth,
        height: panelHeight,
        metadata: {
          ...existing.metadata,
          storage_path: storagePath,
          image_fit: fitMode ?? getArtworkMetadata(existing).image_fit ?? "fill",
        },
      }
    : createArtworkObject(panelWidth, panelHeight, storagePath, fitMode ?? "fill");

  const objects = document.objects.filter((obj) => obj.id !== PANEL_ARTWORK_OBJECT_ID);
  return { ...document, objects: [...objects, nextObject] };
}

export function removeArtworkObject(document: CanvasDocumentV1): CanvasDocumentV1 {
  return {
    ...document,
    objects: document.objects.filter((obj) => obj.id !== PANEL_ARTWORK_OBJECT_ID),
  };
}

export function updateArtworkTransform(
  document: CanvasDocumentV1,
  patch: Partial<PanelArtworkMetadata>
): CanvasDocumentV1 {
  const artwork = getArtworkObject(document);
  if (!artwork) return document;

  const meta = getArtworkMetadata(artwork);
  const nextMeta = { ...meta, ...patch };
  const fit = payloadFitForMode(nextMeta.image_fit ?? "fill");

  return {
    ...document,
    objects: document.objects.map((obj) =>
      obj.id === PANEL_ARTWORK_OBJECT_ID
        ? {
            ...obj,
            metadata: nextMeta,
            payload: { ...(obj.payload as ImagePayloadV1), fit },
          }
        : obj
    ),
  };
}

export function getTextObjects(document: CanvasDocumentV1): CanvasObjectV1[] {
  return document.objects
    .filter((obj) => obj.type === "text")
    .sort((a, b) => a.z_index - b.z_index);
}

export function getTextKind(object: CanvasObjectV1): TextObjectKind {
  const kind = object.metadata?.text_kind;
  if (typeof kind === "string" && TEXT_OBJECT_KINDS.includes(kind as TextObjectKind)) {
    return kind as TextObjectKind;
  }
  return "free";
}

export function defaultTextSize(kind: TextObjectKind): { width: number; height: number; fontSize: number } {
  const content = defaultTextContent(kind);
  switch (kind) {
    case "sfx":
      return { width: 120, height: 48, fontSize: 26 };
    case "caption":
    case "narration": {
      const est = estimateBubbleSizeForContent(content, kind, 400, 600);
      return { width: est.width, height: est.height, fontSize: est.fontSize };
    }
    case "thought": {
      const est = estimateBubbleSizeForContent(content, kind, 400, 600);
      return { width: Math.max(est.width, 120), height: Math.max(est.height, 56), fontSize: est.fontSize };
    }
    case "speech": {
      const est = estimateBubbleSizeForContent(content, "speech", 400, 600);
      return { width: est.width, height: est.height, fontSize: Math.max(est.fontSize, 18) };
    }
    default:
      return { width: 120, height: 40, fontSize: 13 };
  }
}

export function defaultTextContent(kind: TextObjectKind): string {
  switch (kind) {
    case "speech":
      return "Dialogue…";
    case "thought":
      return "Thought…";
    case "caption":
      return "Caption…";
    case "narration":
      return "Narration…";
    case "sfx":
      return "BOOM!";
    default:
      return "Text…";
  }
}

export function refitTextObjectBounds(
  object: CanvasObjectV1,
  panelWidth: number,
  panelHeight: number
): Pick<CanvasObjectV1, "width" | "height"> & { font_size?: number; overflow?: boolean } {
  if (object.type !== "text") return { width: object.width, height: object.height };
  const kind = getTextKind(object);
  if (kind === "sfx") return { width: object.width, height: object.height };

  const payload = object.payload as TextPayloadV1;
  const style = getTextStyle(object);
  const content = payload.content || defaultTextContent(kind);
  const fontFamily = payload.font_family ?? "Comic Sans MS, cursive";
  const padding = style.padding ?? 10;
  const maxW = Math.min(panelWidth - 8, 280);
  const maxH = Math.min(panelHeight - 8, 160);

  const fit = fitTextToBubble({
    content,
    fontSize: payload.font_size ?? (kind === "caption" ? 12 : 13),
    fontFamily,
    fontStyle: `${payload.bold ?? style.bold ? "bold " : ""}${payload.italic ?? style.italic ? "italic" : ""}`.trim() || "normal",
    padding,
    lineHeight: payload.line_height ?? style.line_height ?? 1.25,
    minWidth: kind === "speech" ? 64 : 80,
    minHeight: kind === "speech" ? 36 : 28,
    maxWidth: maxW,
    maxHeight: maxH,
    minFontSize: 10,
  });

  return {
    width: fit.width,
    height: fit.height,
    font_size: fit.fontSize,
    overflow: fit.overflow,
  };
}

export function getTextStyle(object: CanvasObjectV1): ComicTextStyle {
  const kind = getTextKind(object);
  return parseComicTextStyle(object.metadata ?? {}, kind);
}

export function updateTextStyle(
  document: CanvasDocumentV1,
  objectId: string,
  patch: Partial<ComicTextStyle> & {
    bubble_preset?: BubblePreset;
    tail_base?: TailAnchor;
    tail_tip?: TailAnchor;
    thought_dots?: ThoughtDot[];
  }
): CanvasDocumentV1 {
  return {
    ...document,
    objects: document.objects.map((obj) => {
      if (obj.id !== objectId || obj.type !== "text") return obj;
      const kind = getTextKind(obj);
      const current = parseComicTextStyle(obj.metadata ?? {}, kind);
      const nextStyle = { ...current, ...patch };
      return {
        ...obj,
        metadata: {
          ...obj.metadata,
          text_kind: kind,
          comic_style: nextStyle,
        },
      };
    }),
  };
}

export function createTextObject(
  kind: TextObjectKind,
  panelWidth: number,
  panelHeight: number,
  zIndex: number
): CanvasObjectV1 {
  const size = defaultTextSize(kind);
  const style = defaultStyleForKind(kind);
  const fontPreset = style.font_preset;
  const layerId = "layer-text";

  return {
    id: newObjectId(),
    type: "text",
    x: Math.max(8, (panelWidth - size.width) / 2),
    y: Math.max(8, panelHeight * 0.15),
    width: size.width,
    height: size.height,
    rotation: 0,
    layer_id: layerId,
    z_index: zIndex,
    locked: false,
    hidden: false,
    metadata: {
      text_kind: kind,
      comic_style: style,
    },
    payload: {
      content: defaultTextContent(kind),
      font_size: size.fontSize,
      font_family: kind === "sfx" ? "Impact, sans-serif" : "Comic Sans MS, cursive",
      align: "center",
      font_preset: fontPreset,
      bold: style.bold,
      italic: style.italic,
      underline: style.underline,
      letter_spacing: style.letter_spacing,
      line_height: style.line_height,
      fill_color: style.fill_color,
    } satisfies TextPayloadV1,
  };
}

export function addTextObject(
  document: CanvasDocumentV1,
  kind: TextObjectKind,
  panelWidth: number,
  panelHeight: number
): { document: CanvasDocumentV1; objectId: string } {
  const maxZ = document.objects.reduce((max, obj) => Math.max(max, obj.z_index), 0);
  const object = createTextObject(kind, panelWidth, panelHeight, maxZ + 1);
  return {
    document: { ...document, objects: [...document.objects, object] },
    objectId: object.id,
  };
}

export function updateTextObject(
  document: CanvasDocumentV1,
  objectId: string,
  patch: Partial<Pick<CanvasObjectV1, "x" | "y" | "width" | "height" | "rotation" | "z_index">> & {
    content?: string;
    font_size?: number;
    font_family?: string;
    align?: TextPayloadV1["align"];
    font_preset?: ComicFontPreset;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    letter_spacing?: number;
    line_height?: number;
    fill_color?: string;
    style?: Partial<ComicTextStyle>;
  },
  panelSize?: { width: number; height: number }
): CanvasDocumentV1 {
  let next = document;
  if (patch.style) {
    next = updateTextStyle(next, objectId, patch.style);
  }

  const shouldRefit =
    panelSize &&
    (patch.content !== undefined ||
      patch.font_size !== undefined ||
      patch.font_family !== undefined ||
      patch.bold !== undefined ||
      patch.italic !== undefined);

  return {
    ...next,
    objects: next.objects.map((obj) => {
      if (obj.id !== objectId || obj.type !== "text") return obj;
      const payload = obj.payload as TextPayloadV1;
      const mergedPayload = {
        ...payload,
        content: patch.content ?? payload.content,
        font_size: patch.font_size ?? payload.font_size,
        font_family: patch.font_family ?? payload.font_family,
        align: patch.align ?? payload.align,
        font_preset: patch.font_preset ?? payload.font_preset,
        bold: patch.bold ?? payload.bold,
        italic: patch.italic ?? payload.italic,
        underline: patch.underline ?? payload.underline,
        letter_spacing: patch.letter_spacing ?? payload.letter_spacing,
        line_height: patch.line_height ?? payload.line_height,
        fill_color: patch.fill_color ?? payload.fill_color,
      };

      let width = patch.width ?? obj.width;
      let height = patch.height ?? obj.height;
      let fontSize = mergedPayload.font_size;
      let textOverflow = Boolean(obj.metadata?.text_overflow);

      if (shouldRefit && panelSize) {
        const draft = {
          ...obj,
          width,
          height,
          payload: mergedPayload,
        };
        const refit = refitTextObjectBounds(draft, panelSize.width, panelSize.height);
        width = refit.width;
        height = refit.height;
        if (refit.font_size !== undefined) fontSize = refit.font_size;
        textOverflow = Boolean(refit.overflow);
      }

      return {
        ...obj,
        x: patch.x ?? obj.x,
        y: patch.y ?? obj.y,
        width,
        height,
        rotation: patch.rotation ?? obj.rotation,
        z_index: patch.z_index ?? obj.z_index,
        metadata: {
          ...obj.metadata,
          text_overflow: textOverflow,
        },
        payload: {
          ...mergedPayload,
          font_size: fontSize,
        },
      };
    }),
  };
}

export function deleteTextObject(document: CanvasDocumentV1, objectId: string): CanvasDocumentV1 {
  return {
    ...document,
    objects: document.objects.filter((obj) => obj.id !== objectId),
  };
}

export function duplicateTextObject(
  document: CanvasDocumentV1,
  objectId: string
): { document: CanvasDocumentV1; newObjectId: string | null } {
  const source = document.objects.find((obj) => obj.id === objectId);
  if (!source || source.type !== "text") {
    return { document, newObjectId: null };
  }

  const maxZ = document.objects.reduce((max, obj) => Math.max(max, obj.z_index), 0);
  const clone: CanvasObjectV1 = {
    ...source,
    id: newObjectId(),
    x: source.x + 16,
    y: source.y + 16,
    z_index: maxZ + 1,
    metadata: { ...source.metadata },
    payload: { ...(source.payload as TextPayloadV1) },
  };

  return {
    document: { ...document, objects: [...document.objects, clone] },
    newObjectId: clone.id,
  };
}

export function reorderObject(
  document: CanvasDocumentV1,
  objectId: string,
  direction: "front" | "back" | "forward" | "backward"
): CanvasDocumentV1 {
  const objects = [...document.objects];
  const index = objects.findIndex((obj) => obj.id === objectId);
  if (index === -1) return document;

  const sorted = [...objects].sort((a, b) => a.z_index - b.z_index);
  const sortedIndex = sorted.findIndex((obj) => obj.id === objectId);
  if (sortedIndex === -1) return document;

  let targetIndex = sortedIndex;
  if (direction === "front") targetIndex = sorted.length - 1;
  else if (direction === "back") targetIndex = 0;
  else if (direction === "forward") targetIndex = Math.min(sortedIndex + 1, sorted.length - 1);
  else if (direction === "backward") targetIndex = Math.max(sortedIndex - 1, 0);

  if (targetIndex === sortedIndex) return document;

  const [item] = sorted.splice(sortedIndex, 1);
  sorted.splice(targetIndex, 0, item);

  const zById = new Map(sorted.map((obj, i) => [obj.id, i]));
  return {
    ...document,
    objects: objects.map((obj) => ({
      ...obj,
      z_index: zById.get(obj.id) ?? obj.z_index,
    })),
  };
}

export function scalePanelContent(
  document: CanvasDocumentV1,
  oldWidth: number,
  oldHeight: number,
  newWidth: number,
  newHeight: number
): CanvasDocumentV1 {
  if (oldWidth <= 0 || oldHeight <= 0) return document;
  const scaleX = newWidth / oldWidth;
  const scaleY = newHeight / oldHeight;

  return {
    ...document,
    objects: document.objects.map((obj) => ({
      ...obj,
      x: obj.x * scaleX,
      y: obj.y * scaleY,
      width: obj.width * scaleX,
      height: obj.height * scaleY,
    })),
  };
}
