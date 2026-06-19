# Scene Implementation Directives

**Status:** Approved — **binding before Scene S1 coding begins**  
**Date:** 2026-06-14  
**Authority:** [SCENE_ARCHITECTURE_V2.md](./SCENE_ARCHITECTURE_V2.md) (approved)  
**Related:** [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md) · [STORY_WORKSPACE_V3_IMPLEMENTATION_REPORT.md](./STORY_WORKSPACE_V3_IMPLEMENTATION_REPORT.md) · [PROJECT_UX_PROPOSAL.md](./PROJECT_UX_PROPOSAL.md)

---

## Purpose

Founder-approved implementation rules for Scene S1 and adjacent work. These directives **override** exploratory details in architecture docs where they conflict.

**Do not begin Scene schema or UI until Story Workspace V3 is verified live** (already shipped — see report).

---

## 1. Scenes are the primary storytelling object

| Layer | Role |
|-------|------|
| **Worlds** | Provide settings |
| **Locations** | Provide places |
| **Characters** | Provide actors |
| **Scenes** | **Where stories actually happen** |

### Creator mental model

```
Project → Story → Scene
```

**Not:**

```
Project → World → Scene
```

- Every scene’s authoritative parent is **Story** (`scenes.story_id`).
- Worlds and locations are **referenced**, never parents of scenes.
- Story workspace is the primary creation surface — not World workspace, not Project workspace.

---

## 2. Keep scenes simple (V1)

### Required at creation (UI)

| Field | Label (creator-facing) | Required |
|-------|------------------------|----------|
| `title` | Title | ✓ |
| `summary` | What happens? | ✓ |
| Cast | Characters | ✓ (≥1 in practice; allow save with zero only if founder reopens) |
| Place | Location | — (optional) |

**Everything else is advanced** — hidden behind “Advanced” or deferred to later phases.

### Explicitly deferred from V1 UI

- INT / EXT, time of day, slug lines  
- Screenplay-style metadata forms  
- `tone`, `story_beat`, `notes` (schema may exist; UI does not)  
- Chapter assignment on create (flat story-ordered list in V1)  
- Panel layout  

### Child acceptance test (mandatory)

A 10-year-old must create and save in **under 30 seconds**:

| Field | Example |
|-------|---------|
| **Title** | The Giant Wave |
| **What happens?** | Jake sees the biggest wave of his life. |
| **Characters** | Jake |
| **Location** | Pleasure Point |

Location may be free text (`location_label`) — no forced pick from world library.

---

## 3. Scenes power AI collaboration

When creators are stuck, CharID **suggests scenes** — it does not create them silently.

### Example

**Story:** How I Surf  
**Latest scene:** Jake catches his first green wave.

**CharID suggests:**

- Celebration on the beach  
- Bigger winter swell  
- Surf contest  
- Meet experienced surfer  
- El Niño forecast arrives  

### Creator actions on each suggestion

| Action | Behavior |
|--------|----------|
| **Approve** | Commit to `scenes` + `scene_characters` |
| **Edit** | Open simple V1 form pre-filled |
| **Delete** | Remove from proposal list |
| **Regenerate** | New suggestion batch — does not overwrite approved scenes |

Suggestions use story context: existing scenes, cast, locations, relationships, story bible summary.

**Ship S1 manual scenes before S2 AI suggest** — but design schema and UI slots for proposal staging from day one.

---

## 4. Preserve the approval model

All AI-generated (or CharID-suggested) entities must follow:

```
Suggest → Review → Edit → Approve → Commit
```

Applies to:

- Scenes  
- Chapters  
- Locations  
- Maps  
- Characters  
- Relationships  

**No silent creation.** See [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md).

Manual creation (creator fills V1 form) commits immediately — that **is** approval.

---

## 5. Scenes must support future outputs

Scene is the **bridge between planning and finished work**.

Same `scenes` row powers all pipelines:

```
Story → Chapter → Scene → Comic Pages → Panels
Story → Chapter → Scene → Novel (prose)
Story → Scene → Screenplay
```

**Do not design scenes exclusively for comics.** V1 UI is format-neutral; comic panel children attach later.

---

## 6. Story Workspace V3 remains priority

Before expanding **Projects** further, the story page must surface:

| Surface | Status |
|---------|--------|
| Locations | ✅ Shipped ([STORY_WORKSPACE_V3_IMPLEMENTATION_REPORT.md](./STORY_WORKSPACE_V3_IMPLEMENTATION_REPORT.md)) |
| Map | ✅ Shipped |
| Moodboard | ✅ Shipped |
| Relationship bonds | ✅ Shipped |

**Next story-page priority:** **Scenes list + create** above or beside Chapters — story becomes scene-first over time.

Do not regress V3 aggregates when adding Scenes.

---

## 7. Projects are organizational

| Entity | Role |
|--------|------|
| **Project** | Container — overview, counts, navigation |
| **Story** | Where creation happens |

### Do not (until explicitly replanned)

- Move worldbuilding tools into Project workspace  
- Add Project tabs: Locations, Maps, Moodboards  

### Keep Project tabs (unchanged)

- Overview  
- Stories  
- Characters  
- Worlds  
- Relationships  

---

## 8. Long-term goal

One end-to-end path inside CharID:

```
Idea
  → Story
  → Suggested Chapters
  → Suggested Scenes
  → Review / Edit
  → Comic Creation
  → Publish
  → Portfolio
```

Same architecture for **child creators**, **hobbyists**, and **professionals** — only assistance level changes ([COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md)).

Scene S1 is the first **canonical moment object** on that path. AI suggest (§3) and outputs (§5) follow in later phases.

---

## Build order (mandatory)

| Order | Deliverable | Blocker |
|-------|-------------|---------|
| ✅ | Story Workspace V3 aggregates | — |
| **S1** | `scenes` + `scene_characters` migration, RLS, API fix | V3 live |
| **S1** | Story page: scene list + V1 create/edit form | Migration |
| **S1** | Revalidation wired from scene CRUD | Migration |
| **S2** | Scene reorder (story-level `sort_order`) | S1 |
| **S2** | AI scene suggestions + approval UI | S1 + proposal staging |
| **S3** | Chapter ↔ scene grouping (optional parent) | S2 |
| **S4** | Advanced scene fields (screenplay, etc.) | S3 |
| **S5** | Panels / comic pages under scene | S3 |
| — | Project location/map/moodboard rollups | **Deferred** |

---

## S1 schema minimum (implementation)

```sql
-- V1 columns exposed in UI; others deferred
scenes (
  id, story_id, project_id, user_id,
  title,           -- required
  summary,         -- required ("What happens?")
  location_label,  -- optional free text
  world_location_id, -- optional FK; pick from story worlds later
  sort_order,
  slug,            -- auto from title
  created_at, updated_at
)

scene_characters (
  scene_id, character_id,
  sort_order       -- role/notes deferred V1
)
```

`chapter_id`, `interior_exterior`, `time_of_day`, `tone`, `notes` — **omit from V1 migration** or add nullable without UI.

---

## Decision test (pre-merge)

1. Can a child pass the Giant Wave test in &lt;30s?  
2. Is parent always Story, never World?  
3. Does any AI path commit without Approve?  
4. Did we add Project rollup tabs? (Must be **no**.)  
5. Does the schema block novel/screenplay/comic outputs later? (Must be **no**.)

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Founder-approved directives before Scene S1 |
