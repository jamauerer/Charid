# Creator Showcase V1 — Implementation Plan

Product architecture document — **design first, no implementation**.

Separates the **Creative Workspace** (build, organize, private by default) from the **Public Creator Showcase** (present curated, explicitly published work).

See also:
- [CREATOR_SHOWCASE_VISION.md](./CREATOR_SHOWCASE_VISION.md)
- [PORTFOLIO_V2_VISION.md](./PORTFOLIO_V2_VISION.md)
- [CHARID_CORE_PRINCIPLE.md](./CHARID_CORE_PRINCIPLE.md)

**Workspace = Build · Showcase = Present**

**Phase 1 excludes:** follows, likes, comments, notifications, payments.

---

## Approved product principles (revision)

### Two separate layers

CharID has two distinct layers that must not be conflated:

| Layer | Purpose |
|-------|---------|
| **Private Creative Workspace** | Build, organize, draft — dashboard only |
| **Public Creator Showcase** | Present finished or intentionally published work |

### Privacy model

> **Everything is private by default. Publishing is intentional.**

Private by default — no automatic public exposure:

- Characters, Worlds, Stories, Chapters, Story Assets
- Future: AI conversations, drafts, notes, reference images

Nothing becomes public through inheritance, parent visibility, or defaults. Publishing is always an explicit creator action.

### Showcase model

The public profile is a **showcase**, not a file system.

**Visitors see:**

- About Creator
- Featured Work
- Graphic Novels · Films / Animation · Children's Books · Artwork

**Visitors do not browse:**

- Worlds · Stories · Chapters · Character databases

as raw workspace structures.

---

## 1. Architecture

### Core principle

```text
┌─────────────────────────────────────────────────────────────────┐
│  CREATIVE WORKSPACE (private / dashboard)                       │
│  Worlds → Stories → Chapters                                    │
│  Characters · Reference assets · Story assets                     │
│  Organizational graph — NOT shown on public profile             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    Explicit "Publish to Showcase"
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  SHOWCASE PUBLICATION LAYER (new)                                 │
│  showcase_entries — draft / published, featured, typed sections │
│  Pointers to workspace content — no duplicate creative storage  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  PUBLIC CREATOR SHOWCASE (/u/{username})                          │
│  Header · Featured Work · section tabs · published entries only │
└─────────────────────────────────────────────────────────────────┘
```

### What changes conceptually

| Today | Creator Showcase V1 |
|-------|---------------------|
| Public pages mirror workspace URLs (`/worlds/{slug}/stories/...`) | Public pages show **curated showcase entries** |
| `worlds.is_public` + `characters.is_public` auto-expose content | Workspace visibility **decoupled** from showcase |
| Stories visible when parent world is public | Stories visible only when **published as showcase entry** |
| Portfolio = profile settings + raw public object lists | Portfolio = **publish + feature** workflow + showcase preview |
| Explore (future) browses worlds/stories structure | Explore V2 browses **published showcase entries** by type |

### System components (Phase 1)

| Component | Role |
|-----------|------|
| **Workspace API** | Unchanged dashboard CRUD — worlds, stories, chapters, assets |
| **Showcase API** | Create/update/publish/unpublish `showcase_entries` |
| **Showcase Assembler** | Builds public `/u/{username}` from published + featured entries |
| **Showcase Reader** | Public detail page per entry `/u/{username}/work/{slug}` |
| **Portfolio Dashboard** | Publish manager + featured picker + live showcase preview |

### Public URL model (V1)

```text
/u/{username}                          Creator showcase home
/u/{username}/work/{entrySlug}         Published work detail
```

**Retired from public showcase navigation (not from workspace):**

```text
/u/{username}/worlds/{slug}             → workspace structure (hidden or legacy redirect)
/u/{username}/worlds/.../stories/...   → workspace structure
/u/{username}/worlds/.../chapters/...  → workspace structure
/u/{username}/characters/{id}          → optional Phase 1.5; not primary nav
```

Legacy routes may remain reachable during migration but are **removed from showcase navigation and Explore V2**.

### Visibility gate chain (V1)

```text
profiles.is_public = true               Gate 1: showcase exists
  └── showcase_entries.publish_status = 'published'   Gate 2: entry visible
        └── showcase_entry_sources → workspace rows   Gate 3: resolve content
```

Workspace `is_public` flags become **non-authoritative for showcase** in V1 (deprecated for public presentation, kept for backward compatibility during migration).

---

## 2. Proposed database changes

**Not migrations — proposed schema only.**

### New table: `showcase_entries`

The **unit of public presentation**. One row = one item on the creator showcase.

```text
showcase_entries
├── id                    uuid PK
├── user_id               uuid FK → auth.users (denormalized for RLS)
├── slug                  text NOT NULL          -- unique per user; public URL segment
├── title                 text NOT NULL
├── summary               text NULL
├── showcase_type         text NOT NULL
│                         -- 'graphic_novel' | 'film_animation' | 'childrens_book'
│                         -- | 'novel' | 'artwork' | 'other'
├── publish_status        text NOT NULL DEFAULT 'draft'
│                         -- 'draft' | 'published'
├── is_featured           boolean NOT NULL DEFAULT false
├── featured_sort_order   integer NULL           -- order in Featured Work section
├── section_sort_order    integer NOT NULL DEFAULT 0  -- order within showcase_type section
├── cover_image_path      text NULL                -- resolved at publish; may copy storage path
├── cover_source_type     text NULL                -- 'story_image' | 'character_image' | 'upload'
├── cover_source_id       uuid NULL                -- pointer to source asset row
├── published_at          timestamptz NULL
├── created_at              timestamptz NOT NULL DEFAULT now()
├── updated_at              timestamptz NOT NULL DEFAULT now()

UNIQUE (user_id, slug)
INDEX (user_id, publish_status, showcase_type)
INDEX (user_id, is_featured, featured_sort_order) WHERE is_featured = true
```

### New table: `showcase_entry_sources`

Links a showcase entry to workspace content. **Pointers only — no duplicate blobs or text.**

```text
showcase_entry_sources
├── id                    uuid PK
├── showcase_entry_id     uuid FK → showcase_entries ON DELETE CASCADE
├── source_type           text NOT NULL
│                         -- 'story' | 'chapter' | 'character' | 'story_image' | 'character_image'
├── source_id             uuid NOT NULL
├── source_role           text NOT NULL DEFAULT 'primary'
│                         -- 'primary' | 'gallery' | 'chapter' | 'reference'
├── sort_order            integer NOT NULL DEFAULT 0
├── created_at            timestamptz NOT NULL DEFAULT now()

INDEX (showcase_entry_id)
INDEX (source_type, source_id)
```

One entry typically has one `primary` source (e.g. a story). Artwork collections may have multiple `gallery` sources.

### Optional Phase 1 extension: `showcase_entry_chapters`

If published novels include readable chapter content on the showcase reader without exposing world/story URLs:

```text
showcase_entry_chapters        -- denormalized snapshot OR explicit include list
├── showcase_entry_id
├── chapter_id                 -- FK → chapters (pointer)
├── sort_order
├── include_content            boolean DEFAULT true   -- creator toggles per chapter
```

Alternative: derive included chapters from `showcase_entry_sources` where `source_type = 'chapter'`. Prefer **sources table** over extra table in V1.

### Profile table — no required changes Phase 1

`profiles` retains: `username`, `display_name`, `bio`, `avatar_url`, `is_public`.

Optional later: `showcase_tagline`, `updated_at` — out of V1 scope.

### Workspace tables — no structural changes Phase 1

Existing tables unchanged for workspace:

- `worlds`, `stories`, `chapters`, `characters`, `story_images`, `character_images`

**Semantic change only:** `is_public` on worlds/characters **no longer drives showcase inclusion**. Document as deprecated for public presentation; remove from UI over time.

### RLS sketch (proposed)

| Table | Owner | Public (anon) |
|-------|-------|---------------|
| `showcase_entries` | Full CRUD where `user_id = auth.uid()` | SELECT where `publish_status = 'published'` AND profile `is_public` |
| `showcase_entry_sources` | CRUD via parent entry ownership | SELECT where parent entry is published |

### Storage

- Cover images: reuse `character-photos` bucket
- Path: `{user_id}/showcase/{entry_id}/cover.{ext}` OR reuse source asset path (pointer only, no copy if same path)
- On publish: if cover resolves from `story_images` / `character_images`, store path reference — **no duplicate upload required**

---

## 3. Publishing model

### States

```text
┌─────────┐     Publish      ┌───────────┐
│  draft  │ ───────────────►  │ published │
└─────────┘                  └───────────┘
     ▲                              │
     └──────── Unpublish ───────────┘
```

| State | Dashboard | Public showcase | Explore V2 (future) |
|-------|-----------|-------------------|---------------------|
| **draft** | Visible, editable | Hidden | Hidden |
| **published** | Visible, editable | Visible in section + featured if flagged | Eligible |

### What can be published? (Phase 1)

| Source object | Showcase entry type | Primary use |
|---------------|----------------------|-------------|
| **Story** | `graphic_novel`, `novel`, `film_animation`, `childrens_book`, `other` | Project presentation — cover, summary, optional chapter reader |
| **Story image(s)** | `artwork` | Mood boards, key scenes, covers as art collection |
| **Character image(s)** | `artwork` | Character sheets, concept art |
| **Character** (future V1.5) | `artwork` or dedicated type | Featured character study — not workspace character browser |

**Not publishable as standalone showcase entries in V1:**

| Object | Reason |
|--------|--------|
| **World** | Organizational container — not finished work |
| **Chapter** alone | Published **through** parent story entry (included chapters on reader) |
| **Workspace story URL** | Replaced by showcase entry slug |

### Publish workflow (creator)

```text
1. Creator builds story + assets in workspace (dashboard)
2. Creator opens "Publish to Showcase" on story (or artwork picker)
3. System creates showcase_entry (draft) with:
   - title, summary (default from story)
   - showcase_type (default from story.project_type)
   - cover (default from story.featured_image_id)
   - source pointer → story
4. Creator edits showcase presentation (optional overrides)
5. Creator clicks Publish → publish_status = 'published', published_at = now()
6. Entry appears in public showcase section + Explore (future)
```

### Unpublish

- Sets `publish_status = 'draft'`, clears `published_at`
- Removes from public showcase immediately (revalidate paths)
- Workspace story **unchanged** — memory layer intact

### Relationship to existing `is_public`

| Flag | V1 behavior |
|------|-------------|
| `profiles.is_public` | **Keep** — master gate for entire showcase |
| `worlds.is_public` | **Ignore for showcase** — workspace only |
| `characters.is_public` | **Ignore for showcase** — workspace only |
| Story (no is_public) | Visibility **only** via `showcase_entries` |

During migration: existing public world/story pages remain until cutover; new showcase is additive then replaces.

---

## 4. Featured content model

### Featured vs Published

| Flag | Meaning |
|------|---------|
| **Published** (`publish_status = 'published'`) | Work appears in its **type section** (Graphic Novels, Artwork, etc.) |
| **Featured** (`is_featured = true`) | **Also** appears in top **Featured Work** section |

Rules:

- Featured ⊂ Published — cannot feature a draft entry
- `featured_sort_order` controls order in Featured Work (lower = first)
- `section_sort_order` controls order within type section
- Recommended max featured: 3–6 items (UI guidance, not DB constraint)

### Featured Work section

```text
Featured Work                    ← is_featured = true, ordered by featured_sort_order
├── [cover] Graphic Novel Title
├── [cover] Animation Reel Title
└── [cover] Artwork Collection Title
```

Each card links to `/u/{username}/work/{slug}`.

### Section mapping (`showcase_type` → nav)

| `showcase_type` | Public nav section |
|-----------------|-------------------|
| `graphic_novel` | Graphic Novels |
| `film_animation` | Films / Animation |
| `childrens_book` | Children's Books |
| `novel` | (Grouped under Graphic Novels OR own "Novels" tab — product choice) |
| `artwork` | Artwork |
| `other` | Other (or merged into nearest section) |

**Nav structure (V1):**

```text
About | Featured Work | Graphic Novels | Films / Animation | Children's Books | Artwork
```

`About` = profile header (avatar, name, bio) — anchor on same page or top section.

No **Worlds**, **Stories**, **Chapters** in public navigation.

---

## 5. Public profile wireframes

### Showcase home — `/u/{username}`

```text
┌──────────────────────────────────────────────────────────────────┐
│ [CharID]                                          [Explore →]   │
├──────────────────────────────────────────────────────────────────┤
│  About                                                           │
│  ┌──────┐                                                        │
│  │Avatar│   Display Name                                         │
│  └──────┘   @username                                            │
│             Bio paragraph...                                     │
├──────────────────────────────────────────────────────────────────┤
│  [About] [Featured Work] [Graphic Novels] [Films] [Children's]   │
│  [Artwork]                                        ← sticky tabs  │
├──────────────────────────────────────────────────────────────────┤
│  ▼ Featured Work                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   cover     │  │   cover     │  │   cover     │              │
│  │   Title     │  │   Title     │  │   Title     │              │
│  │   GN · 2026 │  │   Film      │  │   Artwork   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├──────────────────────────────────────────────────────────────────┤
│  ▼ Graphic Novels                                                │
│  ┌──────────┐  ┌──────────┐                                     │
│  │ cover    │  │ cover    │   ← published, type=graphic_novel   │
│  │ Title    │  │ Title    │     not featured duplicates OK      │
│  └──────────┘  └──────────┘                                     │
├──────────────────────────────────────────────────────────────────┤
│  ▼ Films / Animation                                             │
│  (empty state: hidden section if no published entries)           │
├──────────────────────────────────────────────────────────────────┤
│  ▼ Children's Books                                              │
│  ┌──────────┐                                                     │
│  │ cover    │                                                     │
│  └──────────┘                                                     │
├──────────────────────────────────────────────────────────────────┤
│  ▼ Artwork                                                       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                                    │
│  │    │ │    │ │    │ │    │  ← grid / masonry                 │
│  └────┘ └────┘ └────┘ └────┘                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Published work detail — `/u/{username}/work/{slug}`

```text
┌──────────────────────────────────────────────────────────────────┐
│  ← Back to @username's showcase                                  │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                      Hero cover image                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│  Graphic Novel · Published Jun 2026                              │
│  Title of Work                                                   │
│  Summary paragraph...                                            │
│                                                                  │
│  [Read chapters ▼]              ← if primary source is story     │
│  ┌─ Chapter list (published includes only) ─────────────────┐  │
│  │  1. Prologue                                                │  │
│  │  2. The First Map                                           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Gallery (if artwork entry or story assets included)             │
│  [img] [img] [img]                                               │
└──────────────────────────────────────────────────────────────────┘
```

No world name. No workspace breadcrumb. Creator attribution only.

### Dashboard — Publish to Showcase

```text
┌──────────────────────────────────────────────────────────────────┐
│  Story: The Windbinder's Oath                                    │
│  [Edit in workspace]  [Publish to Showcase →]                    │
├──────────────────────────────────────────────────────────────────┤
│  Showcase entry (draft)                                          │
│  Title: [The Windbinder's Oath          ]                          │
│  Type:  [Graphic Novel ▼]                                        │
│  Summary: [...........................]                          │
│  Cover:   [story featured image ▼]  [preview]                    │
│  Include chapters: ☑ Ch1  ☑ Ch2  ☐ Ch3 (draft)                   │
│  ☑ Feature on profile (max 6)                                    │
│                                                                  │
│  [Save draft]  [Publish]                                         │
└──────────────────────────────────────────────────────────────────┘
```

### Dashboard — Portfolio / Showcase manager

```text
┌────────────────────────────┬─────────────────────────────────────┐
│  PROFILE HEADER            │  SHOWCASE PREVIEW                   │
│  (username, avatar, bio)   │  (live mirror of public page)       │
├────────────────────────────┤                                     │
│  PUBLISHED WORK            │                                     │
│  ┌ draft ────────────────┐ │                                     │
│  │ My GN · draft · [Edit] │ │                                     │
│  └────────────────────────┘ │                                     │
│  ┌ published ────────────┐ │                                     │
│  │ ✦ Featured · GN       │ │                                     │
│  │ Published · Artwork   │ │                                     │
│  └────────────────────────┘ │                                     │
│  [+ Publish from workspace]│                                     │
└────────────────────────────┴─────────────────────────────────────┘
```

---

## 6. Migration strategy

### Problem

Today public content flows through:

```text
profiles.is_public → worlds.is_public → stories (implicit) → chapters
                  → characters.is_public
```

V1 introduces `showcase_entries` as the **new authoritative public layer**. Migration must not destroy workspace data or break existing public links abruptly.

### Phase A — Additive (recommended first deploy)

| Step | Action |
|------|--------|
| A1 | Add `showcase_entries` + `showcase_entry_sources` tables + RLS |
| A2 | Add showcase API + dashboard publish UI |
| A3 | Build new `/u/{username}` from showcase entries **alongside** existing sections |
| A4 | New `/u/{username}/work/{slug}` reader route |
| A5 | Existing world/story/character public routes **remain** (legacy) |

Creators opt in by publishing entries. Unpublished workspace content stays off showcase.

### Phase B — Data backfill (optional, creator-assisted)

| Step | Action |
|------|--------|
| B1 | Offer "Migrate to showcase" prompt for creators with existing public worlds/stories |
| B2 | For each public story: create `showcase_entry` (published) with source → story, type from `project_type` |
| B3 | Do **not** auto-migrate silently — creator confirms |

### Phase C — Cutover

| Step | Action |
|------|--------|
| C1 | Replace `/u/{username}` entirely with showcase layout (remove world/character grid) |
| C2 | Legacy URLs redirect: `/u/{user}/worlds/{slug}/stories/{storySlug}` → `/u/{user}/work/{entrySlug}` if mapped |
| C3 | Remove `is_public` toggles from world/character UI (or label "deprecated — use Publish to Showcase") |
| C4 | Update storage RLS public read policies to gate on showcase publication (future tightening) |

### Phase D — Explore V2 (after showcase stable)

Explore feeds read **`showcase_entries`** where `publish_status = 'published'`, not raw worlds/stories.

```text
/explore/projects/graphic-novels   → showcase_entries WHERE type = graphic_novel
/explore/artwork                   → showcase_entries WHERE type = artwork
/explore/creators                  → profiles with ≥1 published entry
```

### Rollback plan

- Showcase tables are additive — rollback = hide new UI, revert `/u/{username}` to legacy assembler
- Workspace untouched — no data loss

### Migration SQL order (when implemented)

```text
1. 2025XXXXXX_showcase_entries.sql       — tables, indexes, FKs
2. 2025XXXXXX_showcase_entry_sources.sql — if not combined
3. 2025XXXXXX_showcase_rls.sql           — policies
4. fix-showcase-api.sql                  — PostgREST grants
5. (optional) backfill script            — one-time, creator-confirmed
```

---

## 7. Explore V2 alignment (future — not Phase 1)

| Explore shows | Does NOT show |
|---------------|---------------|
| Featured Work (cross-creator) | Worlds |
| Graphic Novels | Raw story workspace links |
| Films / Animation | Chapter indexes |
| Children's Books | Dashboard structure |
| Artwork | |
| Creators (by showcase completeness) | |

Explore cards link to `/u/{username}/work/{slug}` — never to `/worlds/.../stories/...`.

---

## 8. Phase 1 implementation order (when approved)

| Step | Deliverable | Depends on |
|------|-------------|------------|
| 1 | `showcase_entries` + sources schema + RLS | — |
| 2 | Showcase types + server actions (CRUD, publish, unpublish, feature) | Step 1 |
| 3 | "Publish to Showcase" from story detail in dashboard | Step 2 |
| 4 | Showcase manager on `/dashboard/portfolio` | Step 2 |
| 5 | New `/u/{username}` page (header + featured + sections) | Step 2 |
| 6 | `/u/{username}/work/{slug}` reader | Step 2 |
| 7 | Legacy public routes: de-emphasize in nav, keep reachable | Step 5 |
| 8 | Portfolio preview mirrors showcase | Step 5 |

**Explicitly deferred from Phase 1:** likes, follows, comments, notifications, Explore V2, free download visibility, published_works file uploads.

---

## 9. Answers to design review questions

### 1. What can be published?

| Publishable | Via |
|-------------|-----|
| Story as project | `showcase_entry` + `source_type = story` |
| Artwork collection | `showcase_entry` + multiple `source_type = story_image \| character_image` |
| Selected chapters | `source_type = chapter` rows on story-backed entry |
| Individual images (future) | Artwork entry with single gallery source |

**Not publishable:** worlds, raw workspace navigation, unpublished drafts.

### 2. What can be featured?

Any **published** `showcase_entry` with `is_featured = true`, ordered by `featured_sort_order`. Appears in **Featured Work** section only; also remains in its type section unless UI deduplicates display (recommended: show once in Featured, hide duplicate in section OR show in both — product choice; recommend **both** for prominence).

### 3. How does published work relate to stories, chapters, assets?

```text
Story (workspace) ──pointer──► showcase_entry (presentation)
                                  ├── title, summary, cover (overridable)
                                  ├── showcase_type (from project_type default)
                                  └── showcase_entry_sources
                                        ├── story (primary)
                                        ├── chapters (included subset)
                                        └── story_images (optional gallery)

story_images (workspace) ──pointer──► artwork showcase_entry
character_images (workspace) ──pointer──► artwork showcase_entry
```

**No duplicate storage.** Publishing creates presentation metadata + pointers. Unpublishing hides the entry; workspace memory unchanged.

---

## 10. Summary

| Question | Answer |
|----------|--------|
| Workspace vs Showcase | Workspace = build privately; Showcase = explicitly published presentation |
| Privacy | Everything private by default; publishing is intentional |
| Recommended approach | **Option B-lite** — `showcase_entries` with inline source pointer (see §11) |
| Draft vs Published | `publish_status` on showcase entry — not on workspace rows |
| Featured | `is_featured` on published entries → Featured Work section |
| Public nav | About, Featured Work, type sections — **not** worlds/stories/chapters |
| Phase 1 social | None |
| Payments | None |
| Existing data | Pointers to stories/assets; optional creator-confirmed backfill |
| Next step after approval | Migration `showcase_entries` + publish UI + new `/u/{username}` |

---

## 11. Architecture review — Option A vs Option B

**Review only — no implementation.**

### Option A — Story-backed Showcase V1

Add publishing fields directly to `stories`:

```text
stories (additions)
├── is_published          boolean NOT NULL DEFAULT false
├── is_featured           boolean NOT NULL DEFAULT false
├── showcase_summary      text NULL          -- optional override of summary
├── showcase_cover        text NULL          -- optional override of featured_image_id path
├── featured_sort_order   integer NULL
└── section_sort_order    integer NOT NULL DEFAULT 0
```

Public showcase queries `stories WHERE user_id = ? AND is_published = true`, grouped by existing `project_type`. Featured section queries `is_featured = true`.

Artwork section would require **additional** publish fields on `story_images` / `character_images` (not specified in Option A but required by V1 nav).

### Option B — Full Showcase architecture

As described in §2: `showcase_entries` + `showcase_entry_sources` junction table. Presentation layer fully decoupled from workspace graph.

### Option B-lite (recommended variant)

Single `showcase_entries` table with an **inline source pointer** — no junction table in V1:

```text
showcase_entries
├── ... (all presentation fields from §2)
├── source_type           text NOT NULL   -- 'story' | 'story_image' | 'character_image'
└── source_id             uuid NOT NULL
```

Add `showcase_entry_sources` later when multi-source artwork collections or per-chapter include lists are needed.

---

### 11.1 Pros and cons

| | **Option A** — fields on stories | **Option B** — showcase_entries | **Option B-lite** |
|---|----------------------------------|-----------------------------------|-------------------|
| **Pros** | Fewest new tables; reuses `project_type`, `slug`, `summary`, `featured_image_id`; familiar story-centric mental model; fastest path for story-only showcase | Clean separation of workspace vs presentation; one unified model for all content types; user-scoped slugs; cross-type featured ordering; artwork + stories in one query; aligns with Explore V2 | Same separation benefits as B; **one table** instead of two; simpler queries than full junction; easy upgrade path to full B |
| **Cons** | Conflates workspace entity with public presentation; story slug is **world-scoped** `(world_id, slug)` — conflicts with flat `/u/{user}/work/{slug}` URLs; Artwork requires parallel publish fields on image tables; Featured Work ordering requires UNION across tables; unpublishing mutates workspace rows; future media types don't fit on `stories` | Extra table + source resolution layer; more actions and UI than Option A; junction table may be overkill for V1 | Slightly more schema than A; one extra table and CRUD layer; 1:1 story→entry requires publish workflow (not just a toggle) |

---

### 11.2 Development complexity

| Area | Option A | Option B | Option B-lite |
|------|----------|----------|---------------|
| **Schema** | Low — `ALTER stories` (+ likely `story_images`) | Medium — 2 new tables | Low-Medium — 1 new table |
| **Server actions** | Low — extend `stories.ts` (+ image actions) | Medium-High — new showcase module | Medium — new showcase module, simpler than full B |
| **Publish UI** | Low — toggle on story detail | Medium — publish flow creates/edits entry | Medium — same as B |
| **Public profile** | Medium — rewrite assembler; slug/URL fix needed | Medium — new assembler from entries | Medium — same as B |
| **Public reader** | Medium — must hide world context in routes | Medium — `/u/{user}/work/{slug}` | Medium — same as B |
| **RLS changes** | High — must **replace** world-inheritance chain across stories, chapters, story_images, characters | Medium — additive policies on new table; legacy policies deprecated gradually | Medium — same as B |
| **Estimated files touched** | ~10–14 | ~16–22 | ~12–16 |

Option A appears simpler on schema but **RLS rework is the hidden cost** — today stories inherit visibility from `worlds.is_public`. Enforcing "private by default" requires changing defaults and policies on worlds, characters, stories, chapters, and story_images simultaneously. Option B-lite adds one table but leaves workspace tables structurally unchanged.

---

### 11.3 Migration complexity

| | Option A | Option B / B-lite |
|---|----------|-------------------|
| **Existing public content** | Must map `worlds.is_public = true` → `stories.is_published = true` per story; ambiguous for creators who made worlds public but didn't intend every story published | Optional creator-confirmed backfill: public stories → showcase entries; no auto-migration |
| **Default flip** | `worlds.is_public` and `characters.is_public` must default to `false` — **breaking** for existing rows | Workspace defaults flip independently; showcase starts empty |
| **Legacy URLs** | `/u/{user}/worlds/{slug}/stories/{storySlug}` remain story+world coupled | New flat URLs; legacy redirect via entry slug map |
| **Rollback** | Harder — publish state mixed into workspace rows | Easy — drop/hide showcase table, revert public page |
| **Data integrity** | Unpublish = flip flag on story; workspace and showcase metadata share one row | Unpublish = flip entry status; workspace untouched |

Option B-lite is **safer for migration** because the publication layer is additive. Option A conflates migration with workspace schema changes.

---

### 11.4 Future flexibility

| Need | Option A | Option B-lite |
|------|----------|---------------|
| Artwork collections (multi-image) | Awkward — needs new table or array column eventually | Add `showcase_entry_sources` junction when needed |
| Different showcase title vs workspace title | `showcase_summary` + override fields on stories | Native on entry row |
| Publish chapter subsets | No clean model | Add chapter rows to sources table |
| Film reels, AI artifacts, non-story media | Does not fit on `stories` | New `source_type` values on same entry table |
| Explore V2 cross-creator feed | UNION query across stories + images | Single `showcase_entries` query |
| Featured ordering across types | Separate sort columns per table | Single `featured_sort_order` column |
| Multiple showcase presentations of one story | Impossible (1:1 with story row) | Possible (multiple entries, different slugs/types) |

Option B-lite matches the approved principle that workspace and showcase are **different things**. Option A treats the story as both.

---

### 11.5 Recommendation

**Recommend Option B-lite** — a single `showcase_entries` table with inline `source_type` + `source_id`.

This is the smallest architecture that fully achieves V1 goals without overengineering:

| V1 goal | Option A | Option B-lite |
|---------|----------|---------------|
| Private workspace | ⚠️ Requires RLS overhaul + fields on workspace rows | ✅ Workspace tables unchanged; showcase is separate |
| Public creator showcase | ✅ For stories only | ✅ Unified showcase assembler |
| Published work | ✅ Story toggle | ✅ `publish_status` on entry |
| Featured work | ⚠️ Cross-type ordering is awkward | ✅ Single featured query |
| Artwork section | ❌ Needs parallel image-table fields | ✅ `source_type = story_image \| character_image` |
| Showcase ≠ file system | ⚠️ Story remains world-child in data model | ✅ Flat public URLs, no world in nav |

**Defer to Phase 1.5:** `showcase_entry_sources` junction table (multi-image collections, per-chapter include lists).

**Do not implement Option A** unless V1 scope is explicitly reduced to story projects only **and** Artwork + Featured cross-type ordering are deferred. Even then, Option A creates migration debt when artwork or Explore V2 arrives.

### Revised schema recommendation (when approved)

Implement **§2 `showcase_entries`** with these V1 simplifications:

- Include `source_type` + `source_id` directly on the entry row
- **Skip** `showcase_entry_sources` in first migration
- **Skip** `showcase_entry_chapters` — publish all chapters of a story-backed entry in V1; add include toggles in Phase 1.5

---

*Document status: Revised for architecture review — no code, migrations, or implementation implied.*
