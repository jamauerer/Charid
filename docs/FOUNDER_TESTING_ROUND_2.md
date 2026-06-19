# Founder Testing Lessons — Round 2

**Phase:** Founder Testing Round 2 — Real project build (Projects → Stories → Chapters → Scenes → Scene Suggestions)  
**Date:** 2026-06-14  
**Status:** Observations only — **no solutions in this document**  
**Authority:** [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md) · [FINISHED_CREATIVE_WORK_PRINCIPLE.md](./FINISHED_CREATIVE_WORK_PRINCIPLE.md)  
**Related:** [PROJECT_FRICTION_REPORT.md](./PROJECT_FRICTION_REPORT.md) · [SCENE_S1_IMPLEMENTATION_REPORT.md](./SCENE_S1_IMPLEMENTATION_REPORT.md) · [AI_COST_AND_USAGE_REPORT.md](./AI_COST_AND_USAGE_REPORT.md) · [PUBLISHING_MVP_ARCHITECTURE.md](./PUBLISHING_MVP_ARCHITECTURE.md)

**Gate:** Pause new architecture work until Round 2 observations are reviewed and validated with additional real creator sessions.

---

## Summary

Round 2 tested building one coherent project end-to-end — **California Coast Surf Stories** — using Projects, a surf world, characters, a story (**How I Surf**), chapters, manual scenes, and AI scene suggestions.

The **entity layer is richer than Round 1** (Projects, Scenes, staging suggestions), but the **creator still feels like an organizer**, not someone finishing a shareable work. Scenes are the first feature that feels like *storytelling*; everything around them still feels like *database navigation*.

**Dominant feeling:** “I can describe what happens — but I’m not sure where I am in the app, what to do next, or what a reader would ever see.”

---

## Methodology

### Test project

| Layer | Example content |
|-------|-----------------|
| **Project** | California Coast Surf Stories |
| **World** | California Coast (settings, Pleasure Point location) |
| **Characters** | Jake (+ optional mentor / rival later) |
| **Story** | How I Surf · `project_type` graphic novel or children’s book |
| **Chapter** | First Green Wave (prose block) |
| **Scenes (manual)** | The Giant Wave · Sunrise Session · First Successful Ride · Celebration Afterward |
| **Scene suggestions** | Generate → review Approve / Edit / Delete / Regenerate |

### Pass criteria attempted

- Giant Wave child test: title + what happens + Jake + Pleasure Point in under 30 seconds  
- Founder surf test: three scenes that read as a story flow  
- AI test: suggestions feel collaborative, not controlling  
- Organization test: find all project content without losing context  

### What this round adds vs Round 1

Round 1 validated bible architecture and linking. Round 2 adds **Projects**, **Scenes**, and **Scene Suggestions** on top of that stack — and stress-tests whether the new hierarchy actually reduces friction.

---

## 1. Creation flow friction

### Projects

- Creating a **named project** feels correct for “California Coast Surf Stories,” but it is unclear whether the project is the **finished work**, the **universe**, or both — `work_intent` helps slightly; the label still overlaps with World in the creator’s head.
- **“My Universe” backfill** appears for older accounts — easy to end up with a default project and a new named project without understanding which objects live where.
- **Start New Project wizard** exists, but day-to-day creation still often starts from **Create → Character / World / Story** in the sidebar — two entry philosophies coexist.
- Assigning `project_id` happens on create for some entities; for others it is inherited or backfilled — **not visible** to the creator when something is “in” the project or orphaned.

### Stories

- Story creation still **requires picking a world** before the story exists — for a surf vignette, “world” feels like overhead even when the project already implies a setting.
- **`project_type`** (novel, graphic novel, etc.) lives on the story, not the project — naming collision: “project type” vs “Project entity.”
- After creating a story from the **project workspace**, navigation lands on the story page under **`/dashboard/worlds/[id]/stories/...`** — not under `/dashboard/projects/[id]/...` — mental disconnect immediately after “project-first” setup.

### Chapters

- First chapter creation is smooth when following **What’s next → Add your first chapter**.
- Chapter editor is a **separate page** — leaving the story hub to write prose breaks flow when also building scenes on the story page.
- No visible link between **chapter content** and **scenes** — “First Green Wave” chapter and “Sunrise Session” scene feel like parallel lists with no structural relationship in the UI.

### Scenes (manual)

- **Create scene** modal is fast for Giant Wave — title, summary, character chips, location — passes the 30-second intent.
- Scene creation **requires at least one character on the story cast** — empty cast blocks both manual scenes and AI suggestions; error is clear but appears late if cast was skipped.
- **Location**: toggling “Pick a place” vs “Type a place” adds a decision; fine for pros, slightly slow for child path when Pleasure Point could default from world locations.
- Saving a scene **stays on the story page** (good) — no surprise navigation.

### Scene suggestions

- **Generate scene suggestions** requires cast — same gate as manual; consistent but easy to hit before cast is linked.
- If migrations for `creative_proposal_batches` are not applied, a **technical migration message** appears — breaks creator flow entirely (founder-only pain today; would block real users).
- Without `OPENAI_API_KEY`, suggestions still appear — **indistinguishable from live AI** in the UI (no “Suggested by CharID” vs template signal).
- **Two generate entry points** on the story page (main “Need ideas?” panel + chapter helper) — both create a new batch; prior staging dismissed — easy to lose in-progress review by clicking generate again.

---

## 2. Navigation friction

### Sidebar vs hierarchy

- Sidebar order: **Home · Projects · Stories · Characters · Worlds** — six top-level homes for one surf project.
- **Projects** tab is new, but **Stories**, **Characters**, and **Worlds** lists still show **global** inventory — same entities appear in project workspace and global lists without clear “you are here” context.
- No sidebar item for **Scenes** — scenes exist only inside a story; discoverable only after opening the right story and scrolling.

### URL model

- Story workspace URL is **world-nested**: `/dashboard/worlds/[worldId]/stories/[storyId]` — contradicts **Project → Story → Scene** mental model documented in architecture.
- **Project workspace** URL does not contain the active story — returning to “the project” after editing a story requires wayfinding (Projects list → project → Stories tab → story again).
- Optional **scene detail** route exists (`/scenes/[sceneId]`) but story-page cards are primary — two paths to the same object; scene detail page feels like an extra stop, not the main workflow.
- Breadcrumb on story page: **Stories · World name** — project name not shown.

### Tab and scroll navigation

- Story page is **long**: What’s next → Chapters → Scenes → Cast → Setting → Advanced plan → Edit details — lots of scrolling to move between chapter writing, scene building, and cast linking.
- **What’s next** finish path points to **chapters first**, never to scenes — even when scenes are the more natural beat structure for a graphic story.
- Jump hashes exist (`#story-scenes`, `#story-chapters`) but are not surfaced as a mini nav — creator scrolls or uses finish path hints tied to chapters.

### Cross-object jumps

- Adding a character from story cast opens modals (good) — but **relationships** and **location images** still often require visiting character or world pages.
- **Chapter editor** is a full page navigation away — returning to scenes requires back link + scroll.

---

## 3. Scene workflow friction

### Placement on story page

- Scenes sit **after Chapters** — for a beat-driven surf comic, creators expected Scenes **above** Chapters or equal prominence; chapters feel like the “official” structure because finish path prioritizes them.
- **Cast** and **Setting** sections appear **below** Scenes — when creating a scene, characters must already be in cast above the fold in Cast section, but Scenes UI comes **before** Cast in the page order — order mismatch vs dependency.

### Scene list UX

- Scene cards show title, summary, characters, location — **readable as a story flow** (positive).
- **Numbering** (1. 2. 3.) implies order, but **no drag reorder** in S1 — order is creation order only; fixing narrative sequence is not supported in UI.
- **No link from scene to chapter** in UI — `chapter_id` exists in schema but is unused in S1; “First Green Wave” chapter and its scenes float independently.

### Scene detail page

- Scene workspace page exists but story-page **inline Edit / Delete** is sufficient — detail page adds References/next-actions removal but still feels like a detour.
- **Scene suggestions on scene detail page** duplicate the story-page panel — same feature, two surfaces; unclear which is canonical.

### Staging vs canon

- **Suggested** badge distinguishes AI staging from canon cards (good).
- After **Approve**, scene appears in canon list — clear cause and effect.
- **Edit** on staging opens a second modal pattern similar to manual create — familiar but another modal layer.
- **Clear all suggestions** is easy to miss vs deleting items one-by-one — accidental batch loss if creator meant to review later.

### Empty and error states

- Empty scenes state is friendly — **Create scene** CTA repeated.
- Scenes error banner (migration / API) uses developer-facing language if table not exposed — not creator-safe.

---

## 4. Story organization friction

### Project as container

- **Project workspace** aggregates stories, characters, worlds, relationships — useful overview for “California Coast Surf Stories.”
- **No Scenes tab** on project — scene count not visible at project level; cannot see story progress as beat list without opening each story.
- **Overview tab** shows counts — stories/characters/worlds — not scenes, chapters, or “published status.”

### Story as hub

- Story page tries to be hub (finish path, chapters, scenes, cast, setting, bible) — **successful for canon assembly**, overwhelming for “what is this story right now?”
- **Advanced plan / Story Bible** below the fold competes with Scenes for “where is the plan?” — two planning surfaces (scenes vs bible) without explained division of labor.
- **Story status** (Idea, Planning, In Progress, Complete) does not auto-update from scene/chapter progress — status badge feels decorative.

### Chapters vs scenes

- For **How I Surf**, creator naturally wrote:
  - **Chapters** = prose containers (“First Green Wave”)
  - **Scenes** = moments (Sunrise Session, First Successful Ride)
- Product does not explain **when to use which** — both appear on the same page with no guidance.
- Finish path ignores scenes entirely — organization signal says chapters are the spine.

### Duplicate mental models

| Creator concept | Product objects |
|-----------------|-----------------|
| “My surf book” | Project? Story? Both? |
| “The setting” | World + locations + Setting panel on story |
| “What happens” | Chapter prose **and** scene summaries |
| “Finished work” | Nothing named this yet |

---

## 5. AI collaboration quality

### First impressions

- **Generate scene suggestions** produces usable surf beats (Dawn Patrol, Forecast, Mentor, Contest) when AI or template runs — **helpful for unstuck moments**.
- Staging panel copy (“nothing saves until you approve”) matches collaborative intent — **trustworthy framing**.
- **Approve / Edit / Delete / Regenerate** map cleanly to creator control — no accidental canon from AI observed.

### Quality observations

- Suggestions **respect cast names** when Jake is in context — character chips on approved scenes match.
- **Location names** sometimes generic or repeat world name when location list empty — Pleasure Point appears when locations exist; otherwise free text varies.
- **Duplicate beats**: regenerating or re-generating full batch can propose titles similar to existing scenes — exclude list helps but not perfect.
- **Chapter-scoped generate** does not feel different from generic generate in output — chapter excerpt in context not obvious to creator in results.
- Template fallback (no API key) produces **same-shaped** suggestions as live AI — founder could not tell whether OpenAI ran without checking env or logs.

### Collaboration vs control

- AI feels **collaborative** during review — creator stays in charge.
- AI does **not** feel integrated into story flow — it sits in a dashed box at the bottom of Scenes, separate from “What’s next” and finish path.
- **No “why these suggestions?”** — creator sees beats, not reasoning tied to their summary or last scene.
- Regenerate per row works but **slows review** when many rows need replacement — session becomes click-heavy.

### Trust boundaries

- Positive: nothing appeared in canon without Approve.
- Negative: unclear **data sent to OpenAI** (no creator-facing disclosure on generate click).
- Negative: no **usage indicator** (how many generates left, whether AI is on).

---

## 6. Publishing expectations

### What creators expected

- After building scenes for **How I Surf**, natural question: **“Can someone read this?”**
- Expected a **Publish** or **Share** action on the story page after 3–4 scenes — **not found** as a story-level action.
- Expected portfolio to show **the story as readable beats** — portfolio still emphasizes **profile + entity cards**.

### What exists today

- **Portfolio publish** = profile `is_public` — separate from story completion.
- **Public story URL** (`/u/[username]/worlds/.../stories/...`) shows summary, chapter list, character cards — **no scene list on public page**.
- **Public chapter page** renders prose — works for chapter content; scenes not part of reader experience.
- Setting world + portfolio public may expose story metadata **without explicit story publish** — mismatch with “draft until I say go” expectation ([SECURITY_AUDIT_V1.md](./SECURITY_AUDIT_V1.md) PUB-01).

### Expectation gap

| Creator belief | Observed product |
|----------------|------------------|
| “I finished my scenes” = shareable | Scenes are workspace-only |
| “Publish story” | Publish portfolio profile |
| “Reader sees my story flow” | Reader sees cards + optional chapter prose |
| “Draft vs live” | No draft boundary for scenes/chapters |

### Emotional result

- Building scenes felt like **progress**.
- Looking for publish felt like **hitting a wall** — same Round 1 gap, now sharper because scenes feel “done enough to share.”

---

## 7. Missing creator tools

Observed absences during the build (not prioritized, not designed here):

### Storytelling

- Scene **reorder** (drag or move up/down)
- Link scene **to chapter** (group beats under “First Green Wave”)
- **Story flow view** — read-only scroll of scenes like a reader would
- Unified **“what happens next?”** that includes scenes, not only chapters

### Project / navigation

- **Project-scoped story URL** or persistent project breadcrumb on story page
- **Single home** for “California Coast Surf Stories” that opens last-active story
- Scene **count** on project overview and story cards
- Clear indicator of which entities belong to which project when browsing global lists

### AI

- Visible **AI on/off** or source indicator (live vs template)
- **Prompt context preview** (“CharID used: your story summary, 3 scenes, Jake, Pleasure Point”)
- Rate-limit or soft **“you’ve generated several times”** nudge — absent; unlimited clicks

### Publishing

- **Publish this story** (even scene-list-only MVP)
- **Preview reader** before share
- **Copy link** after scenes exist
- **Featured work** on portfolio driven by story/scenes, not entity grid

### Production (expected missing, still noted)

- Comic / page builder
- Scene or story **export** (PDF, print)
- Cover assignment from story/project (Generate Cover still placeholder)

### Operational

- Creator-safe error messages when migrations missing (scenes, proposals)
- **Finish checklist** including scenes (“3 scenes · 1 chapter · 0 pages published”)

---

## Severity snapshot

| Area | Round 2 severity | Notes |
|------|------------------|-------|
| Creation flow | Medium | Scenes fast; project/world/story triangle still heavy |
| Navigation | **High** | World URLs vs project model; long story page |
| Scene workflow | Medium | Good core UX; order/chapter link/reorder gaps |
| Story organization | **High** | Chapters vs scenes vs bible — unclear division |
| AI collaboration | Low–Medium | Control good; integration and transparency weak |
| Publishing expectations | **High** | Scenes amplify “can I share?” gap |
| Missing tools | **High** | Reorder, reader preview, publish, project context |

---

## What worked (Round 2)

- **Manual scene create** — Giant Wave test viable; modal is focused, not a wizard.
- **Scene cards on story page** — first UI that reads like **story flow**, not admin tables.
- **AI staging + Approve** — collaborative model feels right; no silent commits observed.
- **Project workspace tabs** — reasonable aggregation for “everything in California Coast Surf Stories.”
- **Cast + location on scene cards** — `@ Pleasure Point` and character chips aid comprehension.
- **Inline Edit / Delete** on scenes — no forced navigation to manage beats.

---

## What regressed or persisted from Round 1

- **Finish path still chapter-centric** — scenes invisible to “What’s next.”
- **Publish ≠ finished work** — gap widened now that scenes exist.
- **World-nested story URLs** — worse now that Projects exist above stories.
- **Internal vocabulary** (Story Bible, Advanced plan) still on story page for deep planning.
- **Stories hub** still placeholder-quality for “my in-progress work.”

---

## Open questions (for Round 3 / real creators)

1. Do hobbyists think in **chapters**, **scenes**, or **both** for a graphic surf story?
2. Should **Projects** appear in breadcrumbs on every child page, or should URLs move under `/projects/[id]/stories/...`?
3. Is **scene-only** “good enough to share” for MVP reader, or do creators require chapter prose?
4. Does AI need a **visible** “CharID suggested” vs “template/offline” state to maintain trust?
5. When cast is empty, should scene create **prompt add character inline** instead of blocking?

---

## Document index

| Doc | Role |
|-----|------|
| [FOUNDER_TESTING_LESSONS_ROUND_1.md](./FOUNDER_TESTING_LESSONS_ROUND_1.md) | Prior round baseline |
| [PROJECT_FRICTION_REPORT.md](./PROJECT_FRICTION_REPORT.md) | Pre-project friction scenarios |
| [SCENE_S2_DESIGN.md](./SCENE_S2_DESIGN.md) | AI collaboration design |
| [PUBLISHING_MVP_ARCHITECTURE.md](./PUBLISHING_MVP_ARCHITECTURE.md) | Publishing design (not shipped) |
| [AI_COST_AND_USAGE_REPORT.md](./AI_COST_AND_USAGE_REPORT.md) | AI usage audit |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Round 2 observations — California Coast Surf Stories build; observations only, no solutions |
