"use server";

import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { updateSurfaceDocument } from "@/app/actions/canvas/surfaces";
import { ensurePanelSurface } from "@/app/actions/canvas/linking";
import {
  assertProductionProject,
  formatProductionError,
} from "@/lib/production-server";
import { revalidateProjectCanvas } from "@/lib/canvas/canvas-server";
import {
  getArtworkObject,
  PANEL_ARTWORK_OBJECT_ID,
  parsePanelDocument,
  removeArtworkObject,
  updateArtworkTransform,
  upsertArtworkObject,
  type ImageFitMode,
} from "@/lib/canvas/panel-content";
import { canvasDocumentToJson } from "@/lib/canvas/create-empty-document-v1";
import { productionPanelArtworkPath } from "@/lib/canvas/production-storage-path";
import { scanUploadedImage } from "@/lib/moderation/scan-image";
import {
  CHARACTER_PHOTOS_BUCKET,
  getSignedStorageUrl,
} from "@/lib/storage/signed-url";
import {
  normalizeProductionSurface,
  type ProductionSurfaceRow,
} from "@/types/canvas/surface";
import type { CanvasDocumentV1 } from "@/types/canvas/document-v1";

const BUCKET = CHARACTER_PHOTOS_BUCKET;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type PanelSurfaceEntry = {
  panelId: string;
  surfaceId: string;
  document: CanvasDocumentV1;
  artworkUrl: string | null;
};

function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Image must be a JPEG, PNG, or WebP file.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Image must be 10 MB or smaller.";
  }
  return null;
}

function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

async function assertPanelOwned(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  panelId: string
): Promise<{
  panel?: {
    id: string;
    surface_id: string | null;
    frame_width: number | null;
    frame_height: number | null;
  };
  error?: string;
}> {
  const { data: panel } = await supabase
    .from("comic_panels")
    .select("id, page_id, surface_id, frame_width, frame_height")
    .eq("id", panelId)
    .maybeSingle();

  if (!panel) return { error: "Panel not found." };

  const { data: page } = await supabase
    .from("comic_pages")
    .select("issue_id")
    .eq("id", panel.page_id as string)
    .maybeSingle();

  if (!page) return { error: "Panel not found." };

  const { data: issue } = await supabase
    .from("comic_issues")
    .select("project_id")
    .eq("id", page.issue_id as string)
    .eq("project_id", projectId)
    .maybeSingle();

  if (!issue) return { error: "Panel not found." };

  return {
    panel: {
      id: panel.id as string,
      surface_id: panel.surface_id as string | null,
      frame_width: panel.frame_width as number | null,
      frame_height: panel.frame_height as number | null,
    },
  };
}

export async function getComicPagePanelSurfaces(
  projectId: string,
  panelIds: string[]
): Promise<{ entries: PanelSurfaceEntry[]; error?: string }> {
  if (panelIds.length === 0) return { entries: [] };

  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { entries: [], error: check.error };

  const surfaceIds: string[] = [];
  const panelBySurface = new Map<string, string>();

  for (const panelId of panelIds) {
    const owned = await assertPanelOwned(supabase, projectId, panelId);
    if (owned.error || !owned.panel) continue;

    let surfaceId = owned.panel.surface_id;
    if (!surfaceId) {
      const ensured = await ensurePanelSurface(projectId, panelId);
      if (ensured.error || !ensured.surface) continue;
      surfaceId = ensured.surface.id;
    }

    surfaceIds.push(surfaceId);
    panelBySurface.set(surfaceId, panelId);
  }

  if (surfaceIds.length === 0) return { entries: [] };

  const { data, error } = await supabase
    .from("production_surfaces")
    .select("*")
    .eq("project_id", projectId)
    .in("id", surfaceIds);

  if (error) {
    return { entries: [], error: formatProductionError(error.message, error.code) };
  }

  const entries: PanelSurfaceEntry[] = [];

  for (const row of data ?? []) {
    const surface = normalizeProductionSurface(row as ProductionSurfaceRow);
    const panelId = panelBySurface.get(surface.id);
    if (!panelId) continue;

    const document = parsePanelDocument(surface.canvas_document);
    const artwork = getArtworkObject(document);
    const storagePath =
      artwork && typeof artwork.metadata?.storage_path === "string"
        ? artwork.metadata.storage_path
        : null;

    let artworkUrl: string | null = null;
    if (storagePath) {
      artworkUrl = await getSignedStorageUrl(supabase, storagePath, { bucket: BUCKET });
    }

    entries.push({ panelId, surfaceId: surface.id, document, artworkUrl });
  }

  return { entries };
}

export async function savePanelSurfaceDocument(
  projectId: string,
  surfaceId: string,
  document: CanvasDocumentV1
): Promise<{ error?: string }> {
  const result = await updateSurfaceDocument(
    projectId,
    surfaceId,
    canvasDocumentToJson(document)
  );
  return { error: result.error };
}

export async function uploadPanelArtwork(
  projectId: string,
  panelId: string,
  formData: FormData
): Promise<{
  artworkUrl?: string;
  surfaceId?: string;
  document?: CanvasDocumentV1;
  error?: string;
}> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "No image file provided." };
  }

  const validationError = validateImage(file);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  const owned = await assertPanelOwned(supabase, projectId, panelId);
  if (owned.error || !owned.panel) return { error: owned.error ?? "Panel not found." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  let surfaceId = owned.panel.surface_id;
  if (!surfaceId) {
    const ensured = await ensurePanelSurface(projectId, panelId);
    if (ensured.error || !ensured.surface) {
      return { error: ensured.error ?? "Failed to prepare panel surface." };
    }
    surfaceId = ensured.surface.id;
  }

  const { data: surfaceRow } = await supabase
    .from("production_surfaces")
    .select("*")
    .eq("id", surfaceId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (!surfaceRow) return { error: "Panel surface not found." };

  const surface = normalizeProductionSurface(surfaceRow as ProductionSurfaceRow);
  const document = parsePanelDocument(surface.canvas_document);

  const panelWidth = owned.panel.frame_width ?? 400;
  const panelHeight = owned.panel.frame_height ?? 500;
  const widthField = formData.get("panelWidth");
  const heightField = formData.get("panelHeight");
  const layoutWidth =
    typeof widthField === "string" && widthField ? Number(widthField) : panelWidth;
  const layoutHeight =
    typeof heightField === "string" && heightField ? Number(heightField) : panelHeight;
  const ext = extensionForMime(file.type);
  const storagePath = productionPanelArtworkPath(user.id, projectId, panelId, ext);

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const existingArtwork = getArtworkObject(document);
  const oldPath =
    existingArtwork && typeof existingArtwork.metadata?.storage_path === "string"
      ? existingArtwork.metadata.storage_path
      : null;

  const nextDocument = upsertArtworkObject(
    document,
    layoutWidth,
    layoutHeight,
    storagePath,
    "fill"
  );
  const saveResult = await updateSurfaceDocument(
    projectId,
    surfaceId,
    canvasDocumentToJson(nextDocument)
  );

  if (saveResult.error) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return { error: saveResult.error };
  }

  if (oldPath && oldPath !== storagePath) {
    await supabase.storage.from(BUCKET).remove([oldPath]);
  }

  void scanUploadedImage({
    supabase,
    userId: user.id,
    entityType: "project",
    entityId: projectId,
    storageBucket: BUCKET,
    storagePath,
    mimeType: file.type,
  });

  revalidateProjectCanvas(projectId);
  const artworkUrl = await getSignedStorageUrl(supabase, storagePath, { bucket: BUCKET });
  return {
    artworkUrl: artworkUrl ?? undefined,
    surfaceId,
    document: nextDocument,
  };
}

export async function removePanelArtwork(
  projectId: string,
  panelId: string
): Promise<{ document?: CanvasDocumentV1; error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  const owned = await assertPanelOwned(supabase, projectId, panelId);
  if (owned.error || !owned.panel?.surface_id) {
    return { error: owned.error ?? "Panel not found." };
  }

  const { data: surfaceRow } = await supabase
    .from("production_surfaces")
    .select("*")
    .eq("id", owned.panel.surface_id)
    .maybeSingle();

  if (!surfaceRow) return { error: "Panel surface not found." };

  const surface = normalizeProductionSurface(surfaceRow as ProductionSurfaceRow);
  const document = parsePanelDocument(surface.canvas_document);
  const artwork = getArtworkObject(document);
  const storagePath =
    artwork && typeof artwork.metadata?.storage_path === "string"
      ? artwork.metadata.storage_path
      : null;

  const nextDocument = removeArtworkObject(document);
  const saveResult = await updateSurfaceDocument(
    projectId,
    owned.panel.surface_id,
    canvasDocumentToJson(nextDocument)
  );

  if (saveResult.error) return { error: saveResult.error };

  if (storagePath) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
  }

  revalidateProjectCanvas(projectId);
  return { document: nextDocument };
}

async function cloneStoragePath(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sourcePath: string,
  userId: string,
  projectId: string,
  targetPanelId: string
): Promise<string | null> {
  const ext = sourcePath.split(".").pop() ?? "jpg";
  const targetPath = productionPanelArtworkPath(userId, projectId, targetPanelId, ext);
  const { data: blob, error: downloadError } = await supabase.storage
    .from(BUCKET)
    .download(sourcePath);

  if (downloadError || !blob) return null;

  const buffer = Buffer.from(await blob.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(targetPath, buffer, { upsert: false });

  if (uploadError) return null;
  return targetPath;
}

function cloneDocumentForPanel(
  document: CanvasDocumentV1,
  sourcePanelWidth: number,
  sourcePanelHeight: number,
  targetPanelWidth: number,
  targetPanelHeight: number,
  artworkPathMap: Map<string, string>
): CanvasDocumentV1 {
  const scaleX = targetPanelWidth / Math.max(sourcePanelWidth, 1);
  const scaleY = targetPanelHeight / Math.max(sourcePanelHeight, 1);

  return {
    ...document,
    objects: document.objects.map((obj) => {
      if (obj.type === "image" && obj.id === PANEL_ARTWORK_OBJECT_ID) {
        const storagePath =
          typeof obj.metadata?.storage_path === "string" ? obj.metadata.storage_path : null;
        const nextPath = storagePath ? artworkPathMap.get(storagePath) ?? storagePath : null;
        return {
          ...obj,
          x: obj.x * scaleX,
          y: obj.y * scaleY,
          width: obj.width * scaleX,
          height: obj.height * scaleY,
          metadata: {
            ...obj.metadata,
            storage_path: nextPath ?? storagePath,
          },
        };
      }
      if (obj.type === "text") {
        return {
          ...obj,
          x: obj.x * scaleX,
          y: obj.y * scaleY,
          width: obj.width * scaleX,
          height: obj.height * scaleY,
        };
      }
      return obj;
    }),
  };
}

export async function duplicateComicPagePanelWithContent(
  projectId: string,
  pageId: string,
  sourcePanelId: string,
  frame: { x: number; y: number; width: number; height: number }
): Promise<{ panelId?: string; entry?: PanelSurfaceEntry; error?: string }> {
  const { addComicPagePanel } = await import("@/app/actions/production/page-layout");

  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  const owned = await assertPanelOwned(supabase, projectId, sourcePanelId);
  if (owned.error || !owned.panel) return { error: owned.error ?? "Panel not found." };

  let sourceSurfaceId = owned.panel.surface_id;
  if (!sourceSurfaceId) {
    const ensured = await ensurePanelSurface(projectId, sourcePanelId);
    if (ensured.error || !ensured.surface) {
      return { error: ensured.error ?? "Source panel surface missing." };
    }
    sourceSurfaceId = ensured.surface.id;
  }

  const createResult = await addComicPagePanel(projectId, pageId, frame);
  if (createResult.error || !createResult.panel) {
    return { error: createResult.error ?? "Failed to create duplicate panel." };
  }

  const newPanelId = createResult.panel.id;
  let newSurfaceId = createResult.panel.surface_id;
  if (!newSurfaceId) {
    const ensured = await ensurePanelSurface(projectId, newPanelId);
    if (ensured.error || !ensured.surface) {
      return { error: ensured.error ?? "Failed to prepare duplicate panel surface." };
    }
    newSurfaceId = ensured.surface.id;
  }

  const { data: sourceSurfaceRow } = await supabase
    .from("production_surfaces")
    .select("*")
    .eq("id", sourceSurfaceId)
    .maybeSingle();

  if (!sourceSurfaceRow) {
    return { panelId: newPanelId, error: "Source surface not found." };
  }

  const sourceSurface = normalizeProductionSurface(sourceSurfaceRow as ProductionSurfaceRow);
  const sourceDocument = parsePanelDocument(sourceSurface.canvas_document);
  const sourceWidth = owned.panel.frame_width ?? frame.width;
  const sourceHeight = owned.panel.frame_height ?? frame.height;

  const artworkPathMap = new Map<string, string>();
  const sourceArtwork = getArtworkObject(sourceDocument);
  const sourcePath =
    sourceArtwork && typeof sourceArtwork.metadata?.storage_path === "string"
      ? sourceArtwork.metadata.storage_path
      : null;

  if (sourcePath) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be logged in." };
    const clonedPath = await cloneStoragePath(supabase, sourcePath, user.id, projectId, newPanelId);
    if (clonedPath) artworkPathMap.set(sourcePath, clonedPath);
  }

  const clonedDocument = cloneDocumentForPanel(
    sourceDocument,
    sourceWidth,
    sourceHeight,
    frame.width,
    frame.height,
    artworkPathMap
  );

  const saveResult = await updateSurfaceDocument(
    projectId,
    newSurfaceId,
    canvasDocumentToJson(clonedDocument)
  );

  if (saveResult.error) return { error: saveResult.error };

  const clonedArtwork = getArtworkObject(clonedDocument);
  const storagePath =
    clonedArtwork && typeof clonedArtwork.metadata?.storage_path === "string"
      ? clonedArtwork.metadata.storage_path
      : null;

  let artworkUrl: string | null = null;
  if (storagePath) {
    artworkUrl = await getSignedStorageUrl(supabase, storagePath, { bucket: BUCKET });
  }

  revalidateProjectCanvas(projectId);

  return {
    panelId: newPanelId,
    entry: {
      panelId: newPanelId,
      surfaceId: newSurfaceId,
      document: clonedDocument,
      artworkUrl,
    },
  };
}

export async function setPanelArtworkFitMode(
  projectId: string,
  panelId: string,
  fitMode: ImageFitMode
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const check = await assertProductionProject(supabase, projectId, "comic");
  if (check.error) return { error: check.error };

  const owned = await assertPanelOwned(supabase, projectId, panelId);
  if (owned.error || !owned.panel?.surface_id) {
    return { error: owned.error ?? "Panel not found." };
  }

  const { data: surfaceRow } = await supabase
    .from("production_surfaces")
    .select("*")
    .eq("id", owned.panel.surface_id)
    .maybeSingle();

  if (!surfaceRow) return { error: "Panel surface not found." };

  const surface = normalizeProductionSurface(surfaceRow as ProductionSurfaceRow);
  const document = parsePanelDocument(surface.canvas_document);
  const artwork = getArtworkObject(document);
  if (!artwork) return { error: "No artwork on this panel." };

  const nextDocument = updateArtworkTransform(document, { image_fit: fitMode });

  const saveResult = await updateSurfaceDocument(
    projectId,
    owned.panel.surface_id,
    canvasDocumentToJson(nextDocument)
  );

  return { error: saveResult.error };
}
