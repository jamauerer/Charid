"use client";

import { useEffect, useRef, useState } from "react";
import { Group, Image as KonvaImage, Transformer } from "react-konva";
import type Konva from "konva";
import {
  computeArtworkLayout,
  getArtworkMetadata,
  getArtworkObject,
} from "@/lib/canvas/panel-content";
import type { CanvasDocumentV1 } from "@/types/canvas/document-v1";

type PanelArtworkShapeProps = {
  document: CanvasDocumentV1;
  imageUrl: string | null;
  panelWidth: number;
  panelHeight: number;
  clipX: number;
  clipY: number;
  selected: boolean;
  interactive?: boolean;
  onSelect: () => void;
  onDoubleClick?: () => void;
  onTransformChange: (patch: {
    offset_x?: number;
    offset_y?: number;
    scale?: number;
    rotation?: number;
    opacity?: number;
  }) => void;
};

export function PanelArtworkShape({
  document,
  imageUrl,
  panelWidth,
  panelHeight,
  clipX,
  clipY,
  selected,
  interactive = true,
  onSelect,
  onDoubleClick,
  onTransformChange,
}: PanelArtworkShapeProps) {
  const artwork = getArtworkObject(document);
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const naturalSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      setLoadError(null);
      return;
    }
    setLoadError(null);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      naturalSizeRef.current = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
      setImage(img);
    };
    img.onerror = () => {
      setImage(null);
      setLoadError("Could not load artwork preview");
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!selected || !transformerRef.current || !groupRef.current) return;
    transformerRef.current.nodes([groupRef.current]);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selected, panelWidth, panelHeight, imageUrl]);

  if (!artwork || !imageUrl) return null;
  if (loadError && !image) return null;

  const meta = getArtworkMetadata(artwork);
  const scale = meta.scale ?? 1;
  const offsetX = meta.offset_x ?? 0;
  const offsetY = meta.offset_y ?? 0;
  const fitMode = meta.image_fit ?? "fill";
  const rotation = meta.rotation ?? 0;

  const layout = image
    ? computeArtworkLayout(
        naturalSizeRef.current.width || image.naturalWidth,
        naturalSizeRef.current.height || image.naturalHeight,
        panelWidth,
        panelHeight,
        fitMode,
        scale,
        offsetX,
        offsetY
      )
    : {
        x: offsetX,
        y: offsetY,
        width: panelWidth,
        height: panelHeight,
        baseWidth: panelWidth,
        baseHeight: panelHeight,
      };

  function commitDrag(node: Konva.Group) {
    const { width: nw, height: nh } = naturalSizeRef.current;
    const base = computeArtworkLayout(nw, nh, panelWidth, panelHeight, fitMode, scale, 0, 0);
    const absX = node.x() - clipX;
    const absY = node.y() - clipY;
    onTransformChange({
      offset_x: absX - (panelWidth - base.width) / 2,
      offset_y: absY - (panelHeight - base.height) / 2,
      rotation: node.rotation(),
    });
  }

  function commitTransform() {
    const node = groupRef.current;
    if (!node) return;
    const { width: nw, height: nh } = naturalSizeRef.current;
    const base = computeArtworkLayout(nw, nh, panelWidth, panelHeight, fitMode, 1, 0, 0);
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const uniform = (scaleX + scaleY) / 2;
    const nextScale = Math.min(4, Math.max(0.15, scale * uniform));
    node.scaleX(1);
    node.scaleY(1);
    const absX = node.x() - clipX;
    const absY = node.y() - clipY;
    const scaledLayout = computeArtworkLayout(
      nw,
      nh,
      panelWidth,
      panelHeight,
      fitMode,
      nextScale,
      0,
      0
    );
    onTransformChange({
      scale: nextScale,
      rotation: node.rotation(),
      offset_x: absX - (panelWidth - scaledLayout.width) / 2,
      offset_y: absY - (panelHeight - scaledLayout.height) / 2,
    });
  }

  return (
    <Group clipX={clipX} clipY={clipY} clipWidth={panelWidth} clipHeight={panelHeight}>
      <Group
        ref={groupRef}
        x={clipX + layout.x}
        y={clipY + layout.y}
        rotation={rotation}
        draggable={interactive}
        listening={interactive}
        onClick={(event) => {
          if (!interactive) return;
          event.cancelBubble = true;
          onSelect();
        }}
        onTap={(event) => {
          if (!interactive) return;
          event.cancelBubble = true;
          onSelect();
        }}
        onDblClick={(event) => {
          if (!interactive) return;
          event.cancelBubble = true;
          onDoubleClick?.();
        }}
        onDragEnd={(event) => {
          if (!interactive) return;
          commitDrag(event.target as Konva.Group);
        }}
        onTransformEnd={() => {
          if (!interactive) return;
          commitTransform();
        }}
      >
        <KonvaImage
          image={image ?? undefined}
          width={layout.width}
          height={layout.height}
          opacity={meta.opacity ?? 1}
          perfectDrawEnabled={false}
          onWheel={(event) => {
            if (!interactive) return;
            event.evt.preventDefault();
            event.evt.stopPropagation();
            const direction = event.evt.deltaY > 0 ? -0.05 : 0.05;
            const nextScale = Math.min(4, Math.max(0.15, scale + direction));
            onTransformChange({ scale: nextScale });
          }}
        />
      </Group>
      {selected && interactive && (
        <Transformer
          ref={transformerRef}
          rotateEnabled
          keepRatio
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
            "middle-left",
            "middle-right",
          ]}
          anchorSize={8}
          anchorCornerRadius={2}
          borderStroke="#6366f1"
          borderStrokeWidth={2}
          anchorStroke="#6366f1"
          anchorFill="#ffffff"
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 24 || newBox.height < 24) return oldBox;
            return newBox;
          }}
        />
      )}
    </Group>
  );
}
