# CharID Visual Identity V1

**Status:** Approved emotional UX direction — **planning only, no implementation mandate**  
**Date:** 2026-06-14  
**Version:** 1.0  
**Authority:** [CHARID_NORTH_STAR_V1.md](./CHARID_NORTH_STAR_V1.md) · [BRAND.md](./BRAND.md)

---

## Purpose

This document defines the **emotional design direction** for CharID — how the product should *feel* when a creator opens it, navigates a story, or lands on an empty workspace.

It does not replace [BRAND.md](./BRAND.md) (logo, mark, existing tokens). It sits **above** individual UI implementations and guides **future** layout, color evolution, imagery, copy tone, and motion.

**Use this doc when:**

- Designing or refactoring a workspace (Story, Character, World, Project)
- Choosing between a “dashboard” layout and a “studio” layout
- Evaluating whether a screen feels like CharID or like generic SaaS
- Prioritizing what appears first on a page — art or admin

---

## Core feeling

### Creative optimism

CharID should feel **inspiring, welcoming, imaginative, and calm**.

Creators arrive with fragile ideas. The interface should widen the horizon, not narrow it. Every screen should quietly say: *your story is worth making* — not *here are twelve settings you must configure first*.

| We aim for | We do not aim for |
|------------|-------------------|
| Warm invitation | Cold efficiency |
| Gentle momentum | Urgent productivity |
| Room to imagine | Pressure to optimize |
| Confidence in the work | Anxiety about the tool |

---

## Reference emotions

These are **mood references**, not literal visual themes. No screen should look like a fantasy game UI or a stock-photo sunset banner. The goal is to **channel the feeling**:

| Emotion | What it means in UI |
|---------|---------------------|
| **Sunset** | Warm light at the edge of the day — soft accent glow, not dark-mode harshness |
| **Golden hour** | Highlights that feel earned; artwork and covers catch the “light” |
| **Adventure** | Forward motion without gamification badges or quest logs |
| **Storytelling** | Narrative hierarchy — chapters before settings, cast before metadata |
| **Exploration** | Discoverable depth; calm surface, optional depth below |
| **Creativity** | Blank space as possibility, not emptiness to fill with chrome |
| **Wonder** | Delight in seeing your own characters and worlds rendered well |

---

## What to avoid

These aesthetics fight the north star. Reject them in reviews even when they look “polished” or “modern.”

| Avoid | Why |
|-------|-----|
| **Corporate SaaS** | CharID is a creative studio, not HR software |
| **Cyberpunk AI dashboards** | Neon grids, matrix rain, “AI command center” framing |
| **Crypto aesthetics** | Holographic cards, aggressive gradients, hype copy |
| **Productivity-app sterility** | Dense tables, gray-on-gray admin, checkbox-first layouts |
| **Overwhelming fantasy UI** | Ornate borders, faux parchment, RPG chrome — the *stories* can be fantasy; the *tool* stays calm |

**Litmus test:** If a screen could belong to a DevOps monitor or an NFT marketplace, it does not belong to CharID.

---

## Design principles

### 1. Art is the hero

Character portraits, world covers, story thumbnails, moodboard strips, and map previews are **primary content**, not decoration around forms.

- Galleries and cover art lead the viewport
- Metadata supports the image; it does not compete with it
- Empty states show **what could appear here** (silhouette, gentle prompt), not a bare form field

### 2. Images before forms

When a creator opens a workspace, they should **see their work** before they see inputs.

- Prefer read surfaces (V3 story context, character gallery, world cover hero) above the fold
- Collapse or defer admin fields (slug, visibility toggles, advanced bible tabs)
- Create flows may start with a name — but the destination workspace should reward with visuals immediately after

### 3. Warm before cold

Temperature is emotional, not only hue. Prefer warmth in accent, copy, and spacing before reaching for neutral gray utility.

- Warm neutrals (stone, sand, soft charcoal) over blue-gray corporate palettes
- Sunset accents (amber, coral, soft gold, muted rose) as invitation — not alarm
- Cool tones (violet, indigo) may remain for focus and brand continuity — but **balanced** with warmth, not dominant cold chrome

*Note:* Current product tokens lean violet-on-dark ([BRAND.md](./BRAND.md)). Future UI passes should **introduce warm neutrals and sunset accents** without abandoning the dossier identity.

### 4. Inspiration before administration

Order sections so creators feel pulled forward, not processed.

- Story: chapters → cast & setting → advanced plan
- Character: gallery & personality → relationships → bible depth
- World: cover & gallery → places & map → rules & cultures

Administration (edit details, slugs, visibility) remains available — **below** the inspiring core.

### 5. Calm before complexity

Depth is allowed; noise is not.

- One primary action per region
- Generous whitespace between story beats on a page
- Progressive disclosure (collapsed advanced sections) instead of full dashboards on load
- Motion: subtle, purposeful — never flashy “AI generating” theatrics

---

## Visual direction

### Palette (target evolution)

| Role | Direction | Notes |
|------|-----------|--------|
| **Background** | Deep warm neutral | Soft charcoal with brown undertone — not pure `#000` |
| **Surface** | Layered warm cards | Slight elevation; art sits on calm ground |
| **Text** | Warm off-white primary | Readable, never harsh `#FFF` on black |
| **Accent** | Sunset spectrum | Amber, coral, soft gold for CTAs and highlights |
| **Secondary accent** | Existing brand violet | Focus rings, links — paired with warm, not alone |
| **Border** | Low-contrast warm dividers | Structure without grid heaviness |

Exact hex values are **V1.1** (token pass). This document defines **direction**, not final CSS variables.

### Gradients

- **Soft gradients only** — golden-hour washes, not crypto mesh
- Use behind heroes and empty states; never behind dense form tables
- Gradient direction should feel like **light falling** (top or corner), not laser beams

### Whitespace

- Prefer **one column of story** over three columns of widgets
- Section spacing should feel like **turning a page**, not scrolling a spreadsheet
- Mobile: same calm; stack art full-width before controls

### Artwork presentation

- **Strong aspect ratios** for covers (16:9 worlds, square characters)
- Rounded corners — soft, not toy-like
- No heavy drop shadows or outer glow on every card
- Let image quality speak; frame it, do not decorate it

---

## Voice and microcopy

Aligns with [BRAND.md](./BRAND.md) voice but emphasizes **invitation**:

| Prefer | Avoid |
|--------|-------|
| “Continue your story” | “Configure story entity” |
| “Add a place” | “Create location record” |
| “Your cast” | “Story character roster (0)” |
| “What happens next?” | “Incomplete tasks” |

Empty states are **encouraging**, not scolding. Errors are **clear**, not alarming red dashboards.

---

## Experience tagline

The product should feel like:

> **“A place where stories begin.”**

It should **not** feel like:

> **“An AI control panel.”**

Every major surface should pass this test. If the headline, hero, and primary CTA together read as “manage your AI pipeline,” redesign the hierarchy.

---

## Application by surface

| Surface | Hero element | Emotional goal |
|---------|--------------|----------------|
| **Home / Projects** | Project or world cover grid | “Your universes live here” |
| **Story workspace** | Chapters + setting visuals | “You are writing inside a world” |
| **Character workspace** | Portrait gallery | “This person is real in your canon” |
| **World workspace** | Cover + map/mood | “You can walk this place” |
| **Create flows** | Name + optional image early | “Start something” — not “submit form” |
| **Portfolio (public)** | Finished work first | “A creator’s gallery,” not a profile admin page |

---

## Relationship to other documents

| Document | Relationship |
|----------|--------------|
| [BRAND.md](./BRAND.md) | Logo, mark, current tokens — **compatible**; warm evolution extends, not replaces, dossier identity |
| [CHARID_NORTH_STAR_V1.md](./CHARID_NORTH_STAR_V1.md) | Product soul — visual identity serves “finish creative work” |
| [STORY_WORKSPACE_V3.md](./STORY_WORKSPACE_V3.md) | Information order aligns with “inspiration before administration” |
| [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) | AI UI stays calm; no cyberpunk “generation theater” |
| Workspace V2 docs | Gallery-first layouts are **on-brand** for V1 emotional direction |

---

## Review checklist (future UI work)

Before shipping a screen, ask:

1. **Is art the largest, most prominent element?**
2. **Would a creator see their work before a form?**
3. **Does the palette feel warm and welcoming, not cold and corporate?**
4. **Is the primary message inspiration, not administration?**
5. **Is complexity hidden until requested?**
6. **Could this screen be mistaken for SaaS, crypto, or an AI dashboard?** → revise
7. **Does it feel like stories begin here?**

---

## Out of scope (V1)

- Final design tokens / CSS migration
- Component library rewrite
- Marketing site redesign
- Dark/light mode specification
- Motion design spec

These follow in **Visual Identity V1.1+** after founder validation of direction.

---

## Summary

CharID’s visual identity is **creative optimism**: warm, calm, art-forward, and story-centered. The interface invites creators into their universes — it does not administer them. Future UI work should make CharID feel like **golden hour for imagination**, not midnight in a server room.
