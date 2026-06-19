# Publishing MVP Architecture

**Status:** Design (planning — approve before implementation)  
**Date:** 2026-06-14  
**Version:** 1.0  
**Authority:** [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) · [CHARID_NORTH_STAR_V1.md](./CHARID_NORTH_STAR_V1.md) · [SCENE_ARCHITECTURE_V2.md](./SCENE_ARCHITECTURE_V2.md)  
**Related:** [FINISHED_WORK_ARCHITECTURE.md](./FINISHED_WORK_ARCHITECTURE.md) · [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md)

---

## Purpose

Define the **minimum publishing system** that lets creators share narrative work **before comic generation exists**.

**Goal:** A creator finishes a story-shaped artifact (prose and/or scene beats), publishes it, and a reader can experience it — without leaving CharID or exporting to PDF.

**Decision test:** Does this move creators closer to finishing and sharing creative work?

---

## Complete path (target)

```
Idea
  → Story          (workspace — canon)
  → Chapter        (optional prose structure)
  → Scene          (optional beat structure)
  → Finished Work  (publishable artifact — see FINISHED_WORK_ARCHITECTURE.md)
  → Publish        (explicit creator action)
  → Reader         (public URL)
  → Portfolio      (creator’s public home)
```

Publishing MVP covers the **Publish → Reader → Portfolio** segment for **text-native** finished work. Comic pages are a later Finished Work type.

---

## Current state (honest baseline)

| Capability | Today | Gap |
|------------|-------|-----|
| Portfolio profile public | `profiles.is_public` | Not the same as “published a story” |
| Entity visibility | `is_public` on characters, worlds | Stories lack per-story publish control |
| Public story URL | `/u/[username]/worlds/[worldSlug]/stories/[storySlug]` | Shows summary, chapters list, character cards — **no scene reader** |
| Public chapter URL | `.../chapters/[chapterId]` | Prose reader works when chain is public |
| Draft vs live | **No** story-level publish manifest | All chapters visible if world + portfolio public |
| Featured work | Portfolio shows entity cards | No “lead with finished story” |
| Comic reader | **None** | Deferred |

Publishing MVP must introduce **explicit publish intent**, not only `is_public` flags scattered across entities.

---

## What can be published first?

### Options evaluated

| Option | Reader experience | Pros | Cons |
|--------|-------------------|------|------|
| **A. Story only** | Title + summary + cast cards | Simple | Not “finished work” — feels like a pitch |
| **B. Story + Chapters** | Prose chapter reader (exists partially) | Works for novelists | Ignores scene-first architecture; chapters may be empty |
| **C. Story + Scenes** | Ordered scene list reader (“what happens” beats) | Aligns with Scene S1/S2; child-friendly | No long-form prose flow |
| **D. Story + Chapters + Scenes** | Hybrid: chapters contain prose; scenes as beat outline or sidebar | Richest | More UI complexity |

### Recommendation: **C primary, B supported, D as format flag**

**MVP default publish unit:** **Story reading edition** built from **published scenes** (ordered beats with cast + location).

**Secondary supported unit:** **Chapter prose edition** for stories that use chapters (reuse existing public chapter reader).

Rationale:

- Scenes are the **primary storytelling object** ([SCENE_ARCHITECTURE_V2.md](./SCENE_ARCHITECTURE_V2.md))  
- Scene S1/S2 make scenes the natural “I have something to share” unit  
- Chapter prose reader already exists — enable **per-chapter publish** without blocking scene-first creators  
- Comic/picture book types defer to Finished Work Phase B  

---

## Draft vs published

### Definitions

| State | Creator sees | Reader sees |
|-------|--------------|-------------|
| **Draft** | Full workspace — all scenes, chapters, bibles, staging proposals | Nothing (unless preview) |
| **Published** | Workspace + “Live” badge + public URL | Only **published snapshot** or **published subset** |

### MVP publish model

Introduce publish state at the **Finished Work** layer (see [FINISHED_WORK_ARCHITECTURE.md](./FINISHED_WORK_ARCHITECTURE.md)):

| Field / concept | Meaning |
|-----------------|--------|
| `finished_works.status` | `draft` · `published` · `unpublished` (archived) |
| `published_at` | Timestamp of go-live |
| `published_revision` | Monotonic int — bump on re-publish |
| **Published subset** | Which scenes/chapters are included in this edition |

**Rules:**

- Workspace edits after publish do **not** auto-update the reader view until creator **Re-publish** or **Update live edition** (explicit)  
- AI staging suggestions never appear on reader views  
- Creator **Preview** uses reader template with `?preview=1` (owner-only) — pattern exists on portfolio today  

### What stays private in MVP

- Story bible advanced fields, notes, metrics  
- Unpublished scenes/chapters  
- Character/world bibles, reference graphs, slot assignments  
- Moderation-flagged content (policy TBD in Security Audit)  
- `creative_proposal_batches` staging  

---

## Reader experience (MVP)

### Story + Scenes edition

**URL:** `/u/[username]/read/[storySlug]` (recommended — story-centric; see URL section)

**Layout:**

1. Cover / featured story image (if set)  
2. Story title + one-line summary  
3. **Reading mode:** vertical scroll of scene cards  
   - Scene title  
   - What happens (summary)  
   - Character names (not bible depth)  
   - Location name  
4. Optional: “About the creator” footer → portfolio  

**Not in MVP reader:** comments, likes, subscriptions, AI chat, download.

### Story + Chapters edition

**URL:** existing chapter routes, gated by publish manifest

**Layout:** Existing public chapter page — title + prose body. Chapter list on story hub shows **published chapters only**.

### Format selection

Story `project_type` hints default edition:

| `project_type` | Default edition |
|----------------|-----------------|
| `novel`, `childrens_book` | Chapters primary; scenes optional “Story beats” appendix |
| `graphic_novel`, `film_animation` | Scenes primary (comic panels later) |
| `other` | Creator chooses at publish time |

---

## Creator publish flow (MVP)

```
Story workspace
  └── "Share this story" (or "Publish" under Finished Work section)
        ↓
      Choose edition type: Scene reading · Chapter prose · Both
        ↓
      Select items to include (checkboxes; default all complete)
        ↓
      Preview reader (?preview=1)
        ↓
      Confirm: "Publish to portfolio"
        ↓
      finished_works row → status published
        ↓
      Celebration + copy link
```

**One primary CTA** on story page — not buried in portfolio settings.

Portfolio profile public (`profiles.is_public`) remains a **separate** gate: unpublished portfolio = no public URLs even if story publish attempted (show “Publish portfolio first”).

---

## URL structure

### Recommended MVP routes

| Route | Purpose |
|-------|---------|
| `/u/[username]` | Portfolio home — featured finished works |
| `/u/[username]/read/[storySlug]` | **Primary reader** — scene edition |
| `/u/[username]/read/[storySlug]/chapters/[chapterSlug]` | Chapter prose (published only) |
| `/u/[username]/worlds/[worldSlug]` | World setting page (optional context) |

### Legacy / transition

Keep existing world-nested URLs as **redirects** during migration:

- `/u/[username]/worlds/[worldSlug]/stories/[storySlug]` → `/u/[username]/read/[storySlug]`  

Avoid breaking shared links.

### Slugs

- Story slug unique per creator (not globally)  
- Chapter slug unique per story  
- Scene slug internal; reader uses sort order (scene slug in URL optional Phase 2)  

---

## Portfolio connection

### Portfolio home (`/u/[username]`)

| Section | MVP content |
|---------|-------------|
| **Hero** | Avatar, display name, bio |
| **Featured work** | 1–3 published Finished Works (cover, title, type badge, Read link) |
| **More stories** | Grid of published reading editions |
| **Characters / Worlds** | Secondary — supporting context, not the lead |

### Activation funnel

```
First publish of Finished Work
  → "Your story is live!" modal
  → Copy reader URL
  → Optional: "Polish portfolio" (bio, avatar) — skippable
```

Portfolio publish and story publish are **linked but distinct**:

1. Publish story (Finished Work)  
2. Ensure portfolio is public (or prompt once)  

---

## Data model sketch (MVP — design only)

```sql
-- See FINISHED_WORK_ARCHITECTURE.md for full entity
finished_works (
  id, user_id, project_id, story_id,
  work_type,           -- 'scene_reading' | 'chapter_prose' | ...
  status,              -- 'draft' | 'published' | 'unpublished'
  published_at,
  published_revision,
  reader_slug,         -- defaults to story.slug
  manifest jsonb       -- { scene_ids: [], chapter_ids: [], ... }
)
```

Public reader queries **finished_works** + manifest — not raw workspace tables.

RLS: public `SELECT` only when `status = 'published'` and parent portfolio public.

---

## Explicit deferrals (post-MVP)

| Feature | Defer until |
|---------|-------------|
| Comic page reader | Phase B — Comic architecture |
| PDF / CBZ export | After reader stable |
| Episodic “new chapter live” notifications | After chapter publish manifest |
| SEO / OG image generation | After reader stable |
| Explore / discovery feed | Phase D |
| Marketplace, POD, billing | After MVP + Security Audit |
| AI-generated reader content | Never without approve |

---

## Success criteria (MVP)

| Test | Pass |
|------|------|
| Creator publishes **How I Surf** with 3+ scenes | Reader URL shows ordered beats |
| Unpublished scene | Not visible on reader |
| Edit scene after publish | Reader unchanged until re-publish |
| Portfolio private | Reader 404 / not found |
| Child path | “Share my story” → copy link → readable on phone |

---

## Dependencies

| Prerequisite | Why |
|--------------|-----|
| Scene S1 (+ S2 design approved) | Publishable content unit |
| [FINISHED_WORK_ARCHITECTURE.md](./FINISHED_WORK_ARCHITECTURE.md) | Publish artifact entity |
| [SECURITY_AUDIT_V1.md](./SECURITY_AUDIT_V1.md) | Public read paths, RLS, preview auth |

---

## Document index

| Doc | Role |
|-----|------|
| [FINISHED_WORK_ARCHITECTURE.md](./FINISHED_WORK_ARCHITECTURE.md) | Finished Work entity |
| [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md) | Finish-first priority |
| [SCENE_ARCHITECTURE_V2.md](./SCENE_ARCHITECTURE_V2.md) | Scene as narrative unit |
| [IMPLEMENTATION_PHASES_V3.md](./IMPLEMENTATION_PHASES_V3.md) | Phase C publishing |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Initial Publishing MVP — scene-first reader, draft/publish, URLs, portfolio |
