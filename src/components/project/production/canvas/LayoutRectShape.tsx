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
  onSelect: () => void;
  onChange: (next: Pick<LayoutRectItem, "x" | "y" | "width" | "height">) => void;
};

export function LayoutRectShape({
  item,
  selected,
  borderStyle = "black",
  onSelect,
  onChange,
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
        draggable
        onMouseEnter={(event) => {
          setHovered(true);
          const container = event.target.getStage()?.container();
          if (container) container.style.cursor = "move";
        }}
        onMouseLeave={(event) => {
          setHovered(false);
          const container = event.target.getStage()?.container();
          if (container) container.style.cursor = "default";
        }}
        onClick={(event) => {
          event.cancelBubble = true;
          onSelect();
        }}
        onTap={(event) => {
          event.cancelBubble = true;
          onSelect();
        }}
        onDragStart={() => {
          isInteractingRef.current = true;
        }}
        onDragEnd={() => {
          isInteractingRef.current = false;
          commitGeometry();
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
          hitStrokeWidth={12}
        />
        <Text
          text={item.label}
          x={8}
          y={8}
          width={Math.max(0, item.width - 16)}
          fontSize={13}
          fill="#475569"
          listening={false}
          perfectDrawEnabled={false}
        />
      </Group>
      {selected && (
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
