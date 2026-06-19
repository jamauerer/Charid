# CharID Portfolio V2 Vision

Product architecture document — **not an implementation spec**.

Portfolio V2 transforms CharID's public presence from a **profile editor** into a **creative showcase** — surfacing what a creator has made, not just who they are.

See also:
- [CHARID_CORE_PRINCIPLE.md](./CHARID_CORE_PRINCIPLE.md)
- [PROJECT_TYPES_VISION.md](./PROJECT_TYPES_VISION.md)
- [REFERENCE_ASSETS_VISION.md](./REFERENCE_ASSETS_VISION.md)

**AI assists. Creators create. CharID remembers.**

---

## Purpose

### The question Portfolio must answer

> **"What has this creator made?"**

Not: "What is their username and bio?"

### Current state (audit)

| Surface | Today | Gap |
|---------|-------|-----|
| **Dashboard `/dashboard/portfolio`** | Profile editor: username, avatar, bio, visibility | No curation, no showcase preview of creative work |
| **Public `/u/{username}`** | Profile header + public worlds + public characters | Stories section is **"Coming Soon"** placeholder |
| **Data available but not surfaced** | Stories (with `project_type`, cover via `featured_image_id`), story reference assets, chapters | Not aggregated at portfolio level |
| **Featured / curation** | None — all public content shown in `created_at` order | No creator control over highlight order or selection |

Portfolio today is **profile management**. Portfolio V2 is **creative presentation** built on existing CharID memory.

---

## Portfolio goals

Portfolio V2 should support these creator intents without separate products:

| Goal | Primary sections |
|------|------------------|
| Art school portfolio | Gallery, Characters, Projects |
| Creative writing portfolio | Projects (Novels), Worlds, Characters |
| Animation portfolio | Projects (Film / Animation), Gallery, Characters |
| Comic portfolio | Projects (Graphic Novels), Gallery, Characters |
| Character design portfolio | Characters, Gallery, Worlds |
| General creator showcase | Profile Header + all sections |

One portfolio layout adapts through **which sections have content** and **project-type grouping** — not separate portfolio modes.

---

## Portfolio structure

```text
/u/{username}
├── Profile Header          [Phase 1 — live fields, enhanced layout]
├── Projects                [Phase 1 — stories grouped by project_type]
├── Characters              [Phase 1 — featured public characters]
├── Worlds                  [Phase 1 — featured public worlds]
├── Gallery                 [Phase 2 — curated cross-project artwork]
└── Published Works         [Phase 3 — external + uploaded finished work]
```

---

### 1. Profile Header

**Purpose:** Identity and first impression — kept minimal so work dominates.

| Element | Source | Status |
|---------|--------|--------|
| Avatar | `profiles.avatar_url` | Live |
| Display name | `profiles.display_name` | Live |
| Username | `profiles.username` | Live |
| Bio | `profiles.bio` | Live |

**V2 enhancements (presentation only):**
- Larger hero treatment (avatar + name + bio)
- Optional tagline field (future — Phase 4)
- Remove "Character Portfolio" label — replace with creator-focused heading or no label

**No duplicate storage.** Header reads `profiles` row only.

---

### 2. Projects

**Purpose:** Answer "what narratives / productions has this creator built?"

Projects **are Stories** — not a new entity.

| Display field | Source |
|---------------|--------|
| Title | `stories.title` |
| Summary | `stories.summary` |
| Status | `stories.status` |
| Project type | `stories.project_type` |
| Cover | `stories.featured_image_id` → `story_images.image_path` |
| World context | `worlds.name` via `stories.world_id` |
| Link | `/u/{username}/worlds/{worldSlug}/stories/{storySlug}` |

**Grouping (public portfolio):**

```text
Projects
├── Graphic Novels       ← stories where project_type = graphic_novel
├── Films / Animation    ← stories where project_type = film_animation
├── Children's Books       ← stories where project_type = childrens_book
├── Novels                 ← stories where project_type = novel
└── Other                  ← stories where project_type = other
```

Empty groups are hidden. Order within group: creator-curated sort (Phase 2) or `created_at desc` (Phase 1 default).

**Visibility:** Story appears on portfolio when:
- `profiles.is_public = true`
- Parent `worlds.is_public = true`
- Story belongs to that world (stories inherit world visibility — no story-level `is_public` today)

**Card design:** Reuse `PublicStoryCard` pattern — cover image, title, summary, project type badge, status badge, world name.

---

### 3. Characters

**Purpose:** Showcase character design and creative identity.

| Display field | Source |
|---------------|--------|
| Name | `characters.name` |
| Portrait | `characters.featured_image_id` → gallery, or legacy `photo_path` |
| World | `worlds.name` via `characters.world_id` |
| Link | `/u/{username}/characters/{id}` |

**Phase 1:** All public characters (`characters.is_public = true`), ordered by `created_at desc`.

**Phase 2 — Featured characters:**
- Creator pins 3–12 characters from dashboard portfolio editor
- Stored as ordered list of character IDs on profile (future curation field — not duplicate character data)
- Unfeatured public characters optionally hidden or moved to "More characters"

---

### 4. Worlds

**Purpose:** Showcase universes and settings the creator builds in.

| Display field | Source |
|---------------|--------|
| Name | `worlds.name` |
| Description | `worlds.description` |
| Cover | `worlds.cover_image_path` |
| Story count | aggregate from `stories` |
| Character count | aggregate from `characters` |
| Link | `/u/{username}/worlds/{slug}` |

**Phase 1:** All public worlds, ordered by `created_at desc`.

**Phase 2 — Featured worlds:** Same curation pattern as characters — ordered ID list on profile.

---

### 5. Gallery (Phase 2)

**Purpose:** Cross-project artwork reel — the "art school wall" section.

**Not a new upload bucket in Phase 2.** Gallery **surfaces existing reference assets** the creator selects:

| Asset origin | Examples | Source table |
|--------------|----------|--------------|
| Character | Portraits, full body, expressions | `character_images` |
| World | Cover, future location refs | `worlds.cover_image_path`, future world assets |
| Story | Covers, mood boards, key scenes | `story_images` (`asset_type`) |

**Phase 2 curation model (future):**

```text
portfolio_gallery_items   [future junction — Phase 2]
├── profile_id
├── source_type           'character_image' | 'story_image' | 'world_cover'
├── source_id             uuid reference into existing asset row
├── caption_override      optional
└── sort_order
```

Gallery items are **pointers** to existing assets — no duplicate storage.

**Future asset types in gallery (display labels):**
- Concept art
- Character sheets
- Covers
- Mood boards

---

### 6. Published Works (Phase 3)

**Purpose:** Finished output — what the creator has released to the world outside CharID planning tools.

Examples:
- PDF upload (comic chapter, illustrated book)
- Published novel excerpt
- External links (Amazon, Webtoon, personal site)
- YouTube / Vimeo embeds

**Future entity (conceptual only — not designed for migration here):**

```text
published_works             [Phase 3 — new table]
├── id
├── user_id
├── title
├── description
├── work_type                 'pdf' | 'link' | 'video' | 'other'
├── file_path                 nullable — storage ref for uploads
├── external_url              nullable
├── cover_image_path          nullable — or pointer to reference asset
├── sort_order
├── is_public
└── created_at
```

Published Works are **outputs**, not planning objects. They may link to a Story/World optionally but do not replace them.

---

## Architecture

### System layers

```text
┌─────────────────────────────────────────────────────────────┐
│  Public Portfolio Page   /u/{username}                      │
│  Dashboard Portfolio     /dashboard/portfolio               │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│  Portfolio Assembly Layer (V2)                              │
│  getPublicPortfolioV2() / getPortfolioEditorState()         │
│  — aggregates, groups, sorts, resolves signed URLs          │
└───────────────────────────────┬─────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   profiles              characters / worlds          stories
        │                       │                  story_images
        │                       │                  story_characters
        └───────────────────────┴───────────────────────┘
                                │
                    Existing Supabase + Storage
                    (no duplicate content storage)
```

### Key design rules

1. **Surface, don't duplicate** — Portfolio reads existing tables; it does not fork creative data.
2. **Visibility inherits** — Public portfolio respects `profiles.is_public`, `worlds.is_public`, `characters.is_public`, and world-gated story access.
3. **Stories are projects** — `project_type` drives grouping; no separate Projects table.
4. **Covers are featured assets** — Story cover = `featured_image_id`; world cover = `cover_image_path`; character portrait = featured gallery image.
5. **Curation is optional metadata** — Featured ordering and gallery selection add profile-level pointers, not copies.
6. **Dashboard portfolio evolves** — Editor becomes **curate + preview**, not just profile fields.

### Dashboard portfolio editor (V2 direction)

```text
/dashboard/portfolio
├── Profile Header fields        [live — username, avatar, bio, visibility]
├── Featured Worlds              [Phase 2 — pick + reorder]
├── Featured Characters            [Phase 2 — pick + reorder]
├── Gallery Curation               [Phase 2 — pick assets from across CharID]
├── Published Works manager        [Phase 3]
└── Live Public Preview            [enhanced — full V2 layout, not header-only]
```

---

## Wireframes

### Public portfolio — desktop (Phase 1 target)

```text
┌──────────────────────────────────────────────────────────────────┐
│  [CharID header nav]                                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                         ┌─────────┐                              │
│                         │ Avatar  │                              │
│                         └─────────┘                              │
│                       Display Name                               │
│                        @username                                 │
│                                                                  │
│     Bio text centered, max-width prose block                     │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  PROJECTS                                                        │
│                                                                  │
│  Graphic Novels                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │ cover      │  │ cover      │  │ cover      │                 │
│  │ Title      │  │ Title      │  │ Title      │                 │
│  │ Summary…   │  │ Summary…   │  │ Summary…   │                 │
│  │ GN · Idea  │  │ GN · WIP   │  │ GN · Done  │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
│                                                                  │
│  Novels                                                          │
│  ┌────────────┐  ┌────────────┐                                 │
│  │ cover      │  │ cover      │                                 │
│  │ Title      │  │ Title      │                                 │
│  └────────────┘  └────────────┘                                 │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  CHARACTERS                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │photo │ │photo │ │photo │ │photo │ │photo │ │photo │          │
│  │ Name │ │ Name │ │ Name │ │ Name │ │ Name │ │ Name │          │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  WORLDS                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │ cover      │  │ cover      │  │ cover      │                 │
│  │ World Name │  │ World Name │  │ World Name │                 │
│  │ desc…      │  │ desc…      │  │ desc…      │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Public portfolio — Phase 2 additions

```text
├──────────────────────────────────────────────────────────────────┤
│  GALLERY                                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│  │        │ │        │ │        │ │        │ │        │  ← masonry│
│  │  art   │ │  art   │ │  art   │ │  art   │ │  art   │    or   │
│  │        │ │        │ │        │ │        │ │        │   grid  │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘         │
│  captions · sourced from character/story/world reference assets  │
├──────────────────────────────────────────────────────────────────┤
│  PUBLISHED WORKS                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                       │
│  │ ▶ Video embed    │  │ PDF · Comic Issue│                       │
│  │   or thumbnail   │  │   #1 download    │                       │
│  └──────────────────┘  └──────────────────┘                       │
└──────────────────────────────────────────────────────────────────┘
```

### Dashboard portfolio editor — Phase 1

```text
┌───────────────────────────────┬──────────────────────────────┐
│  PROFILE                      │  LIVE PREVIEW                │
│  [username]                   │  ┌────────────────────────┐  │
│  [display name]               │  │ Full V2 public layout  │  │
│  [bio]                        │  │ (read-only mirror)     │  │
│  [avatar upload]              │  │                        │  │
│  [visibility]                 │  │ Projects · Characters  │  │
│                               │  │ · Worlds               │  │
│  [Save Portfolio]             │  └────────────────────────┘  │
│  [View Public Portfolio →]    │                              │
└───────────────────────────────┴──────────────────────────────┘
```

### Dashboard portfolio editor — Phase 2 (curation)

```text
┌──────────────────────────────────────────────────────────────────┐
│  FEATURED CHARACTERS   [drag to reorder]                        │
│  ☑ Lyra Voss   ☑ Marcus   ☐ Background NPC   [+ Add character] │
├──────────────────────────────────────────────────────────────────┤
│  FEATURED WORLDS     [drag to reorder]                           │
│  ☑ Aethermoor   ☑ Neon District   [+ Add world]                │
├──────────────────────────────────────────────────────────────────┤
│  GALLERY     [pick from existing assets across all projects]     │
│  ┌────┐ ┌────┐ ┌────┐  + Add from Character / Story / World     │
│  │img │ │img │ │img │                                            │
│  └────┘ └────┘ └────┘                                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Data sources

### Phase 1 — no new tables

| Portfolio section | Primary tables | Supporting queries |
|-------------------|----------------|-------------------|
| Profile Header | `profiles` | Signed URL for `avatar_url` |
| Projects | `stories`, `story_images`, `worlds` | Filter public worlds; group by `project_type`; cover via `featured_image_id` |
| Characters | `characters`, `character_images` | `is_public = true`; portrait via `photo_path` / featured |
| Worlds | `worlds`, `characters`, `stories` | `is_public = true`; cover via `cover_image_path`; counts |

**Existing actions to extend (conceptual):**
- `getPublicPortfolio()` — add stories with covers, grouped by `project_type`
- `getPublicWorlds()` — already used
- `getStoryCoverUrls()` — batch cover resolution (live)

### Phase 2 — curation metadata (future)

| Feature | Proposed storage | Points to |
|---------|------------------|-----------|
| Featured characters | `profiles.featured_character_ids uuid[]` or junction table | `characters.id` |
| Featured worlds | `profiles.featured_world_ids uuid[]` or junction table | `worlds.id` |
| Gallery items | `portfolio_gallery_items` junction | `character_images`, `story_images`, world cover |

Still **no duplicate image storage** — junction rows reference existing asset IDs.

### Phase 3 — published works (future)

| Feature | Proposed storage |
|---------|------------------|
| PDF / file uploads | `published_works` + `character-photos` bucket path |
| External links / video | `published_works.external_url` |

### Phase 4 — resume / creator profile (future)

| Feature | Proposed storage |
|---------|------------------|
| Tagline, location, skills | Extend `profiles` or `creator_resume` table |
| Education, exhibitions | `creator_resume` detail rows |

---

## Relationship to existing CharID memory

```text
CharID Memory Layer              Portfolio V2 (presentation)
─────────────────────           ─────────────────────────────
characters + gallery      ──►   Characters section
worlds + cover            ──►   Worlds section
stories + project_type    ──►   Projects section (grouped)
story_images + asset_type ──►   Project covers + future Gallery
chapters                  ──►   Linked from project cards (depth)
profiles                  ──►   Profile Header
```

**Portfolio does not own creative data.** If a story is deleted, it disappears from Projects. If a world is made private, its stories and characters leave the public portfolio. Single source of truth is preserved.

---

## Visibility matrix

| Object | Visible on public portfolio when |
|--------|----------------------------------|
| Profile | `profiles.is_public = true` |
| World | `worlds.is_public = true` + public profile |
| Character | `characters.is_public = true` + public profile |
| Story (project) | Parent world public + public profile |
| Story asset | Parent story visible (RLS chain) |
| Gallery item (Phase 2) | Source asset visible + curated on profile |
| Published work (Phase 3) | `published_works.is_public = true` |

---

## Implementation phases

### Phase 1 — Creative showcase foundation

**Goal:** Replace "Coming Soon" with real content; portfolio answers "what have they made?"

| Deliverable | Description |
|-------------|-------------|
| Profile Header refresh | Improved hero layout on `/u/{username}` |
| Projects section | Public stories grouped by `project_type` with covers |
| Characters section | Keep live — refine layout and ordering |
| Worlds section | Keep live — refine layout, show story/character counts |
| `getPublicPortfolio` extension | Fetch and group public stories with cover URLs |
| Dashboard preview upgrade | Preview shows Projects + Characters + Worlds, not header only |

**No new tables.** Uses live `stories`, `story_images`, `featured_image_id`, `project_type`.

---

### Phase 2 — Curation and gallery

**Goal:** Creator controls highlight reel.

| Deliverable | Description |
|-------------|-------------|
| Featured characters | Pin + reorder from dashboard |
| Featured worlds | Pin + reorder from dashboard |
| Gallery section | Curated grid of existing reference assets |
| Curation schema | Profile-level junction tables or ID arrays |
| Asset picker UI | Select from character/story/world images already in CharID |

---

### Phase 3 — Published works

**Goal:** Showcase finished output beyond planning objects.

| Deliverable | Description |
|-------------|-------------|
| `published_works` table | PDF, link, video types |
| Upload + external URL support | Storage + embed |
| Published Works section | Cards with download / link / embed |
| Optional story/world link | "Based on {story title}" |

---

### Phase 4 — Creator profile / resume

**Goal:** Professional presentation for art school and industry contexts.

| Deliverable | Description |
|-------------|-------------|
| Tagline, location, skills | Extended profile fields |
| Resume sections | Education, exhibitions, commissions |
| Print / share | PDF export of portfolio (future) |

---

## Recommended implementation order

| Step | Feature | Phase | Depends on |
|------|---------|-------|------------|
| 1 | Extend `getPublicPortfolio` with stories + covers | 1 | Story Reference Assets v1 (live) |
| 2 | Projects section on `/u/{username}` grouped by `project_type` | 1 | Step 1 |
| 3 | Profile Header layout refresh | 1 | — |
| 4 | Enhanced dashboard live preview (full portfolio mirror) | 1 | Steps 1–3 |
| 5 | Featured characters curation | 2 | Migration for profile curation |
| 6 | Featured worlds curation | 2 | Step 5 pattern |
| 7 | Gallery junction + asset picker | 2 | Reference assets across objects |
| 8 | Gallery section on public portfolio | 2 | Step 7 |
| 9 | `published_works` schema + uploads | 3 | Storage policies |
| 10 | Published Works section | 3 | Step 9 |
| 11 | Resume / extended creator profile | 4 | Profile schema extension |

**Highest impact next step:** Phase 1, Step 1–2 — wire public stories into the portfolio as Projects. The public page already has a "Coming Soon" placeholder for Stories; the data model is ready.

---

## Out of scope (all phases)

- Duplicate story/character/world storage for portfolio
- AI-generated portfolio content
- Standalone portfolio builder outside CharID objects
- Per-story public visibility flag (stories inherit world visibility unless explicitly added later)
- Portfolio themes / custom CSS per creator (future consideration)

---

## Summary

| Question | Answer |
|----------|--------|
| What is Portfolio V2? | Creative showcase surfacing existing CharID work |
| What are Projects? | Public stories grouped by `project_type` |
| Where do images come from? | Existing reference assets — no duplicate storage |
| What's live today? | Profile header, worlds, characters; stories placeholder |
| What's first? | Projects section from live story + cover data |
| What comes later? | Curation, gallery, published works, resume |

Portfolio V2 completes the public face of CharID's memory layer — turning structured creative data into a presentation layer worthy of art school, writing, animation, and comic portfolios.

---

*Document status: Draft for review — no code, migrations, or implementation implied.*
