# CharID Reference Assets Vision

Product architecture document — **not an implementation spec**.

CharID's long-term value is **creative consistency and memory**. Reference assets are the visual layer that makes consistency possible — for creators today and for AI assistance tomorrow.

See also:
- [CHARID_CORE_PRINCIPLE.md](./CHARID_CORE_PRINCIPLE.md)
- [PROJECT_TYPES_VISION.md](./PROJECT_TYPES_VISION.md)

**AI assists. Creators create. CharID remembers.**

---

## Purpose

Reference assets are **canonical visual memory** attached to creative objects. They are not decorative uploads — they exist so that:

- Characters look the same across stories, chapters, panels, and generated images
- Worlds feel coherent across locations and scenes
- Stories maintain visual tone and key scene continuity
- Future AI tools have structured, permission-aware context to draw from

This document defines how reference assets should work. **No migrations or code are implied.**

---

## Current State (Audit Summary)

| Object | Image support today | Maturity |
|--------|---------------------|----------|
| **Characters** | Gallery + legacy `photo_path` + featured image | **Strong** — richest asset model |
| **Worlds** | Single `cover_image_path` | **Partial** — create only, no edit |
| **Stories** | None | **None** |
| **Chapters** | None | **None** |
| **Profiles** | `avatar_url` (creator identity, not creative asset) | Separate concern |

All current assets use bucket **`character-photos`** with path conventions per object type.

---

## Reference Assets by Type

### Characters

| Asset role | Purpose | Consistency use | Status |
|------------|---------|-----------------|--------|
| **Portrait** | Primary face/identity reference | Cards, AI face consistency | Live (featured gallery image → `photo_path`) |
| **Full Body** | Body proportions, silhouette | Pose generation, scene placement | Future (`asset_role`) |
| **Expressions** | Emotional range reference | Dialogue scenes, AI expression | Future |
| **Clothing** | Outfit / wardrobe variants | Scene continuity, wardrobe state | Future |
| **Reference Gallery** | General reference images | Catch-all visual memory | Live (`character_images` + caption) |

**Future:** Typed roles on gallery rows (`portrait`, `full_body`, `expression`, `clothing`, `reference`) instead of caption-only semantics.

---

### Worlds

| Asset role | Purpose | Consistency use | Status |
|------------|---------|-----------------|--------|
| **Cover Image** | World identity on cards and public pages | Portfolio presentation | Live (create only) |
| **World Map** | Geography layout | Location consistency, AI scene grounding | Future |
| **Location References** | Specific place visuals | Environment consistency | Future |
| **Mood Board** | Tone, palette, atmosphere | Visual style alignment | Future |

---

### Stories

| Asset role | Purpose | Consistency use | Status |
|------------|---------|-----------------|--------|
| **Cover Image** | Story identity in lists | Portfolio / project recognition | Future |
| **Key Scene Images** | Pivotal visual moments | Plot + visual continuity | Future |
| **Mood Board** | Story tone and palette | AI generation style lock | Future |
| **Visual References** | Misc story-level refs | Shared context for all chapters | Future |

Stories today have **no image fields**. Text planning only (`summary`, `status`, roster).

---

### Chapters

| Asset role | Purpose | Consistency use | Status |
|------------|---------|-----------------|--------|
| **Scene References** | What this chapter looks like | Writing + future illustration | Future |
| **Concept Images** | Early visual ideas | Scene planning | Future |
| **Visual Notes** | Annotated refs (image + note) | Creator + AI context | Future |

Chapters today are **plain text only** (`title`, `content`).

---

## 1. What Assets Belong to Each Object

```text
Creator (profile)
└── avatar_url                    [identity — not a creative reference asset]

World
├── cover                         [live]
├── map                           [future]
├── locations[]                   [future — links to location entity + images]
└── mood_board[]                  [future]

Character
├── gallery[]                     [live — character_images]
│   └── role: portrait | full_body | expression | clothing | reference
├── featured_image_id             [live]
└── photo_path (legacy sync)      [live — derived from featured]

Story
├── cover                         [future]
├── mood_board[]                  [future]
├── key_scenes[]                  [future]
└── visual_references[]           [future]

Chapter / Page / Scene (content unit)
├── scene_references[]            [future]
├── concept_images[]              [future]
└── visual_notes[]                [future — image + text annotation]
```

**Rule:** Assets attach to the **lowest object that owns the visual context**, with story-level assets for shared tone and unit-level assets for specific moments.

---

## 2. How Assets Support Consistency

| Consistency layer | Asset contribution |
|-------------------|-------------------|
| **Character** | Portrait and body refs lock appearance; expression/clothing refs lock state per scene |
| **World** | Cover + map + location refs lock environment rules |
| **Story** | Cover + mood board lock narrative tone; key scenes anchor plot visuals |
| **Scene / Chapter** | Scene refs tie a specific moment to character + world context |
| **Visual (cross-cutting)** | Featured images and mood boards become the **style contract** for AI generation |

CharID does not generate images in v1 of this vision. It **stores, organizes, and serves** the references that make generation consistent later.

---

## 3. How Future AI Would Use These Assets

When AI assistance is added, it should **never** operate without a context bundle:

```text
AI Context Bundle (future)
├── World: name, description, rules, location refs, mood board
├── Story: summary, status, roster, key scenes, mood board
├── Content unit: title, content, scene references
├── Characters (roster): profile text + typed reference images per character
└── Style: project_type, visual consistency notes
```

**Usage patterns (future, not built now):**

| Task | Assets loaded |
|------|---------------|
| Illustrate a chapter scene | Character portraits + clothing refs + world location + chapter scene refs |
| Generate comic panel | Character full body + expression + story mood board |
| Maintain dialogue voice | Character text profile only (no image) |
| Image-to-image consistency | Featured portrait + style refs from mood board |

**Principles:**
- AI reads CharID memory; it does not replace the gallery
- Generated outputs may be **saved back** as new reference assets (future `source: upload | ai_generated`)
- No standalone AI chat — always anchored to World / Story / Character context

---

## 4. Recommended Database Architecture

### Phase A — Unify existing patterns (near term)

No new tables required for world cover edit. Extend worlds in place.

### Phase B — Generic reference assets table (medium term)

```text
reference_assets
├── id uuid PK
├── user_id uuid FK auth.users          -- denormalized for RLS performance
├── attachable_type text                -- 'character' | 'world' | 'story' | 'chapter' | ...
├── attachable_id uuid                  -- polymorphic parent
├── asset_role text                     -- 'cover' | 'portrait' | 'mood_board' | 'scene_ref' | ...
├── image_path text NOT NULL
├── caption text
├── sort_order integer
├── source text DEFAULT 'upload'        -- 'upload' | 'ai_generated' (future)
├── is_public boolean                   -- optional override; default inherit from parent
├── created_at timestamptz
```

**Indexes:** `(attachable_type, attachable_id)`, `(user_id)`, `(attachable_type, attachable_id, asset_role)`

**Migration path from today:**
1. Keep `character_images` — migrate to `reference_assets` later OR add `asset_role` column to `character_images` first
2. Keep `worlds.cover_image_path` — migrate to `reference_assets` with `role=cover` OR dual-write during transition
3. Keep `characters.photo_path` as **derived cache** of featured image path (backward compatibility for cards)

### Phase C — Typed extensions (long term)

```text
visual_notes
├── id, reference_asset_id FK, note text

ai_generation_log (future)
├── id, reference_asset_id, prompt, model, created_at
```

**Do not** create polymorphic tables until world edit + story cover ship — validate UX first.

---

## 5. Recommended Storage Architecture

### Bucket strategy

| Phase | Approach |
|-------|----------|
| **Now** | Single bucket `character-photos` (already holds characters, worlds, avatars) |
| **Future** | Rename or add `reference-assets` bucket when asset volume grows |

### Path conventions (recommended standard)

```text
{user_id}/characters/{character_id}/gallery/{image_id}.{ext}   [live]
{user_id}/{character_id}.{ext}                               [live — legacy create]
{user_id}/worlds/{world_id}/cover.{ext}                      [live]
{user_id}/avatars/{profile_id}.{ext}                         [live — profile]
{user_id}/worlds/{world_id}/assets/{asset_id}.{ext}           [future]
{user_id}/stories/{story_id}/assets/{asset_id}.{ext}         [future]
{user_id}/stories/{story_id}/chapters/{chapter_id}/{asset_id}.{ext}  [future]
```

### Upload rules (all assets)

- JPEG, PNG, WebP
- Max 5 MB (consistent with today)
- `upsert: true` on replace; delete old object when path changes
- Server-side validation in actions (never trust client MIME alone)

### Signed URLs

- Dashboard: signed URLs (1 hour TTL) — current pattern
- Public pages: storage RLS policies for anon read when parent is public — current pattern for characters and world covers

---

## 6. Public vs Private Asset Handling

Visibility inherits from the **parent object** unless explicitly overridden.

| Parent | Public when | Asset visibility |
|--------|-------------|------------------|
| Character | `characters.is_public = true` | All gallery images public via RLS |
| World | `worlds.is_public = true` | Cover public via storage policy |
| Story | Parent world is public | All story assets public (future) |
| Chapter | Parent world is public | All chapter assets public (future) |
| Profile avatar | `profiles.is_public = true` | Avatar public |

**Rules:**
- Private world → all child story/chapter assets hidden from public routes
- No per-asset `is_public` in v1 of reference assets (inherit only)
- Optional per-asset override in Phase B for "draft references" on public projects

**Storage policies:** Mirror database RLS — anon `SELECT` on `storage.objects` when joined row is public.

---

## 7. Future Image Generation Integration

Not built now. Design constraints for when it ships:

1. **Input:** AI receives context bundle + selected reference asset IDs (not whole bucket)
2. **Output:** Generated image offered as "Save to references" → creates `reference_assets` row with `source: ai_generated`
3. **Provenance:** Store generation metadata separately (`ai_generation_log`) — never overwrite upload refs silently
4. **Consistency lock:** User can mark an asset as **canonical** (one per role per character) — AI prefers canonical refs
5. **Project type aware:** Novel chapter refs differ from comic panel refs — load different asset roles per `stories.project_type`

CharID remains the **memory layer**; generation is a tool that writes back into memory.

---

## 8. Future User-Uploaded Asset Support

### Near-term (no new tables)

| Feature | Scope |
|---------|-------|
| World cover edit | `updateWorld` + replace upload — **highest priority gap** |
| Story cover | Single `cover_image_path` or first `reference_assets` row |

### Medium-term

| Feature | Scope |
|---------|-------|
| Story mood board | Multi-image on story |
| Chapter scene refs | Multi-image on chapter |
| Character asset roles | Extend gallery with role tags |
| Location entities | World sub-object with images |

### Upload UX patterns (reuse)

- File input + preview (WorldForm pattern)
- Gallery manager with add/delete/reorder/featured (CharacterGalleryManager pattern)
- Caption + optional role selector (extend caption field)

### Asset lifecycle

```text
Upload → Store → Attach to object → Display (dashboard + public)
                → Optional: set as featured/canonical
                → Future: feed AI context
                → Future: save AI output back
Delete → Remove storage object → Remove DB row → Revalidate paths
Replace → Upload new → Update path → Delete old object
```

---

## Recommended Implementation Order

| Step | Feature | Why |
|------|---------|-----|
| **1** | World cover edit (`updateWorld`) | Closes biggest gap; same pattern as character avatar |
| **2** | World metadata edit (name, description, visibility) | Worlds are read-only after create today |
| **3** | `asset_role` on `character_images` | Typed character refs without full polymorphic table |
| **4** | Story cover image | First story-level visual memory |
| **5** | Generic `reference_assets` table | Unify world/story/chapter assets |
| **6** | Chapter scene references | First content-unit visuals |
| **7** | AI context bundle + generation | Only after memory layer is reliable |

---

## Summary

| Question | Answer |
|----------|--------|
| What belongs where? | Characters: gallery + typed roles. Worlds: cover + future map/locations. Stories: cover + mood/scenes. Chapters: scene refs. |
| How do assets support consistency? | Canonical visual memory per consistency layer |
| How does AI use them? | Context bundle of typed refs — never standalone |
| Database | Start with targeted columns; evolve to `reference_assets` polymorphic table |
| Storage | Keep `character-photos`; standardize paths; upsert on replace |
| Public vs private | Inherit from parent object + storage RLS |
| Image generation | Save outputs back as assets with provenance |
| User uploads | Reuse gallery and cover patterns; expand per object |

CharID becomes the **visual memory layer** between creators and AI — not another image host, not another chat app.

---

*Document status: Draft for review — no code, migrations, or implementation implied.*
