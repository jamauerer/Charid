# Creator Media Expansion

**Status:** Future roadmap only — not scheduled for implementation.  
**Principle:** Media is **published canon**, not disposable AI output.  
**Related:** [CHARID_VISION.md](./CHARID_VISION.md) · [CHARID_BUSINESS_PLAN_V1.md](./CHARID_BUSINESS_PLAN_V1.md) · [AI_PROVIDER_ARCHITECTURE.md](./AI_PROVIDER_ARCHITECTURE.md)

---

## Positioning

CharID does **not** compete with generic AI video, comic, or audiobook tools.

Those tools start with a **prompt**. CharID starts with a **project**:

```
Character → World → Story → Canon → Publishing → Media
```

Every expanded format draws from:

- **Bibles** (identity, rules, tone, timeline)
- **Reference assets** and slot roles (canonical, turnaround, scene)
- **Linked graph** (characters ↔ worlds ↔ stories)
- **Creator ownership** and privacy choices

Media generation is always **downstream** of an existing creator-owned project. No blank-slate “generate a video” homepage. No feed of unrelated clips.

**Competitive advantage:** Continuity over time — the same character in panel 12 matches panel 1 because the bible and slots say so.

---

## Expansion map

```
                    ┌─────────────────┐
                    │  Creator-owned  │
                    │  Character /    │
                    │  World / Story  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Canon layer    │
                    │  (bibles, slots)│
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   Static publish      Motion & audio        Discovery
   (portfolio today)  (this roadmap)        (future)
         │                   │                   │
         ▼                   ▼                   ▼
   Public pages        Comics · episodes     Character
   /u/[username]       · audiobooks          channels
                       · trailers
```

---

## Motion Comics

**Concept:** Comic page → animated panel sequences

### Flow

1. Creator builds **story bible** + timeline + character links
2. Creator composes or generates **comic pages** (panels tied to story beats)
3. CharID animates **per panel** or **per page** using story context — motion, subtle camera, lip-sync optional
4. Output publishes as a **motion comic** on portfolio or story page

### Canon inputs

- Panel script / dialogue from story bible
- Character turnaround + expression slots for consistent faces
- World asset roles for backgrounds
- Panel order = timeline event sequence

### Differentiation vs generic tools

| Generic AI video | CharID motion comics |
|------------------|-------------------|
| One prompt → clip | Page exists in story first |
| No character memory | Same slots across panels |
| Disposable export | Part of published story arc |

### Credits / providers (future)

- Comic page (static): 25 credits ([business plan](./CHARID_BUSINESS_PLAN_V1.md))
- Motion pass per panel: 15–30 credits
- Providers: image-to-video (Kling, Runway, Luma) via [Provider Router](./AI_PROVIDER_ARCHITECTURE.md)

### Publishing surface

Story page → “Read” (static) · “Watch” (motion) · chapter/episodic embed

---

## Story Episodes

**Concept:** Story Bible → narrated video episode

### Flow

1. Creator defines **episode** as a slice of story timeline (acts, beats, chapters)
2. CharID assembles **scene stills** + **motion segments** + **narration** from bible and linked characters
3. Episode exports as sequential **story episode** — not a random short

### Canon inputs

- Story bible: synopsis, tone, POV, episode boundaries
- Character voices (optional ElevenLabs profile per character)
- Scene illustrations already in story workspace
- World rules constrain visual consistency

### Format

- 3–15 minute episodic units
- Serialized on creator portfolio under world → story
- Private draft → public release when creator opts in

### Differentiation

Episodes are **canon chapters in motion**, not TikTok-style unrelated generations. Viewers follow **world → story → episode list**.

---

## Character Channels

**Concept:** Character-driven recurring content

### Flow

1. Creator designates a **character** as channel anchor (not a faceless account)
2. Channel pulls from **character bible** + recent story activity + optional “updates in voice”
3. Recurring formats: diary entries, in-character shorts, behind-the-bible, motion expressions

### Canon inputs

- Character identity, voice profile, canonical portrait slot
- Linked worlds/stories for context (“what happened last in canon”)
- Creator approves each publish — no autonomous posting

### Differentiation vs influencer AI

| Generic character bots | CharID character channels |
|------------------------|---------------------------|
| Chat-only or random images | Tied to real story graph |
| No archive | Portfolio + continuity |
| Platform owns vibe | Creator owns IP |

### Monetization (future)

- Public channel on `/u/[username]/characters/[id]`
- Optional subscriber tips or paid episodes — **after** core publishing works; not MVP

---

## Audiobooks

**Concept:** Story → voice narration

### Flow

1. Creator writes or imports **story text** (chapters in CharID)
2. Assign **narrator voice** + per-character voices from bible
3. Generate **audiobook tracks** chapter-by-chapter
4. Publish to portfolio as listenable story

### Canon inputs

- Chapter text (creator-authored primary; AI assist for draft only if labeled)
- Character name pronunciation from bible metadata
- Tone and content rating from story bible

### Differentiation

Audiobook is the **same story object** as written chapters — not a separate upload. Listeners see character/world links and illustrated portfolio.

### Credits (future)

- Story generation assist: 5 credits
- Audiobook minute: TBD by ElevenLabs COGS + 4× margin rule

---

## Trailers

**Concept:** World + Story → teaser video

### Flow

1. Creator selects **world** and/or **story** (not empty prompt)
2. CharID composes trailer from **establishing world assets**, **hero character slots**, **story hook** from bible
3. 15–60 second teaser for portfolio and external share

### Canon inputs

- World bible: tagline, tone, key locations (asset roles)
- Story bible: logline, stakes, featured characters
- Licensed music: creator upload or royalty-free library (future)

### Differentiation

Trailers market **a specific canon project**, not CharID the generator. Share URL points to `/u/[username]/worlds/[slug]` — not to a watermarked AI tool.

### Credits

- Video generation: 100 credits base ([business plan](./CHARID_BUSINESS_PLAN_V1.md))
- Trailer bundle (edit + 3 clips): premium pack or Studio tier

---

## Creator Publishing

**Concept:** One publishing layer for all media types — always rooted in projects.

### Publishable formats (future)

| Format | Source object | Public surface |
|--------|---------------|----------------|
| **Comics** | Story + pages | Story reader |
| **Episodes** | Story + episode | Story watch |
| **Audiobooks** | Story + chapters | Story listen |
| **Trailers** | World or story | Portfolio hero / embed |
| **Motion comics** | Story + pages | Story watch (panel mode) |
| **Portfolio** | Profile + featured work | `/u/[username]` *(today)* |

### Publishing rules

1. **Private by default** — same as [CREATOR_ECONOMY_AND_RIGHTS.md](./CREATOR_ECONOMY_AND_RIGHTS.md)
2. **Creator triggers publish** — no auto-public generation
3. **Moderation** on all media before public visibility
4. **Attribution** — creator username and project title on embeds
5. **Remix** — opt-in per project; published media inherits remix policy

### Reader experience

Visitors discover:

```
Creator portfolio
  → World
    → Story
      → Read (comic / text)
      → Watch (motion / episode)
      → Listen (audiobook)
      → Trailer (teaser)
```

Not a global “AI video feed.”

---

## Dependencies (before any section ships)

| Prerequisite | Why |
|--------------|-----|
| Story Bible UI complete | Episodes, comics, audio need timeline |
| Credit system + Stripe | Video/audio COGS control |
| Provider router (video, voice) | Multi-vendor without creator exposure |
| Publishing v2 | Format-specific public pages |
| Moderation on video/audio | Safety at scale |
| Unit economics per format | 4× COGS rule per [CHARID_BUSINESS_PLAN_V1.md](./CHARID_BUSINESS_PLAN_V1.md) |

**Suggested order:** Static comic pages → audiobooks (lower COGS) → trailers → motion panels → full episodes → character channels

---

## What we will not build

- Standalone “generate video” without a story project
- Public explore feed of AI clips
- Auto-posting character bots without creator approval
- Training on private creator bibles for global models
- Competing on Kling/Runway feature checklists alone

---

## Success criteria (expansion phase)

1. A visitor can follow **one character** across comic, audio, and motion in **one portfolio**
2. Generated media references **stable slot assignments** — recognizable canon
3. Media COGS stay within **Studio + credit pack** economics
4. Creators cite **continuity** as reason to stay — not single-shot quality

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 0.1 | 2026-06-14 | Future roadmap — no implementation commitment |
