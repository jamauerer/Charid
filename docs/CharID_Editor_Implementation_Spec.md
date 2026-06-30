# CharID Editor Layout — Implementation Spec
### Status: locked as the UI specification for Studio v1

**Companion document:** `CharID_Architecture.md` explains what Studio actually is — the review/adjustment layer over an AI production pipeline (Project → Story → Timeline → Scenes → Pages → Panels → Artwork → Dialogue), with a hidden reusable library (Characters, Assets, Settings, Wardrobe) feeding context to the AI automatically. Read it alongside this spec: that document governs *what the UI is for and where data comes from*; this document governs *pixels, layout, and interaction*. Neither overrides the other — the HTML reference and this spec remain the literal visual target; the architecture doc explains why the AI-suggestion banners, "Scene context" boxes, and Generate actions described below exist and what they're surfacing.

This document is the single source of truth for rebuilding the CharID editor layout. A working reference file (`charid_editor_layout.html`) is included alongside this spec — **open that file in a browser first** to see exactly how it should look and behave before writing any code. Every instruction below describes what that file does.

**From this point forward, stop redesigning.** This combination — the HTML as visual source of truth, this document as the product requirements layered on top — is the spec. Every future Cursor task should be a variation of: *"Match the reference exactly while preserving the existing canvas engine."* Not "make it more like X," not new layout exploration. Implementation only.

Hand both files to Cursor together. Tell Cursor: *"Match the reference HTML file exactly — same DOM structure, same CSS grid, same interaction pattern. Recreate it in our actual framework (React/Vue/whatever we use), but do not deviate from the layout, spacing, or behavior shown in the reference."*

---

## 1. The core mistake to avoid

The previous attempt put the inspector's content directly next to the icon rail, with no canvas in between. **There must always be four distinct horizontal zones**, left to right:

```
┌──────┬──────────────┬─────────────────────────┬──────────────┐
│ ICON │   SIDEBAR     │         CANVAS           │  INSPECTOR   │
│ RAIL │  (changes by   │   (comic page lives      │ (always the  │
│ 48px │   active tool) │    here, centered)       │  same panel) │
│      │    260px       │      flex: 1             │    240px     │
└──────┴──────────────┴─────────────────────────┴──────────────┘
```

The icon rail and the sidebar are **two separate, always-distinct columns**. Clicking an icon never replaces the rail — it only changes what's inside the sidebar next to it. The canvas never disappears. The inspector never moves.

---

## 2. Page-level grid

Use CSS Grid on the outermost container:

```css
.shell {
  display: grid;
  grid-template-rows: 42px 1fr;        /* topbar height, then everything else */
  grid-template-columns: 48px 260px 1fr 240px;  /* rail, sidebar, canvas, inspector */
  height: 100vh;
  width: 100vw;
}
```

- Topbar spans all 4 columns (`grid-column: 1 / -1`).
- Icon rail: `grid-column: 1`
- Sidebar: `grid-column: 2`
- Canvas: `grid-column: 3`
- Inspector: `grid-column: 4`

All four lower zones share `grid-row: 2`.

---

## 3. Zone 1 — Top bar (42px tall)

Three sub-sections, flex row:

**Left (fixed width, matches rail + sidebar width = 308px):**
- Logo icon (22×22px, the ammonite mark, teal `#4a9e8e`)
- Brand name "CharID"
- Separator "/"
- Breadcrumb: project name / page number (e.g. "Surf · Page 1")
- Border-right separates this from the tools section

**Center (flex: 1, the tool controls):**
This section is **context-sensitive** — its contents change based on what's selected on the canvas, not based on which sidebar tool is active. Always-visible: Undo, Redo buttons (icon only, 28px tall buttons).

Then a vertical divider, then one of these groups depending on selection:

- **Nothing selected:** just undo/redo, rest of the space empty
- **Panel selected:** Flip Horizontal, Flip Vertical, divider, Border color swatch, Fill color swatch, divider, Bring Forward, Send Backward, divider, Lock (teal when active), Duplicate, Delete (red)
- **Text/bubble selected:** Font picker dropdown, Size dropdown, divider, Bold/Italic/Underline toggle buttons, divider, Align Left/Center/Right, divider, Text color swatch, divider, Delete (red)

**Right (fixed width, ~180px):**
- "Auto-saved" status text (muted gray)
- Divider
- "Draft ▾" dropdown button
- "Publish" button — solid teal background, dark text, this is the one strong color moment in the top bar

**Explicitly excluded:** No "Animate" menu. No "Effects" panel. No shadow/blur controls. Those are Polotno features CharID doesn't need.

---

## 4. Zone 2 — Icon rail (48px wide)

Vertical stack of icon buttons, each 36×36px, centered horizontally with small gaps. Each button has an SVG icon (18×18px) and a tiny 7.5px label underneath it (e.g. "Panels", "Speech"). This labeled-icon pattern is mandatory — icon-only with no label is not acceptable, it's not user-friendly enough for a tool this dense.

**Exact order, top to bottom:**

1. Panels (grid icon) — *active by default*
2. Speech (speech bubble icon)
3. Thought (cloud icon)
4. Caption (boxed-text icon)
5. SFX (lightning/burst icon)
— divider —
6. Text (T icon)
7. Draw (pencil icon)
8. Upload (up-arrow into tray icon)
— divider —
9. AI Gen (sparkle/star icon)
10. Shapes (circle/square/triangle icon)
— divider —
11. Layers (stacked layers icon)

Active state: background `#2e2e30`, icon color teal `#4a9e8e`. Inactive: gray `#555`, hover background `#2a2a2c`.

Clicking any icon does two things only: (1) marks itself active and un-marks the others, (2) swaps which `.sb-panel` div is visible inside the sidebar. It does **not** affect the canvas or inspector.

---

## 5. Zone 3 — Sidebar (260px wide, scrollable)

This is a single container that holds **multiple panel divs, only one visible at a time** (`display: none` / `display: block` toggle, driven by the icon rail selection). Each panel has the same header pattern: a sticky top label in 10px uppercase tracked text, then padded body content.

### Panels view (default/active on load)
Layout thumbnails grouped under headers: "1 Panel" through "9 Panels" (full range, matching the classic comic-page layout reference sheet — **every standard grid combination shown across both reference sheets up to 9 panels per page**, not just one example per count. For counts that have multiple distinct arrangements — e.g. 3-panel has at minimum a top-wide/bottom-split, an even 3-row stack, and a left-column/right-split version; 4-panel has an even grid, a top-row/bottom-pair, and an asymmetric column version; 6/7/8/9-panel each have at least two distinct grid arrangements — include each as its own thumbnail under that count's header rather than collapsing to one option per count), plus a final **"Dynamic / Angled"** group for non-rectangular layouts: Diagonal split, Zigzag, Shattered, Tilted wide + 2, Inset/overlay, Angled column, Crooked stack (panels at slightly mismatched angles, like a torn-page collage), Cascading diagonal (3+ panels stair-stepping across the page), Wedge split (two panels meeting at a sharp off-center angle), Broken grid (mostly-rectangular grid with one panel punched out at an angle). These use angled `<path>` shapes instead of `<rect>` — panels with sloped or jagged edges for action beats, reveals, and splash-style moments. **Edge-cleanliness rule: every dividing line inside an angled layout must be a single straight cut shared exactly by the two panels on either side of it** — never two independent diagonals that cross or drift apart. Panels may have at most one or two angled edges; all other edges stay vertical or horizontal. This keeps "messy"-looking criss-crossed cuts (the original bug in Tilted wide + 2 and Angled column) from recurring — angled doesn't mean chaotic, it means one or two deliberate clean cuts per layout. A short note under this group clarifies: *"Dynamic layouts break the grid for impact — action beats, reveals, splash moments. Panel edges are draggable after placement, same as standard layouts."*

Two-column grid of thumbnail cards throughout. **Every thumbnail SVG must use the aspect ratio 0.646 (6.625 ÷ 10.25)** — this was the exact bug in the previous ChatGPT attempt, where panel options didn't match the page shape. Build the panel rectangles inside each thumbnail using a `viewBox="0 0 40 62"` so the math is built in correctly. Angled layouts use the same viewBox but `<path>` shapes instead of `<rect>`.

**Naming rule:** layout names must describe what the user gets, not comic-production jargon. The single-panel layout is called **"Full Page"**, not "Splash." Avoid terms like Hero, Splash, or Bleed anywhere in user-facing labels — someone with zero comics background should understand every layout name on sight.

At the bottom of this panel: a fixed info chip reading "Page size — North American comic standard, 6.625 × 10.25 in, 600 DPI, Canvas: 3975 × 6150 px." This is a constant reminder, not a setting — it should always be visible at the bottom of the Panels sidebar.

### Speech view
Real SVG bubble shapes, not icon-glyph placeholders. **Nine pre-built assets**, each drawn as an actual `<svg>` with a `<path>` — drag-and-drop ready: Standard, Rounded, Soft, Whisper (dashed outline), Electronic (stepped/digital edge), Radio (broken dashed outline), Shout, Angry (sharp spiked edge), Jagged. Below the shape grid: a tail-direction picker (8 directions), a **"Draw bubble shape"** button (dashed-border, pencil icon) that drops the user into freehand mode — sketch any outline, it auto-closes into a fillable, styleable shape. This exists because some pages will want hand-lettered or stylized bubbles the preset shapes don't cover.

At the top of this panel, above the shape grid, is an **AI suggestion banner** (teal-tinted box): it surfaces a suggested line of dialogue pulled from the scene's script, who says it, and a rough placement, with "Place bubble" / "Skip" actions. This is the AI's actual job in this workflow — **never generating bubble artwork, only suggesting who-says-what and roughly where.** Once the user places a bubble shape (preset or hand-drawn), the AI can offer to auto-fill the matched text into it, but the user always places the shape.

At the bottom of the Speech panel: a short note box (amber-tinted, distinct from the teal AI-suggestion box) reading: *"AI suggests who speaks, what they say, and roughly where — based on the scene's script. It never generates the bubble artwork itself. You place the shape, AI can drop the matched text in automatically once placed."* Keep this note close to verbatim — it's the product's actual policy on AI's role in lettering, not marketing copy, and it should be visible to the team building the AI suggestion feature so the boundary doesn't get blurred over time.

### Thought view
Same pattern as Speech, with its own **five-shape library**: Standard (oval with trailing bubbles), Cloud (scalloped cloud outline with trailing bubbles), Dream (soft dashed outline, hazy), Dotted, Memory (scalloped flashback-style border). AI suggestion banner at top (for internal-monologue lines detected in the script), the same "Draw bubble shape" button, and the same AI-role note box at the bottom.

### Caption view — separate first-class tool, not a sub-feature of SFX
Captions are conceptually different from sound effects (a narration box vs. a sound word), so they get their own rail icon and sidebar panel rather than living inside SFX. **Nine caption styles**: Narration (plain rectangle box), Location (solid dark tag with pointer, like a place-name marker), Time (pill-shaped), Journal (cream paper texture with ruled lines), Letter (cream paper with an envelope-style folded top edge), Computer (dark terminal-style box with teal monospace-style lines), News (white box with a bold masthead bar reading "NEWS"), Radio (dashed pill, broadcast feel), Chapter (horizontal rule + roman numeral + rule, title-card style).

Caption gets the same AI suggestion banner pattern as Speech/Thought — surfacing narration lines, scene-setting text, or time/location stamps pulled from the script — and the same amber AI-role note at the bottom, reworded for captions: *"AI suggests narration lines, scene-setting text, and time/location stamps from the script. You choose the caption style and confirm placement."*

### Bubble asset rendering rule
Every bubble and caption preset must be a real `<svg viewBox="0 0 64 50">` containing actual closed shapes (`<path>`, `<rect>`, `<ellipse>`), not a text glyph, not an emoji, not a CSS border-radius trick standing in for a shape. The reference file's nine speech shapes, five thought shapes, and nine caption shapes are the literal target — recreate these exact paths (or visually equivalent ones) as components, not placeholders to be designed later. This was the actual gap in the previous build: bubble "options" were rendered as text/emoji characters that don't scale, recolor, or attach tails correctly.

### SFX view
SFX is sound effects only now that Caption has its own tool. 3-column grid of preset sound-effect word styles (BAM, POW, ZAP, BOOM, CRASH, SPLASH, WHOOSH, CLICK) plus a "+ Custom" tile, with text-color and outline-color style controls below.

### Text view
List of text style presets (Heading, Body text, Caption/label) shown as preview cards, then a "Comic fonts" list (Bangers, Comic Neue, Permanent Marker) each rendered in its own actual typeface so the user can see what they're picking.

### Draw view
Mode toggle row (Brush / Fill / Highlight), stroke width slider, opacity slider, then a row of 8 preset color swatches plus a **custom color picker tile** (native OS color wheel/spectrum picker, e.g. an `<input type="color">`, styled as a rainbow-gradient swatch matching the size of the preset swatches) so the user isn't limited to the 8 presets. This same preset-row-plus-custom-picker pattern applies everywhere a color swatch appears in the app — Border color and Fill color in the Inspector's Appearance section, Text color in the topbar's text-selected toolbar, and SFX/caption style colors — not just the Draw panel.

### Upload view
Large dashed drop-zone with upload icon, "Drag an image here, or click to browse" text, and a "Browse files" button. Below it: supported formats note (PNG, JPG, WEBP, SVG, 50MB max) and a small grid of recent uploads.

### AI Gen view
List of full-width action buttons, each with an icon, a label, and a small teal "AI" chip on the right: Generate scene background, Generate character, Fill panel with scene, Suggest panel layout, Generate cover. Below the list: a "Scene context" box showing which character/scene the AI will use as reference (pulled from the project — e.g. "Using character: Jane", "Scene: The Giant Wave"). This connects the AI tools back to CharID's actual character/story system rather than floating disconnected from project data.

### Shapes view
4-column grid of basic shape icons (rectangle, circle, ellipse, triangle, line, star, arrow/zigzag, rounded pill).

### Layers view
A flat list of every object on the current page (panels, bubbles, text, captions) each with a small type icon, name, and reorder buttons (up/down/to-front/to-back) that appear on hover. Note at bottom: "Visibility and lock — coming soon" (this matches a note already in the current product, keep it).

---

## 6. Zone 4 — Canvas (flex: 1, the largest zone)

Dark background (`#252527`) with a subtle dot grid pattern (`radial-gradient` dots, 22px spacing) to give a sense of infinite workspace, matching Figma/Polotno conventions.

The comic page itself: white rectangle, centered, with a drop shadow. **The aspect ratio must be locked to 6.625 : 10.25 at all times**, regardless of zoom level. In CSS:

```css
.comic-page {
  aspect-ratio: 6.625 / 10.25;
  background: #fff;
  /* width is set dynamically based on zoom %, height follows from aspect-ratio */
}
```

A small label sits just above the page reading "Page 1 · 6.625 × 10.25 in (North American comic)".

Panels are absolutely-positioned divs inside the page, each with a `border: 2px solid #888` and a small panel number in the top-left corner (9px, gray). On hover, border turns teal. The **selected** panel gets: a thicker teal border, 8 resize handles (small white squares with teal border, one at each corner and each edge midpoint), and a floating action bar that appears just below the panel containing Duplicate / Arrange / Delete buttons.

**Bottom-center of canvas:** a floating page strip — small page thumbnails (34×52px) in a row, active one has a teal border, plus a "+" button to add a page. This must float over the canvas, not push it.

**Bottom-right of canvas:** a floating zoom control — minus button, percentage readout, plus button, and a "Fit page" text button. Also floats over the canvas.

---

## 7. Zone 5 — Inspector (240px wide, always visible, never changes based on rail selection)

This is the one panel that does **not** change when you click rail icons. It only changes based on what object is selected on the canvas. Top header shows "Inspector" and below it in small teal text, the name of the selected object (e.g. "Panel 4").

Sections, top to bottom, each separated by a hairline border:

1. **Position & size** — 2×2 grid of editable fields: X, Y, W, H (all in px), plus a Rotation field below.
2. **Appearance** — Border color swatch, Border width field, Fill color swatch, Opacity slider with live percentage readout.
3. **Layers — this page** — same flat object list as the Layers sidebar view, but scoped to "what's on this page" and always visible here regardless of which rail icon is active. (Yes, this duplicates the Layers rail view — that's intentional. The rail view is for full management; the inspector view is a quick always-on reference.)
4. **Quick actions** — full-width buttons: Bring forward, Send backward, Bring to front, Send to back, then Delete panel in red, separated visually from the others.
5. **Story context** — read-only info pulled from the project: Project name, Story name, Scene name (in teal, as the active/relevant one), and which characters appear in this scene. This is what makes CharID's editor different from a generic design tool — every page knows what story it belongs to.

---

## 8. Color tokens (use these exact values)

```css
--bg-base: #111113;        /* outermost background */
--bg-surface: #1a1a1c;     /* sidebar, inspector background */
--bg-panel: #1e1e20;       /* topbar, rail background */
--bg-hover: #2a2a2c;
--bg-active: #2e2e30;
--border: #2e2e30;
--border-subtle: #222224;
--text-primary: #e8e4dc;
--text-secondary: #888884;
--text-muted: #555552;
--teal: #4a9e8e;            /* the one accent color — active states, AI features, publish button */
--teal-dim: rgba(74,158,142,0.15);
--teal-border: rgba(74,158,142,0.3);
--red: #c05050;             /* destructive actions only */
```

Teal is the **only** accent color. Don't introduce blue, purple, or other accent colors anywhere in this interface — that consistency is what makes the active/selected states readable at a glance.

---

## 9. Sizing reference (so density matches Polotno)

- Icon rail buttons: 36×36px
- Icon rail icons inside buttons: 18×18px
- Top bar height: 42px
- Top bar buttons: 28px tall
- Sidebar width: 260px
- Inspector width: 240px
- Base font size: 12px (this whole interface runs smaller than marketing UI — it's a dense production tool)
- Section labels: 9–10px, uppercase, letter-spacing 1–1.5px, muted gray

---

## 10. The AI/human division of labor (read this before building bubbles)

This is the production model for a full page:

1. **AI generates the scene artwork** inside each panel (or, less commonly, the user uploads their own art). This is the background/character art — landscapes, characters, action.
2. **AI does not generate bubble shapes or render final lettering art.** Models are reliably bad at this — text inside generated images is unreliable and bubbles need to align precisely with panel composition, which is a layout problem, not a rendering problem.
3. Instead, **AI reads the scene's script and suggests**: who is speaking, what the line is, roughly where it should sit in the panel. This shows up as the teal "AI suggestion" banner at the top of the Speech and Thought sidebar panels.
4. **The user places the actual bubble** — either by dragging one of the preset SVG shapes onto the canvas, or by freehand-drawing a custom outline with the "Draw bubble shape" tool.
5. Once a shape is placed, **AI can auto-fill the suggested text into it** — but the shape, position, and final approval are always the user's.

Build the Speech and Thought sidebar panels around this exact sequence. The AI suggestion banner is not optional flavor — it's the actual entry point of the workflow. The preset shape grid and the draw tool are equally weighted alternatives for placing the shape afterward.

---

## 11. Layer architecture — fixed tier model

This is a data-model rule, not just a UI convention, and it should be enforced at the engine level, not just visually suggested. This is also the direct answer to "should panels, art, and bubbles be on separate layers" — yes, always, with this exact order:

1. **Tier 1 — Panel frame.** The panel shape itself (rectangle or angled path from the layout picker). This is the base of the stack and effectively locked — it doesn't reorder relative to its own contents, since everything else lives inside it.
2. **Tier 2 — Artwork.** The AI-generated scene art, or user-uploaded image, that fills the panel. **Must be resizable and cropable** — independently of the panel frame, the user can zoom, pan, and crop the art inside the fixed panel boundary without changing the panel shape itself. This is a hard requirement on the engine, not optional polish: art that can't be repositioned after a layout change is a broken panel.
3. **Tier 3 — Bubbles & SFX.** Speech bubbles, thought bubbles, captions, and sound-effect text. Always renders above the artwork, and **stays fully editable** after placement — shape, size, fill, tail direction, and text all remain adjustable, never baked into a flattened image. Objects within this tier can be freely reordered relative to each other (a caption can sit above or below a speech bubble), but nothing in this tier can be pushed below Tier 2, and artwork can never be pushed above Tier 3.

**The ordering across tiers is fixed. Only ordering within Tier 3 is adjustable.** A speech bubble can never end up behind the artwork; the artwork can never end up in front of a speech bubble. This needs to be enforced at the data layer (e.g. a `tier` field on every canvas object, with reorder operations constrained to same-tier moves) so it can't be accidentally violated by a future drag-and-drop reorder feature.

**In the UI:** the Layers sidebar panel groups objects under three visible tier headers ("Tier 1 — Panel frame", "Tier 2 — Artwork", "Tier 3 — Bubbles & SFX"), with a note at the top reinforcing the fixed-order rule. Tier 1 and Tier 2 items show as visually de-emphasized (lower opacity, no reorder buttons) since they're effectively locked in place relative to each other — only Tier 2's crop/resize handles are interactive, not its stacking position. The inspector's "Layers" section, when a Tier 3 object is selected, shows that panel's own three-tier mini-stack (not other panels' objects) with the same Tier 1/Tier 2 items shown locked and only Tier 3 items reorderable.

**Text-in-bubble clipping rule:** once text is placed inside a speech, thought, or caption shape, it is clipped to that shape's bounds — **text must fit inside the bubble and never flow or spill outside it, at any resize.** Resizing the bubble reflows and re-fits the text inside the new bounds. This needs real implementation support (text auto-fit / shrink-to-fit logic tied to the bubble's resize handlers), not just a CSS `overflow: hidden`, since the text should ideally resize to stay legible rather than just getting clipped off. Free-floating text placed directly on the canvas (not inside a bubble shape) behaves like ordinary text and can overflow its bounding box normally — the clipping rule is specific to text-in-bubble.

---

## 12. What to literally tell Cursor

> "Here is a working HTML/CSS/JS reference file showing the exact layout, spacing, color values, and click interactions we want for the CharID editor. Rebuild this in our actual stack, preserving the DOM structure (4-column grid: icon rail → sidebar → canvas → inspector), the exact pixel measurements, the color tokens, and the interaction pattern where clicking an icon rail button swaps sidebar content without affecting the canvas or inspector. Do not introduce your own layout decisions — treat the reference file as the literal target, just reimplemented in our component architecture and wired to our real data instead of the static placeholder content."

Attach `charid_editor_layout.html` directly to that message.
