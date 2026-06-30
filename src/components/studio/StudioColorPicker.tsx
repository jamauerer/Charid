"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  hsvToRgb,
  loadRecentColors,
  loadSavedPalette,
  parseColorInput,
  rgbToHex,
  saveRecentColor,
  saveToPalette,
  type Hsv,
} from "@/lib/color/hsv";

type StudioColorPickerProps = {
  label: string;
  value: string;
  opacity?: number;
  onChange: (color: string, opacity?: number) => void;
  showOpacity?: boolean;
  compact?: boolean;
};

function hsvAt(hsv: Hsv, s: number, v: number): Hsv {
  return { h: hsv.h, s, v };
}

export function StudioColorPicker({
  label,
  value,
  opacity = 1,
  onChange,
  showOpacity = false,
  compact = false,
}: StudioColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [palette, setPalette] = useState<string[]>([]);
  const [hsv, setHsv] = useState<Hsv>({ h: 220, s: 80, v: 90 });
  const [hexInput, setHexInput] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const draggingSv = useRef(false);

  const rgb = useMemo(() => hsvToRgb(hsv), [hsv]);
  const hex = useMemo(() => rgbToHex(rgb), [rgb]);

  useEffect(() => {
    const parsed = parseColorInput(value);
    if (parsed) {
      setHsv(parsed.hsv);
      setHexInput(parsed.hex);
    }
  }, [value]);

  useEffect(() => {
    setRecent(loadRecentColors());
    setPalette(loadSavedPalette());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const applyHsv = useCallback(
    (next: Hsv, nextOpacity = opacity) => {
      setHsv(next);
      const nextHex = rgbToHex(hsvToRgb(next));
      setHexInput(nextHex);
      onChange(nextHex, nextOpacity);
    },
    [onChange, opacity]
  );

  function pickSv(clientX: number, clientY: number) {
    const el = svRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const s = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const v = Math.max(0, Math.min(100, (1 - (clientY - rect.top) / rect.height) * 100));
    applyHsv(hsvAt(hsv, s, v));
  }

  useEffect(() => {
    function onMove(event: MouseEvent) {
      if (!draggingSv.current) return;
      pickSv(event.clientX, event.clientY);
    }
    function onUp() {
      draggingSv.current = false;
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [hsv, applyHsv]);

  function commitPick(color: string) {
    saveRecentColor(color);
    setRecent(loadRecentColors());
    const parsed = parseColorInput(color);
    if (parsed) {
      setHsv(parsed.hsv);
      setHexInput(parsed.hex);
    }
    onChange(color, opacity);
  }

  const hueRgb = rgbToHex(hsvToRgb({ h: hsv.h, s: 100, v: 100 }));

  return (
    <div ref={ref} className={`studio-color-picker ${compact ? "studio-color-picker-compact" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="studio-color-picker-trigger"
        title={`${label}: ${value}`}
        aria-expanded={open}
      >
        <span
          className="studio-color-picker-swatch"
          style={{ background: hex, opacity: showOpacity ? opacity : 1 }}
        />
        {!compact && <span className="studio-color-picker-label">{label}</span>}
      </button>
      {open && (
        <div className="studio-color-picker-popover studio-color-picker-pro">
          <p className="studio-color-picker-heading">{label}</p>

          <div
            ref={svRef}
            className="studio-color-sv-square"
            style={{ backgroundColor: hueRgb }}
            onMouseDown={(event) => {
              draggingSv.current = true;
              pickSv(event.clientX, event.clientY);
            }}
          >
            <div className="studio-color-sv-white" />
            <div className="studio-color-sv-black" />
            <div
              className="studio-color-sv-cursor"
              style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
            />
          </div>

          <label className="studio-color-slider-row">
            <span>Hue</span>
            <input
              type="range"
              min={0}
              max={360}
              value={Math.round(hsv.h)}
              onChange={(event) => applyHsv({ ...hsv, h: Number(event.target.value) })}
              className="studio-color-hue-slider"
            />
          </label>

          {showOpacity && (
            <label className="studio-color-slider-row">
              <span>Opacity</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={opacity}
                onChange={(event) => onChange(hex, Number(event.target.value))}
              />
            </label>
          )}

          <div className="studio-color-picker-row">
            <input
              type="text"
              value={hexInput}
              onChange={(event) => {
                setHexInput(event.target.value);
                const parsed = parseColorInput(event.target.value);
                if (parsed) applyHsv(parsed.hsv);
              }}
              className="studio-color-picker-hex production-editor-input flex-1"
              spellCheck={false}
            />
          </div>
          <p className="studio-color-rgb-label">
            RGB {Math.round(rgb.r)}, {Math.round(rgb.g)}, {Math.round(rgb.b)}
          </p>

          <p className="studio-color-picker-subheading">Palette</p>
          <div className="studio-color-picker-grid">
            {palette.map((color) => (
              <button
                key={color}
                type="button"
                className={`studio-color-picker-chip ${color === hex ? "studio-color-picker-chip-active" : ""}`}
                style={{ background: color }}
                onClick={() => commitPick(color)}
                title={color}
              />
            ))}
          </div>

          {recent.length > 0 && (
            <>
              <p className="studio-color-picker-subheading">Recent</p>
              <div className="studio-color-picker-grid">
                {recent.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="studio-color-picker-chip"
                    style={{ background: color }}
                    onClick={() => commitPick(color)}
                    title={color}
                  />
                ))}
              </div>
            </>
          )}

          <button
            type="button"
            className="production-editor-chip mt-2 w-full"
            onClick={() => {
              saveToPalette(hex);
              setPalette(loadSavedPalette());
            }}
          >
            Save to palette
          </button>
        </div>
      )}
    </div>
  );
}
