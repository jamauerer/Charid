# Finished Work Architecture

**Status:** Design (planning — approve before implementation)  
**Date:** 2026-06-14  
**Version:** 1.0  
**Authority:** [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) · [CHARID_NORTH_STAR_V1.md](./CHARID_NORTH_STAR_V1.md) · [PUBLISHING_MVP_ARCHITECTURE.md](./PUBLISHING_MVP_ARCHITECTURE.md)  
**Related:** [SCENE_ARCHITECTURE_V2.md](./SCENE_ARCHITECTURE_V2.md) · [CREATIVE_FORMAT_V2.md](./CREATIVE_FORMAT_V2.md) · [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md)

---

## Purpose

Define **Finished Work** — the bridge between creation (workspace) and sharing (publish → reader → portfolio).

Creators work in stories, scenes, and chapters. Readers consume **finished work editions**. The Finished Work entity makes that boundary explicit.

**Goal:** One clear object answers: *“What did I finish, and what is live for readers?”*

**Decision test:** Does this help someone finish and share a story inside CharID?

---

## Problem today

| Workspace object | Role | Reader-facing? |
|------------------|------|----------------|
| Project | Finished-work container (organizational) | No |
| Story | Primary creative workspace | Partially — public story page is a metadata hub |
| Chapter | Prose block | Yes — if portfolio/world public (no publish gate) |
| Scene | Narrative beat | No public reader yet |
| Comic pages | Not implemented | No |

There is **no dedicated artifact** representing “this story is done and shared.” Publish is conflated with `is_public` flags on worlds, characters, and portfolio profile.

Finished Work separates **work in progress** from **work shared with the world**.

---

## Should there be a dedicated entity?

**Yes.** A first-class **`finished_works`** (or `publish_artifacts`) table.

| Approach | Verdict |
|----------|---------|
| **Dedicated entity** | ✅ Recommended — clear publish state, manifest, re-publish, featured portfolio |
| **Flag on `stories` only** | ❌ Insufficient — one story may have multiple editions (scene reading vs chapter prose vs future comic) |
| **Portfolio JSON only** | ❌ No queryable publish history or RLS |

---

## Conceptual model

```
Project                    ← container (“California Coast Surf Stories”)
└── Story                  ← workspace (draft canon lives here)
      ├── Scenes           ← beats (draft)
      ├── Chapters         ← prose (draft)
      └── Finished Work(s) ← publishable edition(s) pointing at subsets
            └── Published snapshot / manifest → Reader
```

**Finished Work is not a duplicate story.** It is a **published view** over story content with its own lifecycle.

---

## Finished Work types (MVP → future)

| `work_type` | Description | MVP |
|-------------|-------------|-----|
| `scene_reading` | Ordered scene beats — title, summary, cast, location | **Yes** |
| `chapter_prose` | Published chapter subset — long-form text reader | **Yes** |
| `story_preview` | Title + summary + cover only (teaser) | Optional |
| `comic` | Pages + panels from scenes | Phase B |
| `picture_book` | Fixed spread count, image-forward | Phase B+ |
| `screenplay` | Scene blocks with INT/EXT, dialogue | Phase S4+ export |

One story may have **multiple** finished works of different types over time (e.g. scene outline now, comic later).

---

## Status lifecycle

```
                    ┌──────────┐
         create ──► │  draft   │
                    └────┬─────┘
                         │ Publish (explicit)
                         ▼
                    ┌──────────┐
                    │ published│──────► Reader + Portfolio featured
                    └────┬─────┘
                         │ Unpublish (explicit)
                         ▼
                    ┌─────────────┐
                    │ unpublished │  (hidden from readers; workspace intact)
                    └─────────────┘
```

| Status | Workspace | Reader | Portfolio featured |
|--------|-----------|--------|-------------------|
| `draft` | Editable | Hidden | No |
| `published` | Editable (does not auto-sync) | Visible per manifest | Yes (if featured) |
| `unpublished` | Editable | Hidden | No |

**Re-publish:** Creator edits workspace → opens Finished Work → “Update live edition” → increments `published_revision`, refreshes manifest snapshot (or live manifest per [PUBLISHING_MVP_ARCHITECTURE.md](./PUBLISHING_MVP_ARCHITECTURE.md) policy).

---

## Relationships

### To Project

| Relation | Cardinality | Notes |
|----------|-------------|-------|
| `finished_works.project_id` | N:1 optional | Denormalized from story for portfolio grouping |
| Project page | Shows published finished works | Not draft workspace depth |

Projects **organize**; they do not replace story workspace or finished work.

### To Story

| Relation | Cardinality | Notes |
|----------|-------------|-------|
| `finished_works.story_id` | N:1 required | Every finished work belongs to exactly one story |
| Story workspace | Lists finished works + “Create edition” | Primary creator surface |

### To Scenes

| Relation | Notes |
|----------|-------|
| **Manifest reference** | `manifest.scene_ids[]` — ordered list included in `scene_reading` edition |
| Scenes table | Unchanged — draft canon; not deleted on unpublish |
| New scene after publish | Not in reader until re-publish |

### To Chapters

| Relation | Notes |
|----------|-------|
| **Manifest reference** | `manifest.chapter_ids[]` for `chapter_prose` edition |
| Per-chapter publish | MVP may allow subset (serial release) |

### To Portfolio

| Relation | Notes |
|----------|-------|
| Featured slot | `profiles.featured_finished_work_id` or ordered join table |
| Portfolio grid | Queries `finished_works WHERE status = published` |
| Profile public gate | Portfolio must be public for reader URLs to resolve |

---

## Data model sketch

```sql
create table public.finished_works (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  story_id uuid not null references public.stories(id) on delete cascade,

  work_type text not null,
  -- scene_reading | chapter_prose | comic | picture_book | screenplay | story_preview

  title text not null,              -- display title (defaults to story.title)
  slug text not null,               -- reader URL segment (defaults to story.slug)
  subtitle text,
  cover_image_id uuid,              -- optional story/world/project image ref

  status text not null default 'draft',
  -- draft | published | unpublished

  manifest jsonb not null default '{}',
  -- { "scene_ids": ["..."], "chapter_ids": ["..."], "format_options": {} }

  published_at timestamptz,
  published_revision integer not null default 0,
  featured boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, slug)            -- reader slug unique per creator
);

create index finished_works_story_idx on public.finished_works (story_id);
create index finished_works_status_idx on public.finished_works (status) where status = 'published';
```

### Manifest example (`scene_reading`)

```json
{
  "scene_ids": ["uuid-1", "uuid-2", "uuid-3"],
  "include_cast": true,
  "include_locations": true,
  "reader_theme": "default"
}
```

### Optional snapshot table (Phase 2)

For immutable reader experience on re-publish:

```sql
finished_work_snapshots (
  finished_work_id,
  revision,
  snapshot jsonb,  -- denormalized scene/chapter text at publish time
  created_at
)
```

MVP may use **live manifest** (read scenes at render time with publish gate) for simplicity; snapshots add safety for edited draft vs live drift.

---

## Creator UX surfaces

### Story workspace — Finished Work section

Placement: after Scenes, before Advanced planning (aligns with finish path).

| Element | Purpose |
|---------|---------|
| **Editions list** | Draft / Live badges |
| **Create reading edition** | Scene or chapter type |
| **Publish** | draft → published |
| **Preview** | Reader template |
| **Copy link** | When published |

### Project workspace

| Element | Purpose |
|---------|---------|
| **Published works** | Cards linking to reader URLs |
| **In progress** | Stories without published edition (gentle nudge) |

### Portfolio editor

| Element | Purpose |
|---------|---------|
| **Feature this work** | Pin published finished work |
| **Reorder featured** | Drag ordering (later) |

---

## Relationship to AI (Scene S2+)

| Rule | Meaning |
|------|---------|
| AI proposals ≠ finished work | Staging batches never appear in manifest |
| Approve scene → workspace | Creator may later add scene to published edition via re-publish |
| No “AI published your story” | Publish remains explicit human action |

---

## Relationship to comic (future)

```
Scene (canon)
  → Panel (future)
  → Page (future)
  → Finished Work (work_type = comic)
  → Publish
  → Comic reader
```

Same Finished Work entity; different `work_type` and manifest shape (`page_ids`, layout metadata).

---

## Migration from today

| Current | Target |
|---------|--------|
| Public story page (metadata hub) | Redirect or slim “About this story” linked from reader |
| Chapter public URLs | Gated by `chapter_prose` finished work manifest |
| `is_public` on world/character | Supporting visibility — not substitute for story publish |
| `story.status` (Idea, Planning, …) | Workspace progress — orthogonal to `finished_works.status` |

No big-bang migration: existing public URLs redirect; creators opt into Finished Work publish flow.

---

## Explicit deferrals

- Comic / picture book / screenplay finished work types (schema ready, UI later)  
- Export (PDF, CBZ) — attach to finished_work id  
- Marketplace listing — links to finished_work  
- Version diff UI between revisions  
- Collaborative co-author permissions  

---

## Success criteria

| Test | Pass |
|------|------|
| Creator sees draft vs published clearly | Two statuses, two URLs behaviors |
| One story, scene edition + chapter edition | Two `finished_works` rows |
| Unpublish | Reader 404; workspace untouched |
| Portfolio features published edition | Not raw story workspace |
| Child benchmark | “I finished my story” = published scene reading edition |

---

## Document index

| Doc | Role |
|-----|------|
| [PUBLISHING_MVP_ARCHITECTURE.md](./PUBLISHING_MVP_ARCHITECTURE.md) | Reader, URLs, publish flow |
| [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) | Why finish-first |
| [SCENE_ARCHITECTURE_V2.md](./SCENE_ARCHITECTURE_V2.md) | Scenes as source content |
| [SECURITY_AUDIT_V1.md](./SECURITY_AUDIT_V1.md) | Public read RLS |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Initial Finished Work entity, types, statuses, relationships |
