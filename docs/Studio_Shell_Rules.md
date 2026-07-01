# Studio Shell Rules (Frozen)

**Status:** Production Baseline

The CharID Studio shell is complete and considered frozen.

This document is the permanent source of truth for Studio architecture.

## Before making any Studio changes

Always read:

- `docs/CharID_Architecture.md`
- `docs/CharID_Editor_Implementation_Spec.md`
- `docs/charid_editor_layout.html`

These documents override assumptions.

---

## DO NOT CHANGE

The following are frozen unless explicitly requested by the project owner:

- Four-column shell
- Top toolbar
- Icon rail
- Left sidebar
- Center canvas
- Right Properties panel
- Bottom page timeline
- Zoom controls
- Page strip
- CSS variables
- DOM hierarchy
- Shell class names
- Grid architecture

Do not redesign or replace these systems.

### Frozen components

- `CharIDEditorShell`
- `EditorIconRail`
- `StudioLeftSidebar` (sidebar panels)
- `StudioInspector` (Properties panel)
- Canvas area chrome (`canvas-area`, dots, page strip, zoom bar)
- `ComicPageEditorToolbar` (top toolbar layout)
- `src/styles/charid-editor-layout.css` shell sizing and grid

### Grid (permanent)

| Column | Width |
|--------|-------|
| Icon rail | 48–56px (`--rail-width`) |
| Left sidebar | 260px (`--sidebar-width`) |
| Canvas | flex |
| Inspector | 260px (`--inspector-width`) |

---

## Allowed Changes

Implement functionality **inside** the existing shell.

Examples:

- Bubble library
- Caption library
- SFX library
- Draw tools
- Upload library
- AI Generate
- Context-sensitive Properties panel
- Crop tool
- Image editing
- Layers
- Keyboard shortcuts
- Tablet responsiveness (without changing desktop shell)

Bug fixes and responsive improvements that do not alter DOM hierarchy, class names, or grid architecture.

---

## Never

Never:

- Redesign the shell
- Merge sidebar and inspector
- Move canvas
- Rename CSS architecture
- Replace measurement system
- Replace shell grid
- Invent a new layout

---

## Design Philosophy

The Studio should be immediately understandable.

Users should feel like they are creating books.

The complexity belongs inside the AI pipeline, not inside the interface.

The interface should remain familiar to users of Canva, Figma, Polotno, Photoshop, and Clip Studio while remaining simpler than all of them.

---

## CharID Philosophy

CharID is **NOT** a design editor.

It is an **AI Production Studio**.

The editor is the final production stage.

Everything generated inside Studio comes from structured project data.

The AI automatically gathers context from:

Story → Story Timeline → Scene → Characters → Settings → Assets → Wardrobe → Previous approved artwork → Style guide

The user should never have to manually assemble this context.

---

## Workflow (Frozen)

```
Project
  ↓
Story
  ↓
Story Timeline
  ↓
Scenes
  ↓
Pages
  ↓
CharID Studio
  ↓
Publish
```

Do not redesign this workflow.

---

## Objective

Every milestone after Studio Shell Freeze should **extend functionality** rather than **redesign architecture**.

---

## Regression Rule

When implementing new Studio features:

- Preserve all existing functionality.
- Do not replace working components.
- Do not rebuild working layouts.
- If a change requires modifying the shell, **stop and explain why** before proceeding.

Prefer extending existing components over replacing them.
