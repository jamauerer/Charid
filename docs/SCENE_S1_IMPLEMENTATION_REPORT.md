# Scene S1 — Implementation Report

**Date:** 2026-06-14  
**Status:** Implemented (pending migration in Supabase)  
**Authority:** [SCENE_ARCHITECTURE_V2.md](./SCENE_ARCHITECTURE_V2.md) · [SCENE_IMPLEMENTATION_DIRECTIVES.md](./SCENE_IMPLEMENTATION_DIRECTIVES.md) · [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md)

---

## Summary

Scene S1 adds **story-centric scenes** as atomic narrative moments. Creation is a single modal (not a wizard): title, what happens, character chips, optional location — target under 30 seconds for the Giant Wave child test.

**Story page layout order:**

1. What's next (finish path)
2. Chapters
3. **Scenes** — ordered cards + create modal + S2 suggestion placeholders
4. Cast & Connections
5. Setting
6. Advanced plan + Edit details

Scenes sit **after Chapters** and **before Advanced planning**. The story workspace is the primary creation surface; scene cards support inline Edit / Delete without leaving the story page.

---

## Database changes

| File | Purpose |
|------|---------|
| `supabase/migrations/20250704000000_scene_s1.sql` | `scenes`, `scene_characters`, RLS, indexes |
| `supabase/migrations/20250705000000_scene_s1_align.sql` | `chapter_id`, `world_id`, `scene_characters.role` (default `present`) |
| `supabase/fix-scenes-api.sql` | PostgREST schema cache reload + grants |

**Run all three in Supabase SQL Editor before testing.**

### Schema (S1)

**`scenes`:** `id`, `story_id`, `project_id`, `title`, `summary`, `sort_order`, `created_at`, `updated_at` — plus optional `chapter_id`, `world_id`, `world_location_id` (linked place), `location_label` (free text).

**`scene_characters`:** `scene_id`, `character_id`, `role` (default `present`), `sort_order`.

---

## Files added

### Server

| File | Purpose |
|------|---------|
| `src/app/actions/scenes.ts` | CRUD + cast sync; location name resolution |
| `src/types/scene.ts` | Types + `normalizeScene` / `resolveSceneLocationDisplay` |

### UI (`src/components/scene-workspace/`)

| File | Purpose |
|------|---------|
| `StoryScenesPanel.tsx` | Story-page Scenes section |
| `SceneCreateStudio.tsx` | Single-step create + edit modal |
| `SceneList.tsx` | Ordered scene list |
| `SceneCard.tsx` | Inline card: title, summary, characters, location, Edit / Delete |
| `SceneWorkspaceView.tsx` | Optional detail page (read + edit/delete) |
| `SceneSuggestionPlaceholder.tsx` | S2 “Need ideas?” preview (disabled) |
| `SceneChapterSuggestPlaceholder.tsx` | S2 chapter → scenes preview (disabled) |

### Route

| Route | Purpose |
|-------|---------|
| `/dashboard/worlds/[worldId]/stories/[storyId]/scenes/[sceneId]` | Optional scene detail |

### Modified

| File | Change |
|------|--------|
| `src/app/dashboard/worlds/[id]/stories/[storyId]/page.tsx` | Fetch scenes; render `StoryScenesPanel` after chapters |
| `src/lib/creator-vocabulary.ts` | Scene copy strings |

---

## S1 scope vs deferred

| In S1 | Deferred |
|-------|----------|
| Manual create / edit / delete on story page | AI scene suggestions (S2) |
| Character chip picker (≥1 required) | Chapter → scene proposals (S2) |
| Linked location (`world_location_id`) or free text (`location_label`) | Manual reorder UI (uses `sort_order` append for now) |
| S2 UI stubs (disabled Approve / Edit / Regenerate) | Screenplay fields, comic panels, assets, publishing |
| `chapter_id` column (optional, unused in UI) | Forcing chapter assignment |

---

## Founder test checklist

After migration:

1. Project: **California Coast Surf Stories**
2. Story: **How I Surf** — add Jake to cast
3. Create scene **The Giant Wave** — Jake sees the biggest wave; location Pleasure Point (<30s)
4. Add chapter **First Green Wave** (optional — scenes work without chapters)
5. Create scenes: Sunrise Session, First Successful Ride, Celebration Afterward

**Pass criteria:** Feels like creative storytelling, not database management. Scenes section appears after Chapters. S2 placeholders visible but nothing auto-commits.

---

## Next steps

1. Run migrations in Supabase
2. Founder test workflow above
3. If UX passes → **Scene S2** (Suggest / Approve / Edit / Delete / Regenerate)
4. Manual scene reorder UI when needed
