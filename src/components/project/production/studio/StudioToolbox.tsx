"use client";

import {
  STUDIO_TOOLBOX_GROUPS,
  type StudioToolboxTool,
} from "@/lib/studio/studio-toolbox";

type StudioToolboxProps = {
  activeTool: StudioToolboxTool;
  onToolChange: (tool: StudioToolboxTool) => void;
  disabled?: boolean;
};

export function StudioToolbox({
  activeTool,
  onToolChange,
  disabled = false,
}: StudioToolboxProps) {
  return (
    <>
      {STUDIO_TOOLBOX_GROUPS.map((group, groupIndex) => (
        <div key={group.id} className="charid-editor-rail-group">
          {groupIndex > 0 && <div className="charid-editor-rail-sep" aria-hidden />}
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = activeTool === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => onToolChange(item.id)}
                className={`charid-editor-rail-btn ${active ? "charid-editor-rail-btn-active" : ""}`}
                title={item.label}
              >
                <Icon className="charid-editor-rail-icon" size={18} strokeWidth={1.4} aria-hidden />
                <span className="charid-editor-rail-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </>
  );
}
