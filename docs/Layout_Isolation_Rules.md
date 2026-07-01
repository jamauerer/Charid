# Layout Isolation Rules

**Status:** Permanent architecture requirement

Every major application area owns its own layout. Layout systems must not leak into one another.

---

## Application areas

Each area has a **root wrapper class** and **scoped CSS** loaded only from that area’s entry component — never from `globals.css`.

| Area | Root wrapper | Scoped CSS | Entry import |
|------|--------------|------------|--------------|
| Dashboard | `.charid-dashboard-shell` | `src/styles/dashboard-shell.css` | `DashboardShell.tsx` |
| Studio | `.charid-editor-root` | `src/styles/charid-editor-layout.css` | `ComicPageEditorView.tsx` |
| Marketing / homepage | `.charid-marketing-shell` | `src/styles/marketing-shell.css` | `src/app/page.tsx` |
| Authentication | `.charid-auth-shell` | `src/styles/auth-shell.css` | `login/page.tsx`, `signup/page.tsx` |
| Reader | `.charid-reader-shell` | *(future)* | Reader route entry |
| Admin | `.charid-admin-shell` | *(future)* | Admin layout entry |
| Character pages | `.charid-character-shell` | *(future)* | Character route entry |

`globals.css` holds **design tokens only** (colors, typography variables) and cross-cutting utilities that do not reposition application layouts.

---

## Scoping rules

### Studio

Studio layout rules may **only** apply beneath `.charid-editor-root`.

- Use `@scope (.charid-editor-root)` in `charid-editor-layout.css`
- Never import Studio CSS from `globals.css`
- Never use unscoped selectors (`.shell`, `.sidebar`, `.topbar`, universal `*` resets) at the document root

### Dashboard

Dashboard layout rules may **only** apply beneath `.charid-dashboard-shell`.

- Fixed sidebar + content offset live inside the dashboard shell component
- Do not alter shared layout components to fix Studio issues

### Reader

Reader layout rules may **only** apply beneath `.charid-reader-shell` when implemented.

---

## Never

- Import area-specific layout CSS from `globals.css`
- Introduce shared CSS selectors that reposition application layouts (global `* { padding: 0 }`, unscoped `.sidebar`, unscoped `.shell`)
- Modify a shared layout component to solve a Studio-specific problem
- Modify `DashboardShell` for Studio behavior — create a Studio-specific component instead

---

## If a feature needs different behavior

1. Identify which application area owns the screen
2. Add or extend a component **inside that area’s shell**
3. Add scoped CSS under that area’s root wrapper
4. Do **not** change another area’s shell or global CSS

---

## Related docs

- `docs/Studio_Shell_Rules.md` — frozen Studio shell (grid, DOM, class names)
- `docs/CharID_Architecture.md` — product architecture

---

## Regression that motivated these rules

Commit `0dce336` imported `charid-editor-layout.css` into `globals.css`. That file contained an unlayered universal reset (`* { margin: 0; padding: 0 }`) which overrode Tailwind utilities on the dashboard (including `lg:pl-[260px]`), causing the fixed sidebar to overlap main content sitewide.

**Fix pattern:** remove global import; scope Studio CSS with `@scope (.charid-editor-root)`; load from `ComicPageEditorView` only.
