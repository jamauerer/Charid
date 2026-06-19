# Project Workspace V1

**Status:** Design proposal — **no implementation**  
**Date:** 2026-06-14  
**Authority:** [PROJECT_FIRST_CREATIVE_STUDIO_V1.md](./PROJECT_FIRST_CREATIVE_STUDIO_V1.md) (locked product direction)  
**Related:** [PROJECT_UX_PROPOSAL.md](./PROJECT_UX_PROPOSAL.md) · [PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md](./PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md) · [CREATOR_FLOW_CONSOLIDATION.md](./CREATOR_FLOW_CONSOLIDATION.md) · [STORY_WORKSPACE_V3.md](./STORY_WORKSPACE_V3.md)

---

## Executive summary

Creators think in **projects**, not database tables. The current project page is a **tabbed entity browser** (Overview · Stories · Characters · Worlds · Relationships) that mirrors storage, hides cross-story structure, and sends people to disconnected workspaces before they understand the whole work.

**Project Workspace V1** replaces that pattern with a **single-screen creative command center**: a calm overview at the top, a format-aware **What’s next**, and an **expandable roadmap** of everything in the project — without new architecture, URL migrations, or auto-commit AI.

**Recommendation:** **Option C — Hybrid Workspace** (overview + expandable roadmap + optional structure view).

---

## Problem (today)

### Entity-centric navigation

Sidebar and project tabs reflect storage:

```
Home · Projects · Stories · Characters · Worlds
```

Project workspace tabs reflect the same:

```
Overview · Stories · Characters · Worlds · Relationships
```

### What the creator sees

Opening **California Coast Surf Stories** today:

1. Cover hero + four stat cards (Stories, Characters, Worlds, Relationships)
2. Must click a tab to see contents
3. No scene count, no location rollup, no sense of story progress
4. No project-level “what should I do next?”
5. Footnote: *“Stories, characters, and worlds open in their dedicated workspaces”* — admission that the project is a **router**, not a workspace

### What the creator needs

```
California Coast Surf Stories          Novel

Characters (3)   Stories (1)   Scenes (4)   Locations (2)

Suggested next step:
Create an ending scene in How I Surf
```

One screen. Roadmap feel. Not a dashboard of counts.

---

## Core principle

> **Everything belongs to a Project.**  
> **Project type (`work_intent`) determines workspace structure** — which sections appear, what they’re called, and what “complete” means.

Projects are **finished-work containers**. Worlds remain settings (aggregated under **Setting**). Stories remain narrative units. Scenes remain story beats (aggregated for overview). The database does not change; **presentation and aggregation** do.

---

## Layout options evaluated

### Option A — Family tree

Visual hierarchy: Project at root, branches to entities and nested story → scene nodes.

| Pros | Cons |
|------|------|
| Shows relationships clearly | Overwhelming for 20+ characters, many scenes |
| Good for worldbuilding / IP bible | Poor default on mobile |
| Matches “creative universe” mental model | Feels like a diagram tool, not a workspace |

**Verdict:** Useful as a **secondary view**, not the default landing experience.

---

### Option B — Expandable roadmap

Single scroll page. Collapsible sections (Characters, Stories, Setting, Assets…).

| Pros | Cons |
|------|------|
| Scales to large projects | Weak relationship mapping |
| Mobile-friendly accordions | Easy to feel like a long settings page |
| Matches Story Workspace V4 section pattern | Needs strong “What’s next” to avoid list fatigue |

**Verdict:** Strong **spine** for V1; insufficient alone without overview + guidance layer.

---

### Option C — Hybrid workspace (recommended)

Three layers on one route:

```
┌─────────────────────────────────────────────┐
│ 1. Project overview (header + progress)   │
├─────────────────────────────────────────────┤
│ 2. What’s next (command center)           │
├─────────────────────────────────────────────┤
│ 3. Expandable roadmap (sections)          │
│    … optional “Structure” drawer → tree  │
└─────────────────────────────────────────────┘
```

| Pros | Cons |
|------|------|
| Answers all five requirement questions above the fold | More UI design work than B alone |
| Overview for glance; roadmap for depth | Tree view is Phase PW-2 |
| Reuses patterns from Story Finish Path + Creator Flow | Must avoid duplicating story workspace |

**Verdict:** **Recommended for V1.**

---

## Recommended layout (V1)

### Route

Keep **`/dashboard/projects/[projectId]`** — no URL migration.  
Deprecate `?tab=` gradually; default becomes **single scroll page** with hash anchors (`#project-stories`, `#project-cast`).

### Page structure (top → bottom)

#### 1. Project header (context)

- **Title** + work type label (`Novel`, `Comic`, … from `work_intent`)
- Optional cover strip (compact — not hero-dominated; calm, not marketing banner)
- **Setting line** if primary world exists: *Setting: California Coast* (link to world workspace)
- Edit project / description (secondary)

#### 2. What’s next (command center)

Primary panel — same visual language as Story **What’s next**, project-scoped.

Examples by state:

| State | Primary action |
|-------|----------------|
| Empty project | Start with a character or story (from `start_path` / wizard) |
| Story, no scenes | Add first scene in *[Story title]* |
| Scenes, no chapters (novel) | Add first chapter or keep adding scenes |
| Strong progress | Continue *[Story]* · Add scene · Review cast |

One button. One or two soft hints max. Never a task list of ten items.

#### 3. Progress snapshot (checklist)

Compact row — format-aware, mirrors story finish path logic at project rollup:

```
✓ 3 Characters   ✓ 4 Scenes   ○ 1 Chapter   ○ Cover
```

Checklist items come from **`resolveProjectFinishPath()`** (new helper, analogous to `resolveStoryFinishPath`) using aggregated counts + `work_intent`.

#### 4. Expandable roadmap (main body)

Single column. Sections in **format-defined order** (see below). Each section:

```
▼ Characters (3)                    [+ Add character]
  [avatar row / compact cards — max 6, then "View all"]
  [links open character workspace]

▼ Stories (1)                       [+ Add story]
  [story row: title, status, scene/chapter counts, link to story workspace]

▼ Scenes (4)                        [View in story →]
  [aggregated list grouped by story OR top 5 recent scenes]

▶ Setting                           [2 worlds · 4 locations]
  collapsed preview: world names, location count

▶ Connections (2)                   [relationships — optional section]

▶ Assets (8)                        [future: images, moodboards rollup]

▶ Notes
  project description + future freeform notes
```

**Default expansion:**

- **Expand** sections with content or that match “what’s next” target
- **Collapse** empty or secondary sections (Assets, Connections) until relevant

#### 5. Structure view (optional, V1.1 or late V1)

Link: **View project structure** → slide-over or modal with **read-only tree**:

```
California Coast Surf Stories
├─ How I Surf (story)
│   ├─ Scene: Dawn patrol
│   └─ Scene: First wipeout
├─ Kai (character)
└─ Malibu (world)
    └─ Surfrider Beach (location)
```

Not the default. Unblocks relationship understanding without cluttering the main page.

---

## Mobile considerations

| Concern | Approach |
|---------|----------|
| Vertical space | Sticky **What’s next** bar after scroll (compact); full panel at top on first load |
| Section density | Accordion sections; one open at a time on small screens (optional `accordion="single"`) |
| Touch targets | Section headers are full-width tappable; + actions in header row |
| Lists | Max 3–4 items inline; “View all N” → existing tab content or filtered list page |
| Tree view | Bottom sheet, not sidebar |
| Navigation | Breadcrumb back to All projects; no horizontal tab bar |

**Breakpoint:** `< md` collapse all except Cast + Stories + What’s next if project has a primary story.

---

## Scalability considerations

| Scale | Behavior |
|-------|----------|
| **0–5 entities per section** | Show inline content; expand all populated sections |
| **6–20** | Inline preview + “View all”; lazy-fetch section bodies on first expand |
| **20+** | Section shows count + search/filter on expand; virtualized list inside section |
| **Many stories** | Stories section sorted by `updated_at`; scene rollup groups by story |
| **Performance** | Initial page load: header + What’s next + counts only; fetch section bodies on expand (same pattern as project page today per-tab fetching, inverted) |

**Anti-patterns to avoid:**

- Loading every character photo on first paint
- Infinite scroll on the project page itself
- Tree view as default for large IP projects

---

## How project types affect the workspace

Uses existing **`ProjectWorkIntent`** (`comic`, `novel`, `picture_book`, `screenplay`, `worldbuilding`, `exploring`).  
Section visibility, order, labels, and checklist weights come from a **workspace template** — not new schema.

### Template matrix

| Section | Novel | Screenplay | Comic | Picture book | Worldbuilding | Exploring |
|---------|:-----:|:----------:|:-----:|:------------:|:-------------:|:---------:|
| Characters | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Stories | ✓ | ○ optional | ✓ as **Story** | ✓ as **Story** | ○ | ○ |
| Chapters | ✓ | ○ | ○ | ○ | — | ○ |
| Scenes | ✓ | ✓ primary | ✓ | ✓ | ○ | ✓ |
| Pages | — | — | ✓ future | ✓ primary | — | — |
| Setting / Locations | ✓ | ✓ | ○ | ○ | ✓ primary | ○ |
| Maps | ○ | ○ | ○ | ○ | ✓ | ○ |
| Culture / Lore | ○ | ○ | ○ | ○ | ✓ | ○ |
| Timeline | ○ | ○ | ○ | ○ | ✓ | ○ |
| Illustrations | — | — | ○ | ✓ future | — | — |
| Assets | ○ | ○ | ✓ | ✓ | ○ | ○ |
| Connections | ✓ | ✓ | ✓ | ✓ | ✓ | ○ |
| Notes | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

✓ = shown by default · ○ = shown when content exists or collapsed secondary · — = hidden until feature exists

### Creator-facing labels (examples)

| `work_intent` | Roadmap order (expanded defaults) |
|-------------|----------------------------------|
| **Novel** | Characters → Stories → Scenes → Chapters → Setting → Notes |
| **Screenplay** | Characters → Scenes → Locations → Stories → Notes |
| **Comic** | Characters → Story → Scenes → Assets → Pages* → Notes |
| **Picture book** | Characters → Story → Pages* → Scenes → Illustrations* → Assets |
| **Worldbuilding** | Characters → Locations → Maps → Timeline* → Lore* → Notes |
| **Exploring** | Characters → Scenes → Stories → Setting → Notes (permissive, minimal checklist) |

\*Pages, Timeline, Culture, Illustrations = **placeholder slots** in V1 UI (label + empty state + link to nearest live surface). No new tables in V1.

### Format guidance (compact)

Beneath title — same pattern as **`StoryFormatGuide`**: one dismissible line per type.

> *Novel:* Scenes are beats; chapters hold prose. Start with characters and scenes.

---

## Five requirements — how the layout answers them

| Question | Where answered |
|----------|----------------|
| **1. What exists?** | Progress snapshot counts + expanded roadmap sections |
| **2. What is missing?** | Checklist ○ items + empty section hints |
| **3. What should I work on next?** | **What’s next** primary action |
| **4. How complete is this project?** | Checklist + optional % (derived, not gamified) |
| **5. Where are stories, characters, assets, settings?** | Roadmap sections with deep links to existing workspaces |

---

## AI collaboration (future-facing, not V1 scope)

When added, AI surfaces **only** in the command center and inside expanded sections — never as a parallel nav item.

| Capability | Placement | Rule |
|------------|-----------|------|
| Suggest next step | What’s next hints | Same as story finish path |
| Suggest missing pieces | Checklist or section empty state | Staged suggestions |
| Suggest story/scene ideas | Inside Scenes section | Reuse scene suggestion batch; one active batch per story |
| Suggest organization | Structure view / Notes | Review → approve |

**Hard rule:** Suggest · Review · Approve. No auto-commit. No second AI entry point on project page that bypasses story staging.

---

## Migration path from current project page

### Current (`v0.8`)

```
/dashboard/projects/[id]
  ?tab=overview|stories|characters|worlds|relationships

ProjectWorkspaceView
  → tab bar
  → ProjectOverviewSection (stats only on overview)
  → per-tab list sections
```

Data already available via `getProjectStories`, `getProjectCharacters`, `getProjectWorlds`, `getProjectRelationships`, `ProjectWithCounts`.

### Phased migration (no big-bang)

| Phase | Scope | Shipped outcome |
|-------|--------|-----------------|
| **PW1 — Roadmap shell** | Replace tab bar with single scroll + accordions; move tab content into sections | Same data, new layout; `?tab=` still scrolls to section |
| **PW2 — Command center** | `resolveProjectFinishPath`, What’s next panel, checklist | Project-level guidance live |
| **PW3 — Rollups** | Scene count, location count (aggregate from stories/worlds), link to story `#story-scenes` | Matches founder test example |
| **PW4 — Format templates** | Section order/visibility from `work_intent`; format guide | Types feel different |
| **PW5 — Structure view** | Read-only tree drawer | Option A without default clutter |
| **PW6 — Nav polish** | Sidebar: Projects primary; Stories/Characters/Worlds → “All …” secondary | IA matches mental model |

### Component mapping

| Today | V1 |
|-------|-----|
| `ProjectOverviewSection` stat cards | Progress snapshot + section headers (counts on headers) |
| `ProjectStoriesSection` | Roadmap ▼ Stories |
| `ProjectCharactersSection` | Roadmap ▼ Characters |
| `ProjectWorldsSection` | Roadmap ▶ Setting (worlds + location counts) |
| `ProjectRelationshipsSection` | Roadmap ▶ Connections |
| Tab nav in `ProjectWorkspaceView` | Remove; hash/accordion navigation |
| — | `ProjectWhatsNext` (new) |
| — | `ProjectFormatGuide` (new, client dismiss) |
| — | `ProjectRoadmapSection` (new, reusable accordion) |
| — | `resolveProjectFinishPath` in `src/lib/project-finish-path.ts` |

### URLs and deep links

| Link | Target |
|------|--------|
| Story row | `/dashboard/worlds/[worldId]/stories/[storyId]` (unchanged) |
| Scene preview | Story workspace `#story-scenes` or scene detail |
| Character | `/dashboard/characters/[id]` |
| World / location | `/dashboard/worlds/[id]` |
| Section “View all” | Same page `#section` expanded or `?section=stories` |

No change to world-nested story URLs in V1 (per [CREATOR_FLOW_CONSOLIDATION.md](./CREATOR_FLOW_CONSOLIDATION.md) constraints).

### Empty project (first open)

Reuse **`StartNewProjectWizard`** outcome: respect `start_path` — if they started with character, expand Characters first and What’s next → add story or scene.

---

## Wireframe (ASCII)

```
┌──────────────────────────────────────────────────────────┐
│ ← All projects                                        │
│ California Coast Surf Stories            Novel         │
│ Setting: California Coast (world link)                 │
│ [ dismissible format hint ]                           │
├──────────────────────────────────────────────────────────┤
│ WHAT'S NEXT                                          │
│ Create an ending scene in How I Surf        [ Go → ]   │
│ ✓ 3 Characters  ✓ 4 Scenes  ○ 1 Chapter  ○ Cover   │
├──────────────────────────────────────────────────────────┤
│ ▼ Characters (3)                         [ + Add ]   │
│   (avatar) Kai  (avatar) Mom  (avatar) Leilani …     │
├──────────────────────────────────────────────────────┤
│ ▼ Stories (1)                            [ + Add ]   │
│   How I Surf · In Progress · 4 scenes      [ Open ]  │
├──────────────────────────────────────────────────────┤
│ ▼ Scenes (4)                           [ In story ]  │
│   Dawn patrol · First wipeout · …                    │
├──────────────────────────────────────────────────────┤
│ ▶ Setting · 1 world · 2 locations                  │
│ ▶ Connections (1)                                   │
│ ▶ Assets (8)                                      │
│ ▶ Notes                                             │
│                                    View structure → │
└──────────────────────────────────────────────────────┘
```

---

## Out of scope (V1)

- New database tables
- Project-scoped URLs for stories/scenes
- Pages / Timeline / Culture entities (UI placeholders only)
- AI generation on project page (beyond linking to existing story suggestion flow)
- Replacing world or story workspaces
- Marketplace, discovery, publishing

---

## Success criteria

Founder opens **California Coast Surf Stories** and within **5 seconds** can state:

1. What project this is and what type it is  
2. What exists (characters, stories, scenes, locations)  
3. What to do next (concrete action)  
4. Where to click to continue the story  

If the page still feels like a **database admin screen**, stop and simplify before adding features.

---

## Recommendation summary

| Decision | Choice |
|----------|--------|
| **Layout** | **Option C — Hybrid** (overview + What’s next + expandable roadmap + optional tree) |
| **Route** | Keep `/dashboard/projects/[projectId]` |
| **Type behavior** | `work_intent` workspace templates |
| **First implementation phase** | PW1 roadmap shell + PW2 command center |
| **Reuse** | Story finish path patterns, CreatorContextTrail, StoryFormatGuide, studio accordions |

**Next step when approved:** Implementation plan for PW1–PW2 only (layout + finish path), no new architecture.
