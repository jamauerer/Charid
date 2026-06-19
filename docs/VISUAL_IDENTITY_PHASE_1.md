# Visual Identity — Phase 1 Implementation

**Date:** 2026-06-14  
**Status:** Implemented  
**Authority:** [VISUAL_IDENTITY_V1.md](./VISUAL_IDENTITY_V1.md) (approved)

Phase 1 translates **creative optimism** into concrete UI on four surfaces: **Home**, **Character Workspace**, **World Workspace**, and **Story Workspace**. Violet brand marks remain; **sunset amber/orange** becomes the primary invitation color.

---

## Design tokens (implemented)

### CSS variables — `src/app/globals.css`

| Token | Value | Replaces / notes |
|-------|-------|------------------|
| `--background` | `#0c0a09` | Warm stone charcoal (was `#09090b`) |
| `--foreground` | `#fafaf9` | Warm off-white |
| `--brand-surface` | `#141210` | Warm card ground (was `#0f0f11`) |
| `--brand-text-secondary` | `#a8a29e` | Stone-400 |
| `--brand-text-muted` | `#78716c` | Stone-500 |
| `--brand-warm-accent` | `#f59e0b` | Amber-500 — primary CTA |
| `--brand-warm-accent-soft` | `#fb923c` | Orange-400 — gradient end |
| `--brand-warm-accent-muted` | `#fcd34d` | Amber-300 — highlights |
| `--brand-sunset-glow` | `rgba(251,146,60,0.1)` | Ambient wash |
| `--brand-warm-border` | `rgba(251,191,36,0.15)` | Warm dividers |

**Unchanged:** `--brand-primary` / `--brand-accent` (violet/indigo) for links, focus, logo continuity.

### Tailwind class library — `src/lib/visual-identity.ts`

| Export | Use |
|--------|-----|
| `studioBtnPrimary` | Main CTAs (What's next, modals) |
| `studioBtnPrimarySm` | Create button, compact actions |
| `studioBtnSecondary` | Ghost buttons (Continue writing, Change world) |
| `studioEyebrow` | "CHARACTER" / "WORLD" / "STORY" labels |
| `studioSectionLabel` | Section headings |
| `studioSection` | Story Cast / Setting panels |
| `studioCardLink` | Home nav cards |
| `studioInspirePanel` | Story "What's next" block |
| `studioHeroWash` | Home hero band |
| `studioProgressFill` | Progress bar gradient |
| `studioWarmChip` | Relationship bond labels |
| `studioEmptyArt` | Placeholder gradients |

### Ambient background — `DashboardShell`

Dual radial gradient: **amber sunset** top-center + **subtle violet** top-right. Replaces cold indigo-only wash.

---

## Home

### Mockup description

```
┌─────────────────────────────────────────────────────────────┐
│ [Warm golden wash hero — rounded 2xl]                       │
│   CHARID STUDIO (amber eyebrow)                             │
│   A place where stories begin (large headline)              │
│   Pick up your latest work below… (supporting copy)         │
│   [ Create ] (amber→orange gradient button)                 │
├─────────────────────────────────────────────────────────────┤
│ Your recent work                                            │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                   │
│ │ART │ │ART │ │ART │ │ART │ │ART │ │ART │  square thumbs   │
│ │story│ │char│ │world│ …                                  │
├─────────────────────────────────────────────────────────────┤
│ Explore your studio — 3 warm cards (Stories/Characters/Worlds)│
└─────────────────────────────────────────────────────────────┘
```

### Concrete changes

| Change | File |
|--------|------|
| Hero band with tagline + Create CTA | `DashboardHomeView.tsx` |
| **Recent work grid** (up to 6 items, art-first) | `HomeRecentWork.tsx`, `home-studio.ts` |
| Warm card hover (amber border glow) | `studioCardLink` |
| Copy: "A place where stories begin" | `DashboardHomeView.tsx` |
| Removed cold "Home / creative studio at a glance" header | same |

### Data

`getHomeStudioPreview()` merges recent stories (with covers), worlds (covers), characters (photos), sorted by `created_at`.

---

## Character Workspace

### Mockup description

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Characters                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │         CHARACTER GALLERY (full width, hero)            │ │
│ │         portrait + expression slots                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│ CHARACTER (amber eyebrow)                                   │
│ Lyra Belacqua                                               │
│ Human · Hero archetype                                      │
│ [Shaping your vision — amber progress bar]                  │
│ Personality · Relationships · Stories                       │
│ ▸ Character details (collapsed)                             │
│ ▸ Continuity insights (collapsed)                           │
└─────────────────────────────────────────────────────────────┘
```

### Concrete changes

| Change | File |
|--------|------|
| **Gallery moved above title** (art before name) | `CharacterWorkspaceView.tsx` |
| Amber eyebrow replaces violet | `studioEyebrow` |
| Progress copy: "Shaping your vision" | `CreatorProgressBar.tsx` |
| Amber progress fill | `studioProgressFill` |
| "Character details" collapsed (was "Advanced…" open by default feel) | `CollapsibleWorkspaceSection` |
| Warm stone text colors | throughout |

---

## World Workspace

### Mockup description

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Worlds                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │         WORLD COVER (21:9 hero — warm empty gradient)     │ │
│ │         [Upload cover]                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│ WORLD (amber eyebrow) · Middle-earth                        │
│ Description…                                                │
│ [Shaping your vision progress]                              │
│ Gallery · Map · Moodboard · Locations · Stories · Cast      │
│ ▸ World details (collapsed — overview form)                 │
│ ▸ Advanced worldbuilding (collapsed)                        │
└─────────────────────────────────────────────────────────────┘
```

### Concrete changes

| Change | File |
|--------|------|
| **Cover hero moved above title** | `WorldWorkspaceView.tsx` |
| World overview form **moved into collapsed** "World details" | same |
| Cover empty state: warm amber gradient | `WorldCoverHero.tsx` |
| Public badge: amber (was emerald) | `WorldWorkspaceView.tsx` |
| "Characters in this world" section label | same |
| Warm surfaces on cover card | `WorldCoverHero.tsx` |

---

## Story Workspace

### Mockup description

```
┌─────────────────────────────────────────────────────────────┐
│ ← Stories · Middle-earth                                    │
│ STORY (amber eyebrow)                                       │
│ The Golden Compass                                          │
│ [Welcome banner — warm amber if ?welcome=1]                 │
│ ┌ What's next ─ amber inspire panel ─────────────────────┐ │
│ │ [ Continue writing ] (amber CTA)                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Chapters (primary) · Continue writing                       │
│ ┌ Cast & Connections ─ warm panel ────────────────────────┐ │
│ │ roster thumbs · bond chips (amber pills)                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌ Setting ─ warm panel ───────────────────────────────────┐ │
│ │ world link · locations · map · mood strip                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ▸ Advanced story plan                                       │
│ ▸ Story details (edit form)                                 │
└─────────────────────────────────────────────────────────────┘
```

### Concrete changes

| Change | File |
|--------|------|
| Story eyebrow + warm title typography | `page.tsx` |
| What's next: amber inspire panel + amber CTA | `StoryFinishPath.tsx` |
| "Continue writing" (was "Continue story") | `StoryChaptersPanel.tsx` |
| Cast & Setting panels use `studioSection` | `StoryCastConnectionsPanel`, `StorySettingPanel` |
| Bond chips: amber | `StoryRelationshipStrip.tsx` |
| World header actions: warm buttons | `StoryWorldHeader.tsx` |
| Welcome banner: amber wash | `StoryWelcomeBanner.tsx` |
| Edit block renamed "Story details" | `page.tsx` |

---

## Shared component changes

| Component | Change |
|-----------|--------|
| `CreateModal` | Amber gradient trigger (sidebar + default) |
| `CreatorProgressBar` | Amber fill; "Shaping your vision" |
| `CollapsibleWorkspaceSection` | Warm surface borders |
| `DashboardShell` | Sunset + violet ambient gradient |

---

## Copy changes (summary)

| Before | After |
|--------|-------|
| Home / Your creative studio at a glance | A place where stories begin |
| View and manage your narratives | Continue where your narrative left off |
| Your progress / N% complete | Shaping your vision / N% |
| Continue story | Continue writing |
| Edit Details | Story details |
| Advanced character details | Character details |
| Add a short description below in world details | Add a description when you're ready — your cover leads the way |
| Your next step to keep creating | One gentle step to keep your story moving |

---

## Files changed (implementation)

| File | Role |
|------|------|
| `src/app/globals.css` | Warm tokens |
| `src/lib/visual-identity.ts` | Shared classes |
| `src/lib/creator-vocabulary.ts` | Story hint copy |
| `src/app/actions/home-studio.ts` | Home preview data |
| `src/app/dashboard/page.tsx` | Fetch preview |
| `src/app/dashboard/DashboardHomeView.tsx` | Home hero + layout |
| `src/components/dashboard/HomeRecentWork.tsx` | Art grid |
| `src/components/dashboard/DashboardShell.tsx` | Ambient gradient |
| `src/components/dashboard/CreateModal.tsx` | Warm Create button |
| `src/components/dashboard/CreatorProgressBar.tsx` | Warm progress |
| `src/components/dashboard/CollapsibleWorkspaceSection.tsx` | Warm surfaces |
| `src/components/dashboard/StoryFinishPath.tsx` | Inspire panel |
| `src/components/dashboard/StoryChaptersPanel.tsx` | Warm secondary CTA |
| `src/components/dashboard/StoryWelcomeBanner.tsx` | Warm welcome |
| `src/components/character-bible/CharacterWorkspaceView.tsx` | Gallery-first |
| `src/components/world-bible/WorldWorkspaceView.tsx` | Cover-first, collapsed details |
| `src/components/world-bible/WorldCoverHero.tsx` | Warm empty art |
| `src/components/story-workspace/*` | Warm panels + chips |
| `src/app/dashboard/worlds/[id]/stories/[storyId]/page.tsx` | Story header |

---

## Founder testing checklist

### Home

- [ ] Hero shows "A place where stories begin" with golden wash
- [ ] Recent work grid shows story/world/character art (or warm empty placeholders)
- [ ] Create button is amber/orange, not violet-only
- [ ] Cards glow amber on hover, not violet

### Character

- [ ] Portrait gallery is the **first** large visual after back link
- [ ] Name and progress appear **below** gallery
- [ ] Progress bar is amber; label reads "Shaping your vision"
- [ ] Character details section is collapsed by default

### World

- [ ] Cover image is **first** large visual
- [ ] Title appears below cover
- [ ] World details form is inside collapsed section
- [ ] Cover upload empty state feels warm, not cold violet

### Story

- [ ] What's next panel has amber warmth
- [ ] Primary action button is amber
- [ ] Cast & Setting panels use warm stone surfaces
- [ ] Relationship chips are amber-toned
- [ ] Does **not** feel like an AI dashboard

### Global

- [ ] Page background has subtle sunset glow at top
- [ ] Text feels warm (stone) not blue-gray
- [ ] Violet still present on logo/sidebar — balanced, not dominant

---

## Known limitations (Phase 1)

| Limitation | Phase 2 candidate |
|------------|-------------------|
| Sidebar / marketing pages not fully migrated | Extend tokens to sidebar active states |
| Many list pages (Stories hub, Characters grid) still violet accents | Apply `studioCardLink` globally |
| Form inputs unchanged | Warm focus rings on inputs |
| Light mode not designed | Dark-only warm palette |
| Project workspace not styled | Same token pass |
| Public portfolio unchanged | Separate pass |

---

## Out of scope

- No new visual identity philosophy docs (V1 is final direction doc)
- No logo change
- No font change

---

## Related

| Doc | Role |
|-----|------|
| [VISUAL_IDENTITY_V1.md](./VISUAL_IDENTITY_V1.md) | Emotional direction (approved) |
| [BRAND.md](./BRAND.md) | Logo + legacy tokens |
