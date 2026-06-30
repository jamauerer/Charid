"use client";

import { useEffect, useRef } from "react";
import { Circle, Group, Path, Rect, Text, Transformer } from "react-konva";
import type Konva from "konva";
import {
  DEFAULT_SPEECH_TAIL_TIP,
  DEFAULT_THOUGHT_DOT_TIP,
  speechBubbleBodyPath,
  speechBubbleTailPath,
  thoughtCloudBodyPath,
  thoughtDotsLayout,
  type TailTip,
} from "@/lib/canvas/comic-bubble-vectors";
import { resolveFontPreset } from "@/lib/canvas/comic-font-presets";
import { getTextKind, getTextStyle } from "@/lib/canvas/panel-content";
import type { CanvasObjectV1, TextPayloadV1 } from "@/types/canvas/document-v1";

type ComicTextObjectShapeProps = {
  object: CanvasObjectV1;
  clipX: number;
  clipY: number;
  selected: boolean;
  selectable: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<Pick<CanvasObjectV1, "x" | "y" | "width" | "height" | "rotation">>) => void;
  onStyleChange?: (patch: { tail_tip?: TailTip; thought_dots?: { x: number; y: number; r: number }[] }) => void;
};

export function ComicTextObjectShape({
  object,
  clipX,
  clipY,
  selected,
  selectable,
  onSelect,
  onChange,
  onStyleChange,
}: ComicTextObjectShapeProps) {
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const payload = object.payload as TextPayloadV1;
  const kind = getTextKind(object);
  const style = getTextStyle(object);
  const fontPreset = resolveFontPreset(payload.font_preset ?? style.font_preset);

  const fill =
    style.background_fill && style.background_fill !== "transparent"
      ? style.background_fill
      : kind === "caption" || kind === "narration"
        ? "rgba(15, 23, 42, 0.85)"
        : "#ffffff";
  const stroke =
    style.outline_color && style.outline_color !== "transparent" ? style.outline_color : "#1e293b";
  const strokeWidth = style.outline_width ?? 2;

  const speechTip: TailTip = style.tail_tip ?? DEFAULT_SPEECH_TAIL_TIP;
  const lowestThought = style.thought_dots?.[style.thought_dots.length - 1];
  const thoughtTip: TailTip = lowestThought
    ? { x: lowestThought.x, y: lowestThought.y }
    : DEFAULT_THOUGHT_DOT_TIP;
  const thoughtDots =
    kind === "thought" ? thoughtDotsLayout(object.width, object.height, thoughtTip) : [];

  useEffect(() => {
    if (!selected || !transformerRef.current || !groupRef.current) return;
    transformerRef.current.nodes([groupRef.current]);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selected, object.width, object.height]);

  function commitGeometry() {
    const node = groupRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const width = Math.max(40, object.width * scaleX);
    const height = Math.max(24, object.height * scaleY);
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      x: node.x() - clipX,
      y: node.y() - clipY,
      width,
      height,
      rotation: node.rotation(),
    });
  }

  const textColor = payload.fill_color ?? style.fill_color;
  const fontStyle =
    `${payload.bold ?? style.bold ? "bold " : ""}${payload.italic ?? style.italic ? "italic" : ""}`.trim() ||
    "normal";
  const isSfx = kind === "sfx";
  const overflow = Boolean(object.metadata?.text_overflow);

  return (
    <>
      <Group
        ref={groupRef}
        x={clipX + object.x}
        y={clipY + object.y}
        rotation={object.rotation}
        draggable={selectable}
        listening={selectable}
        onClick={(event) => {
          if (!selectable) return;
          event.cancelBubble = true;
          onSelect();
        }}
        onTap={(event) => {
          if (!selectable) return;
          event.cancelBubble = true;
          onSelect();
        }}
        onDragEnd={commitGeometry}
        onTransformEnd={commitGeometry}
      >
        {kind === "speech" && (
          <>
            <Path
              data={speechBubbleBodyPath(object.width, object.height)}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={style.opacity}
              perfectDrawEnabled={false}
            />
            <Path
              data={speechBubbleTailPath(object.width, object.height, speechTip)}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={style.opacity}
              perfectDrawEnabled={false}
              listening={false}
            />
          </>
        )}

        {kind === "thought" && (
          <>
            <Path
              data={thoughtCloudBodyPath(object.width, object.height)}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={style.opacity}
              perfectDrawEnabled={false}
            />
            {thoughtDots.map((dot, index) => (
              <Circle
                key={index}
                x={dot.x}
                y={dot.y}
                radius={dot.r}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth * 0.75}
                listening={false}
              />
            ))}
          </>
        )}

        {(kind === "caption" || kind === "narration" || kind === "free") && (
          <Rect
            width={object.width}
            height={object.height}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            cornerRadius={style.corner_radius ?? 4}
            opacity={style.opacity}
            perfectDrawEnabled={false}
          />
        )}

        <Text
          text={payload.content}
          width={object.width}
          height={object.height}
          fontSize={payload.font_size ?? (isSfx ? 32 : fontPreset.fontSize)}
          fontFamily={payload.font_family ?? (isSfx ? "Impact, sans-serif" : fontPreset.fontFamily)}
          fontStyle={fontStyle}
          textDecoration={payload.underline ?? style.underline ? "underline" : ""}
          letterSpacing={payload.letter_spacing ?? style.letter_spacing ?? (isSfx ? 2 : 0)}
          lineHeight={payload.line_height ?? style.line_height ?? 1.2}
          align={payload.align ?? (isSfx ? "center" : "center")}
          verticalAlign="middle"
          padding={isSfx ? 0 : style.padding}
          wrap="word"
          fill={textColor}
          stroke={
            isSfx
              ? style.outline_width > 0
                ? style.outline_color
                : "#0f172a"
              : style.outline_width > 0
                ? style.outline_color
                : undefined
          }
          strokeWidth={isSfx ? (style.outline_width > 0 ? style.outline_width : 1.5) : style.outline_width}
          opacity={style.opacity}
          perfectDrawEnabled={false}
          listening={false}
        />

        {overflow && !isSfx && (
          <Rect
            width={object.width}
            height={object.height}
            stroke="#f59e0b"
            strokeWidth={1.5}
            dash={[4, 3]}
            listening={false}
            perfectDrawEnabled={false}
          />
        )}

        {selected && kind === "speech" && (
          <Circle
            x={speechTip.x * object.width}
            y={speechTip.y * object.height}
            radius={7}
            fill="#6366f1"
            stroke="#ffffff"
            strokeWidth={2}
            draggable
            onDragEnd={(event) => {
              const node = event.target;
              onStyleChange?.({
                tail_tip: { x: node.x() / object.width, y: node.y() / object.height },
              });
            }}
          />
        )}

        {selected && kind === "thought" && thoughtDots.length > 0 && (
          <Circle
            x={thoughtDots[thoughtDots.length - 1].x}
            y={thoughtDots[thoughtDots.length - 1].y}
            radius={8}
            fill="#6366f1"
            stroke="#ffffff"
            strokeWidth={2}
            draggable
            onDragEnd={(event) => {
              const node = event.target;
              const tip = { x: node.x() / object.width, y: node.y() / object.height };
              const layouts = thoughtDotsLayout(object.width, object.height, tip);
              onStyleChange?.({
                thought_dots: layouts.map((dot) => ({
                  x: dot.x / object.width,
                  y: dot.y / object.height,
                  r: dot.r,
                })),
              });
            }}
          />
        )}
      </Group>
      {selected && selectable && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={isSfx}
          keepRatio={false}
          borderStroke="#6366f1"
          borderStrokeWidth={2}
          anchorStroke="#6366f1"
          anchorFill="#ffffff"
          enabledAnchors={
            isSfx
              ? ["top-left", "top-right", "bottom-left", "bottom-right"]
              : ["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right"]
          }
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 40 || newBox.height < 24) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}
