# Homepage V2 — Creative Studio

**Status:** Design proposal only — **no implementation**  
**Date:** 2026-06-14  
**Goal:** The homepage should feel like *“A place where stories begin.”* — not *“A dashboard.”*  
**Authority:** [VISUAL_IDENTITY_V1.md](./VISUAL_IDENTITY_V1.md) · [CHARID_NORTH_STAR_V1.md](./CHARID_NORTH_STAR_V1.md) · [VISUAL_IDENTITY_PHASE_1.md](./VISUAL_IDENTITY_PHASE_1.md)

---

## Purpose

This document proposes **Homepage V2** for the logged-in creator landing experience (`/dashboard`). It reviews what exists today, identifies gaps against Visual Identity V1, and answers six design questions.

**Out of scope:** Code, migrations, component specs, marketing site rebuild, sidebar IA overhaul, AI features.

---

## Current state review

### Logged-in home (`/dashboard`)

Phase 1 ([VISUAL_IDENTITY_PHASE_1.md](./VISUAL_IDENTITY_PHASE_1.md)) moved the dashboard home toward the studio vision:

| Element | Today | Studio-aligned? |
|---------|-------|-----------------|
| Hero copy | “A place where stories begin” | Yes |
| Hero band | Warm sunset wash (`studioHeroWash`) | Yes |
| Primary CTA | `Create` modal | Partial — still modal/form-first |
| Recent work | Up to 6 square thumbs (story/world/character mix) | Partial — small, equal weight |
| Below fold | “Explore your studio” — 3 cards with **entity counts** | No — reads as inventory dashboard |
| Secondary | Portfolio + Explore cards | Partial — utility, not inspiration |
| Navigation frame | Persistent sidebar: Home, Projects, Stories, Characters, Worlds… | No — admin shell dominates first impression |

**Verdict:** Copy and tokens improved; **information architecture still feels like a dashboard.** The hero promises a studio; the page below it lists counts and categories.

### Projects page (`/dashboard/projects`)

| Element | Today | Studio-aligned? |
|---------|-------|-----------------|
| Header | “Projects” + numeric badge | No — admin list pattern |
| Layout | Responsive grid of 16:9 `ProjectCard`s | Partial — covers exist but compete with chrome |
| Empty state | Dashed border, explanatory text, button | No — form invitation, not visual aspiration |
| Create | “Start New Project” → wizard modal | Partial — good intent, modal/form delivery |
| Relationship to home | Separate nav destination; not the home hero | No — splits “where work lives” from “where I land” |

**Verdict:** Projects are the right **organizing unit** for finished work, but the page is a **management view**, not a creative entry point.

### Create flow

Two parallel paths today:

1. **`CreateModal`** — “Start New Project” (wizard) OR “Quick add” (Character / World / Story forms)
2. **`StartNewProjectWizard`** — Work intent → title/setup → optional follow-up (character, world, story, artwork)

| Strength | Gap |
|----------|-----|
| Project-first option exists | Two entry paths (“project” vs “quick add”) splits mental model |
| Wizard supports story/character/world/artwork start paths | Delivery is **modal + form**; art upload is deferred to follow-up steps |
| Story creation routes to workspace with `?welcome=1` | Home CTA does not preview *what* will appear after create |
| Sidebar duplicates Create | Creation feels like a **utility action**, not the room’s reason for being |

**Verdict:** Flow logic is sound; **presentation** still says “submit entity” before “see your art.”

### Visual Identity V1 (target)

Approved emotional direction:

- **Creative optimism** — warm, calm, imaginative
- **Art is the hero** — portraits, covers, thumbnails lead the viewport
- **Images before forms** — see work first, configure later
- **Sunset / golden hour** — warm accent glow, not cold SaaS chrome
- **Tagline test:** *“A place where stories begin”* — not *“An AI control panel”*

Phase 1 implemented tokens and a first pass on home/workspaces. Homepage V2 completes the **layout and hierarchy** shift Phase 1 started.

### Public marketing home (`/`)

Still **violet-forward, feature-card, “What is CharID?”** explainer. Not aligned with sunset studio identity. V2 proposal focuses on **logged-in home**; marketing alignment is noted as a follow-on, not in scope here.

---

## Design thesis

**Homepage V2 = one room, not a control panel.**

The creator opens CharID and should feel they have **stepped into their studio** — walls of their work, warm light, one clear invitation to begin or continue. Administration (counts, tabs, entity types) moves **behind** the art, not beside it.

```
Today                          V2 target
─────────────────────────────────────────────────────
[ Hero text + Create btn ]     [ LARGE art — continue or aspire ]
[ 6 small thumbs ]             [ Project covers — primary grid ]
[ Stories (3) Characters (2) ] [ Optional: “Open studio” — collapsed ]
[ Portfolio | Explore ]        [ Single calm footer strip ]
Sidebar: 8 nav items             Sidebar: quieter; home IS the map
```

---

## Answers

### 1. What should a first-time creator see?

**One warm room with possibility — not an empty dashboard.**

| Region | Content | Rationale |
|--------|---------|-----------|
| **Viewport hero (~60%)** | Full-width **aspirational art band** — soft sunset gradient + 2–3 silhouette placeholders (character portrait, world panorama, story beat) with gentle copy: *“Your characters, worlds, and stories will live here.”* | Empty states should show **what could appear**, not a dashed form box (V1 principle: art before forms) |
| **Primary CTA** | Single button: **“Begin your first project”** (amber gradient) | One path; no “Quick add” fork on first visit |
| **Supporting copy** | One line under CTA: *“A comic, a picture book, a world — start with whatever you have.”* | Matches north star creator spectrum (child → pro) |
| **No entity counts** | Hide Stories/Characters/Worlds count cards entirely until the creator has work | Counts signal “inventory admin,” not “stories begin here” |
| **No sidebar emphasis** | Sidebar may remain for wayfinding but home content must **stand alone** without requiring nav literacy | Child/hobbyist should not need to understand entity graph on day one |

**First session outcome:** Tap one button → project wizard (intent + title) → land in project or first workspace with **immediate upload prompt** (cover, portrait, or mood image) — not a blank metadata form.

---

### 2. What should a returning creator see?

**Continue the story — art first, admin never.**

| Region | Content | Rationale |
|--------|---------|-----------|
| **Hero** | **Largest single image** from most recently touched project or piece (cover or story/world/character art), edge-to-edge within content width, with overlay: project title + **“Continue”** | Returning users want **momentum**, not a menu |
| **Secondary row** | Horizontal scroll (or 2-row mosaic) of **project covers** — 16:9, large — sorted by `updated_at` | Projects are the “shelves” of the studio |
| **Tertiary strip** | Compact “Recent moments” — 4–6 mixed entity thumbs (current `HomeRecentWork` behavior), smaller than project row | Keeps cross-entity discovery without competing with projects |
| **Greeting** | Soft, non-dashboard: *“Welcome back”* or *“Pick up where you left off”* — **no** “CharID Studio” eyebrow + paragraph + button competing with the hero image | Text supports the image; image is the headline |
| **Create** | Secondary action: **“Start something new”** — ghost/secondary button, not equal weight to Continue | Inspiration before administration |

**Returning user with one active project:** Hero *is* that project; grid collapses to “Your other projects” if any.

**Returning user with many projects:** Hero = last active; grid shows all projects; recent moments below.

---

### 3. How should artwork become the hero?

**Art occupies the largest pixels; UI frames it like a gallery, not a file manager.**

| Principle | V2 application |
|-----------|----------------|
| **Size hierarchy** | Hero art ≥ 50% of above-the-fold height on desktop; project cards ≥ 2× current thumb size; entity thumbs ≤ half project card height |
| **Aspect ratios** | Projects/worlds: **16:9** ( cinematic ). Characters: **1:1** in mosaic only, never as tiny sidebar avatars on home |
| **Golden hour treatment** | Subtle warm gradient **behind** hero image (not on top); hover: gentle scale + amber border glow (extend Phase 1 `studioCardLink` pattern) |
| **No chrome on images** | Remove type badges on every thumb unless needed for accessibility; prefer **title on hover or below** |
| **Placeholder art** | `studioEmptyArt` gradients with type label — never empty gray boxes |
| **Text overlay rules** | Hero: title + one CTA over bottom third with scrim; never center a headline **instead of** showing art |
| **Load priority** | Cover URLs fetched first; counts and secondary lists lazy |

**Litmus:** Screenshot of homepage cropped to hero — a stranger should say *“that’s their creative work,”* not *“that’s a SaaS app.”*

---

### 4. How should projects be surfaced?

**Projects become the home page’s primary organizing surface; the Projects nav item becomes “all projects” or merges.**

| Decision | Proposal |
|----------|----------|
| **Home = project gallery** | Default view is a **cover-forward grid of projects** (returning) or **one aspirational hero + CTA** (first-time) |
| **Projects page role** | Option A (preferred): **Redirect** `/dashboard/projects` → home with anchor `#all-projects`. Option B: Keep as full archive with filters — home shows **recent/active subset only** |
| **Card content** | Cover (required visual), title, **one human line** (“3 stories · last edited yesterday”) — de-emphasize entity-type inventory strings |
| **Default project** | Do not badge “Default” on home cards — visually indistinguishable; default is implementation detail |
| **Empty project** | Card shows warm placeholder + *“Add your first story or character”* — tap opens project workspace, not a form |
| **Project vs entity hierarchy** | Home answers: *“What am I making?”* (projects). Sidebar/Studio drawer answers: *“Browse all characters/worlds/stories”* |

**Why:** [VISUAL_IDENTITY_V1.md](./VISUAL_IDENTITY_V1.md) maps Home/Projects hero to **project or world cover grid** — “Your universes live here.” Today home and projects **split that job**.

---

### 5. How should creation start?

**One front door; art enters early; forms follow.**

| Stage | V2 behavior |
|-------|-------------|
| **Primary entry** | Single CTA: **“Begin”** / **“Start something new”** → `StartNewProjectWizard` only (no Quick-add fork on home) |
| **Wizard step 1** | Work intent cards (comic, novel, picture book, etc.) — **visual tiles**, not radio list |
| **Wizard step 2** | Title + **optional cover upload** on same screen — “Add a cover when you have one” |
| **Wizard step 3** | Start path: Story / Character / World / **Upload artwork** — unchanged logic, warmer copy |
| **After create** | Route to **workspace with image upload surfaced** (character gallery, world cover, story context) — never dump on project overview tab alone |
| **Quick add** | Demote to **inside project workspace** or sidebar long-press — not home hero competitor |
| **AI** | Not on homepage ([AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md)); suggestions remain in workspaces |

**Copy shift:**

| Avoid | Prefer |
|-------|--------|
| “Create” (generic) | “Begin your project” / “Start a story” |
| “Quick add” | “Add to this project” (contextual) |
| “New Character” modal title | “Who’s in your story?” |

---

### 6. How should the homepage embody the sunset creative studio vision?

**Emotional checklist mapped to layout:**

| V1 emotion | Homepage V2 embodiment |
|------------|------------------------|
| **Sunset** | Persistent `studioHeroWash` extends behind **art**, not just a text band; page background warm charcoal (`--background`) |
| **Golden hour** | Light appears to **fall on covers** — top-weighted gradient, slightly brighter card tops |
| **Adventure** | “Continue” / “Begin” forward motion — no task lists, no incomplete badges |
| **Storytelling** | Hero shows **named project or story**, not “Home” or “Dashboard” |
| **Exploration** | One optional collapsed section: “Browse your studio” (characters, worlds, stories) — **below** projects |
| **Creativity** | Generous whitespace between project rows; max **one primary action** per viewport region |
| **Wonder** | Real creator art at largest size; placeholders feel like **empty frames waiting for a painting** |

**What to remove or demote from home:**

- Entity count badges on Stories/Characters/Worlds cards
- “Explore your studio” as a **prominent** three-column admin row
- Competing CTAs (Create + Start New Project + sidebar Create)
- Cold zinc headers (“Projects”, numeric pills)
- Violet-primary buttons on home (reserve violet for links/focus; **amber for invitation**)

**Sidebar on home (optional V2.1):** Collapsed to icon rail or hidden on `/dashboard` so the studio fills the frame. Not required for V2 doc approval but aligns with “not a dashboard.”

---

## Proposed layout — returning creator

```
┌──────────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░ sunset ambient wash (full width) ░░░░░░░░░░░░░░░░░ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │                                                              │ │
│ │              [ PROJECT COVER — 16:9 HERO ]                   │ │
│ │                                                              │ │
│ │   California Coast Surf Stories                              │ │
│ │   [ Continue → ]              [ Start something new ]        │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Your projects                                                   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                   │
│  │ 16:9 cover │ │ 16:9 cover │ │ 16:9 cover │  ...              │
│  │ Title      │ │ Title      │ │ Title      │                   │
│  └────────────┘ └────────────┘ └────────────┘                   │
│                                                                  │
│  Recent moments                                    (optional)    │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐  small mixed entity thumbs                 │
│                                                                  │
│  ▸ Browse studio — characters, worlds, stories    (collapsed)   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Proposed layout — first-time creator

```
┌──────────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░ warm sunset wash ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │   [ silhouette ]  [ silhouette ]  [ silhouette ]             │ │
│ │         soft empty frames — character / world / story        │ │
│ │                                                              │ │
│ │        A place where stories begin                           │ │
│ │   Your characters, worlds, and stories will live here.       │ │
│ │                                                              │ │
│ │              [ Begin your first project ]                    │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  (no project grid, no count cards, no recent work section)       │
└──────────────────────────────────────────────────────────────────┘
```

---

## Relationship to existing pages

| Surface | V2 relationship |
|---------|-----------------|
| `/dashboard` | **Primary deliverable** — full V2 layout |
| `/dashboard/projects` | Subset or redirect; avoid duplicating grid |
| `CreateModal` | Simplified — wizard only from home; quick add contextual |
| `StartNewProjectWizard` | Reuse; add optional cover upload step in design spec later |
| Marketing `/` | Future pass — adopt sunset + art-forward hero for consistency |
| Sidebar nav | Unchanged in V2 scope; home content must not **depend** on it |

---

## Success criteria (for future implementation)

Before shipping Homepage V2, validate:

1. **First-time test:** New account lands on home — no numeric badges, one clear Begin CTA, no empty dashed admin box.
2. **Returning test:** User with “California Coast Surf Stories” sees **project cover as largest element** within 2 seconds.
3. **Art hero test:** Cropped screenshot reads as **gallery**, not dashboard (team review against V1 checklist).
4. **Creation test:** Begin → wizard → workspace with **upload visible** in &lt; 3 taps.
5. **Tagline test:** Page feels like *“A place where stories begin”* — not *“manage your projects (3).”*
6. **Child test:** 10-year-old can start “The Giant Wave” without understanding Characters vs Worlds nav.

---

## Non-goals (this proposal)

- Sidebar redesign or nav IA merge
- Marketing homepage rewrite
- New AI features on home
- Project model or database changes
- Light mode
- Motion design spec
- Component-level implementation tickets

---

## Summary

Homepage V2 completes the shift Phase 1 began: **projects and art own the viewport**, creation has **one warm front door**, and administration recedes. First-time creators see **possibility frames** and a single Begin path; returning creators see **their last project as hero** and a **cover gallery** of everything they are making. The sunset creative studio is not a palette swap — it is **hierarchy**: stories and images first, counts and categories last.
