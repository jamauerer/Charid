"use client";

import { useEffect, useRef, useState } from "react";
import { Group, Rect, Text, Transformer } from "react-konva";
import type Konva from "konva";
import {
  panelBorderStroke,
  type PanelBorderStyle,
} from "@/lib/canvas/panel-border-style";

export type LayoutRectItem = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke?: string;
};

type LayoutRectShapeProps = {
  item: LayoutRectItem;
  selected: boolean;
  borderStyle?: PanelBorderStyle;
  resizeMode?: "linked" | "independent" | "freeform";
  interactive?: boolean;
  onSelect: (additive?: boolean) => void;
  onChange: (next: Pick<LayoutRectItem, "x" | "y" | "width" | "height">) => void;
  onInteractionEnd?: () => void;
};

export function LayoutRectShape({
  item,
  selected,
  borderStyle = "black",
  resizeMode = "linked",
  interactive = true,
  onSelect,
  onChange,
  onInteractionEnd,
}: LayoutRectShapeProps) {
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const isInteractingRef = useRef(false);
  const [hovered, setHovered] = useState(false);

  const border = panelBorderStroke(borderStyle, selected, hovered, item.stroke);

  useEffect(() => {
    if (isInteractingRef.current || !groupRef.current) return;
    const node = groupRef.current;
    node.x(item.x);
    node.y(item.y);
    node.scaleX(1);
    node.scaleY(1);
    node.getLayer()?.batchDraw();
  }, [item.x, item.y]);

  useEffect(() => {
    const node = groupRef.current;
    if (!node || isInteractingRef.current) return;
    const rect = node.findOne("Rect") as Konva.Rect | undefined;
    if (!rect) return;
    rect.width(item.width);
    rect.height(item.height);
    node.getLayer()?.batchDraw();
  }, [item.width, item.height]);

  useEffect(() => {
    if (!selected || !transformerRef.current || !groupRef.current) return;
    transformerRef.current.nodes([groupRef.current]);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selected, item.width, item.height]);

  function commitGeometry() {
    const node = groupRef.current;
    if (!node) return;
    const rect = node.findOne("Rect") as Konva.Rect | undefined;
    if (!rect) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const width = Math.max(40, rect.width() * scaleX);
    const height = Math.max(40, rect.height() * scaleY);
    node.scaleX(1);
    node.scaleY(1);
    rect.width(width);
    rect.height(height);
    onChange({
      x: node.x(),
      y: node.y(),
      width,
      height,
    });
  }

  return (
    <>
      <Group
        ref={groupRef}
        x={item.x}
        y={item.y}
        draggable={interactive}
        listening={interactive}
        onMouseEnter={(event) => {
          if (!interactive) return;
          setHovered(true);
          const container = event.target.getStage()?.container();
          if (container) container.style.cursor = "move";
        }}
        onMouseLeave={(event) => {
          if (!interactive) return;
          setHovered(false);
          const container = event.target.getStage()?.container();
          if (container) container.style.cursor = "default";
        }}
        onClick={(event) => {
          event.cancelBubble = true;
          onSelect(event.evt.shiftKey);
        }}
        onTap={(event) => {
          event.cancelBubble = true;
          onSelect(false);
        }}
        onDragStart={() => {
          isInteractingRef.current = true;
        }}
        onDragEnd={() => {
          isInteractingRef.current = false;
          commitGeometry();
          onInteractionEnd?.();
        }}
        onTransformStart={() => {
          isInteractingRef.current = true;
        }}
        onTransform={() => {
          transformerRef.current?.getLayer()?.batchDraw();
        }}
        onTransformEnd={() => {
          isInteractingRef.current = false;
          commitGeometry();
          onInteractionEnd?.();
        }}
      >
        <Rect
          width={item.width}
          height={item.height}
          fill={item.fill}
          stroke={border.stroke}
          strokeWidth={border.strokeWidth}
          dash={border.dash}
          cornerRadius={2}
          perfectDrawEnabled={false}
          shadowForStrokeEnabled={false}
          hitStrokeWidth={selected ? 14 : hovered ? 10 : 8}
          shadowBlur={selected ? 6 : hovered ? 2 : 0}
          shadowColor="rgba(99, 102, 241, 0.35)"
          shadowOpacity={selected ? 0.6 : 0.25}
        />
        <Text
          text={item.label}
          x={8}
          y={8}
          width={Math.max(0, item.width - 16)}
          fontSize={13}
          fill={resizeMode === "freeform" ? "#6366f1" : "#475569"}
          listening={false}
          perfectDrawEnabled={false}
        />
      </Group>
      {selected && interactive && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          keepRatio={false}
          enabledAnchors={[
            "top-left",
            "top-center",
            "top-right",
            "middle-left",
            "middle-right",
            "bottom-left",
            "bottom-center",
            "bottom-right",
          ]}
          anchorSize={8}
          anchorCornerRadius={2}
          borderStroke="#6366f1"
          borderStrokeWidth={2}
          anchorStroke="#6366f1"
          anchorFill="#ffffff"
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 40 || newBox.height < 40) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}
