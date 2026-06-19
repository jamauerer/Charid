# Scene S2 — AI Scene Suggestions

**Date:** 2026-06-14  
**Status:** Implemented (pending migration + optional `OPENAI_API_KEY`)  
**Authority:** [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md) · [COLLABORATIVE_CREATION_PRINCIPLE.md](./COLLABORATIVE_CREATION_PRINCIPLE.md) · [SCENE_ARCHITECTURE_V2.md](./SCENE_ARCHITECTURE_V2.md)

---

## Summary

Scene S2 is CharID’s **first AI collaboration feature**. When creators are stuck, CharID suggests 3–8 scene beats from existing canon. **Nothing commits until Approve.**

Workflow: **Suggest → Review → Edit → Approve → Commit**

---

## Staging architecture (reusable)

| Layer | Purpose |
|-------|---------|
| `creative_proposal_batches` | Staging buffer for all suggestion kinds |
| `proposal_kind` | `scene_suggestion` in S2; future: chapter, character, location, cover, comic_page |
| `items` (JSONB) | Pending proposals with per-item status |

Item statuses: `pending` · `approved` · `discarded`

Only **Approve** calls `commitSceneRecord()` — same path as manual scene create.

---

## Database

| File | Purpose |
|------|---------|
| `supabase/migrations/20250706000000_creative_proposal_staging.sql` | `creative_proposal_batches` + RLS |
| `supabase/fix-creative-proposals-api.sql` | PostgREST grants |

---

## Entry points

| Surface | UI |
|---------|-----|
| Story workspace (Scenes section) | **Need ideas?** + **Generate scene suggestions** |
| Scene workspace (detail page) | Same panel, scoped with `scene_id` context |
| Chapter helper | **Generate scene suggestions** for latest chapter |

---

## Inputs (canon only)

- Story title, summary, format  
- Story bible summary (when available)  
- Existing scenes and chapters  
- Cast, relationships, locations  
- World name and description  

---

## Creator actions

| Action | Effect |
|--------|--------|
| **Approve** | Creates a real `scenes` row + cast links |
| **Edit** | Updates staging item only |
| **Delete** | Marks item discarded |
| **Regenerate** | Replaces one pending item (scoped — does not overwrite canon) |

---

## AI provider

- **Live:** OpenAI Chat Completions when `OPENAI_API_KEY` is set  
- **Fallback:** Template suggestions (Founder test works offline — e.g. Dawn Patrol, The Forecast, Meeting a Mentor, Contest Day)

Optional env: `OPENAI_TEXT_MODEL` (default `gpt-4o-mini`)

---

## Key files

| Area | Path |
|------|------|
| Staging types | `src/types/creative-proposal.ts`, `src/types/scene-suggestion.ts` |
| Context | `src/lib/assemble-scene-suggestion-context.ts` |
| Generation | `src/lib/ai/generate-scene-suggestions.ts` |
| Actions | `src/app/actions/scene-suggestions.ts` |
| Commit | `src/lib/scenes/commit-scene.ts` |
| UI | `SceneSuggestionStagingPanel.tsx`, `SceneSuggestionEditStudio.tsx` |

---

## Founder test

1. Run migrations (including S1 if not applied)  
2. Optional: set `OPENAI_API_KEY`  
3. **California Coast Surf Stories** → **How I Surf** (Jake in cast)  
4. **Generate scene suggestions**  
5. Approve some, edit some, delete some  
6. Confirm canon scenes only appear after Approve  

**Pass:** AI feels like a collaborator, not autopilot.

---

## Next

- Credit gating (Monetization roadmap)  
- Chapter / character / location suggestion kinds on same staging table  
- Bulk approve after review (explicit action)
