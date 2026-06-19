# CharID Creator Showcase Vision

Product architecture document — **not an implementation spec**.

CharID evolves from a profile page into a **creator showcase and discovery platform** — where creators build consistent projects privately and present them publicly, and visitors explore creative work across the community.

See also:
- [CHARID_CORE_PRINCIPLE.md](./CHARID_CORE_PRINCIPLE.md)
- [PORTFOLIO_V2_VISION.md](./PORTFOLIO_V2_VISION.md) — public creator page structure in detail
- [PROJECT_TYPES_VISION.md](./PROJECT_TYPES_VISION.md)
- [REFERENCE_ASSETS_VISION.md](./REFERENCE_ASSETS_VISION.md)

**AI assists. Creators create. CharID remembers.**

---

## Explicitly not in scope

CharID is **not a store**. This vision does **not** include:

- Purchasing or selling content
- Payments, subscriptions, or checkout
- Creator payouts or revenue splits
- Shopping carts, product listings, or ecommerce systems
- Paid tiers for content access

Showcase and discovery only. Visibility types may include **Preview Only**, **Free Download**, and **Private** — never **Paid**.

---

## Core idea

Creators use CharID to:

| Step | Meaning |
|------|---------|
| **1. Create** | Characters, worlds, stories, chapters, reference assets |
| **2. Organize** | Project types, rosters, galleries, consistency memory |
| **3. Showcase** | Public creator page presenting their best work |
| **4. Discover** | Browse and find other creators and projects |

CharID helps creators **maintain consistency** while building projects and gives them a place to **publicly present** those projects — without marketplace mechanics.

---

## Long-term goal

```text
CharID =
  Creative Consistency Platform
  +
  Creator Showcase & Discovery Platform
```

Creators can:

- Build consistent characters, worlds, and stories
- Organize creative projects by type
- Share creative work on a public creator page
- Discover other creators and projects through Explore

All built on **one memory layer** — no duplicate content database, no separate creator CMS.

---

## Current problem

### Portfolio today = profile settings

| Surface | What it does today |
|---------|-------------------|
| `/dashboard/portfolio` | Edit username, avatar, bio, visibility |
| `/u/{username}` | Profile header + public worlds + public characters; stories **"Coming Soon"** |
| `/dashboard/explore` | Placeholder — "Browse public characters" (not built) |

A visitor landing on a creator page cannot quickly answer:

- **Who** is this creator?
- **What** do they create (novels, comics, animation)?
- **What projects** have they built?
- **What worlds** and **characters** have they developed?

Profile fields alone do not constitute a creative portfolio. Explore does not yet connect creators to audiences.

---

## System architecture

### Two-sided platform

```text
┌─────────────────────────────────────────────────────────────────┐
│                     CREATOR SHOWCASE                            │
│  /u/{username}  —  "What has this creator made?"                │
│  Built from: profiles + worlds + characters + stories + assets  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    CharID Memory Layer
              (existing tables + storage — no duplicate)
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                     EXPLORE / DISCOVERY                         │
│  /explore  —  "What exists across CharID?"                      │
│  Browse: project types, characters, worlds, artwork, creators   │
└─────────────────────────────────────────────────────────────────┘
```

### Layer diagram

```text
┌──────────────────────────────────────────────────────────────┐
│  Presentation Layer                                          │
│  • Public creator pages (/u/{username})                      │
│  • Explore browse/search (/explore, future public routes)    │
│  • Dashboard curation (/dashboard/portfolio)                 │
└────────────────────────────┬─────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│  Assembly Layer (future)                                       │
│  • getPublicCreatorShowcase(username)                          │
│  • getExploreFeed(filters, sort, pagination)                   │
│  • resolveVisibility(asset, viewer)                            │
└────────────────────────────┬─────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│  CharID Memory (live + planned)                                │
│  profiles · characters · character_images                      │
│  worlds · stories · story_images · chapters                    │
│  future: engagement stats · visibility flags · published_works │
└────────────────────────────────────────────────────────────────┘
```

### Design principles

1. **Surface, don't duplicate** — Showcase and Explore read existing CharID objects.
2. **Visibility inherits** — Public content flows from `profiles`, `worlds`, `characters`, and world-gated stories/assets.
3. **Projects are stories** — `stories.project_type` drives grouping in portfolio and Explore filters.
4. **Gallery is curated assets** — Pointers to `character_images`, `story_images`, world covers — not a separate art bucket.
5. **Discovery respects privacy** — Private content never appears in Explore or public showcase.
6. **Engagement is additive** — Views, likes, bookmarks attach to existing objects; they do not replace creative data.
7. **No commerce layer** — Free download is a visibility flag, not a transaction.

---

## Creator showcase (public page)

Detailed section layout is documented in [PORTFOLIO_V2_VISION.md](./PORTFOLIO_V2_VISION.md). Summary:

### Profile Header

| Element | Source |
|---------|--------|
| Avatar | `profiles.avatar_url` |
| Display name | `profiles.display_name` |
| Username | `profiles.username` |
| Bio | `profiles.bio` |

### Projects

Stories grouped by `project_type`:

- Graphic Novels
- Films / Animation
- Children's Books
- Novels
- Other

Cover from `stories.featured_image_id` → `story_images`. Links to public story pages.

### Characters

Featured public characters — portrait from featured gallery image. Phase 1: all public; Phase 2: creator-curated featured set.

### Worlds

Featured public worlds — cover from `worlds.cover_image_path`. Phase 1: all public; Phase 2: creator-curated.

### Gallery

Visual work surfaced from existing reference assets:

| Asset kind | Source |
|------------|--------|
| Character sheets | `character_images` |
| Concept art | `character_images`, `story_images` |
| Mood boards | `story_images` (`asset_type = mood_board`) |
| Story covers | `story_images` (`asset_type = cover` or featured) |
| Key scenes | `story_images` (`asset_type = key_scene`) |

Phase 2: creator picks and orders gallery items (junction table — pointers only).

### Published Work

Future section for **completed output** — PDFs, external links, video embeds. Showcase and download (if allowed by visibility). **Not for sale.**

See [PORTFOLIO_V2_VISION.md](./PORTFOLIO_V2_VISION.md) Phase 3.

---

## Explore — discovery system

### Purpose

Explore answers: **"What creative work exists on CharID?"**

Today: `/dashboard/explore` is a placeholder. Future: a real browse and filter experience for logged-in and optionally public visitors.

### Browse dimensions

| Category | Source objects | Filter key |
|----------|----------------|------------|
| Graphic Novels | Public stories | `project_type = graphic_novel` |
| Films / Animation | Public stories | `project_type = film_animation` |
| Children's Books | Public stories | `project_type = childrens_book` |
| Novels | Public stories | `project_type = novel` |
| Other | Public stories | `project_type = other` |
| Characters | Public characters | `characters.is_public` |
| Worlds | Public worlds | `worlds.is_public` |
| Artwork | Public reference assets | Aggregated gallery-eligible images |
| Creators | Public profiles | `profiles.is_public` |

### Explore routes (future)

```text
/explore                          Hub — featured + category entry points
/explore/projects                 All public projects (filterable by type)
/explore/projects/graphic-novels
/explore/characters
/explore/worlds
/explore/artwork
/explore/creators
/explore/search?q=...             Cross-entity search (future)
```

Dashboard `/dashboard/explore` may redirect to or embed the same feed for authenticated users.

### Explore card data (minimal)

**Project card:** cover, title, creator username, project type, status, world name, like/view counts (future).

**Character card:** portrait, name, creator, world name.

**World card:** cover, name, creator, story/character counts.

**Creator card:** avatar, display name, username, bio excerpt, project count.

**Artwork card:** image, caption, asset type, source project/character link.

All cards link into existing public routes (`/u/{username}/...`).

---

## Project visibility types (future concept)

Visibility applies to **showcase and Explore presentation** — not commerce.

| Type | Public view | Download | Explore | Use case |
|------|-------------|----------|---------|----------|
| **Preview Only** | Yes | No | Yes | Teaser portfolio pieces, WIP showcase |
| **Free Download** | Yes | Yes | Yes | PDFs, published excerpts, shareable files |
| **Private** | No | No | No | Draft work, personal reference |

**Default today:** Binary public/private via `is_public` on profile, world, character. Stories inherit world visibility.

**Future:** Optional `visibility` field on stories, published works, and individual assets — extends but does not replace inheritance rules.

**Not included:** Paid, members-only, or subscription-gated content.

---

## Engagement (future)

Lightweight signals for discovery ranking and creator feedback. **Not** social network scale in v1 of engagement.

| Feature | Purpose | Notes |
|---------|---------|-------|
| **Views** | Popularity signal | Increment on public page view; aggregate per story/character/world |
| **Likes** | Explicit appreciation | Authenticated users; one like per user per object |
| **Bookmarks** | Personal save-for-later | Private to bookmarking user; drives "My Bookmarks" dashboard |

### Comments

**Future consideration — separate decision required.**

Comments introduce moderation, reporting, spam, and safety requirements. Do not bundle with initial showcase or Explore shipping. Document and design moderation policy before any comment system.

---

## Ranking and sorting (Explore)

### Sort options (future)

| Sort | Logic |
|------|-------|
| Newest | `created_at desc` |
| Most Viewed | `view_count desc` |
| Most Liked | `like_count desc` |
| Trending | Weighted function: recent views + likes + updates |
| Recently Updated | `updated_at desc` on story/world/character |

### Curated sections (future)

| Section | Curation |
|---------|----------|
| Featured Projects | Editorial / algorithmic highlight |
| Featured Creators | Profiles with strong showcase completeness |
| Staff Picks | Manual curation (admin-only future role) |

Trending and featured require engagement metrics (views, likes) and sufficient public content volume.

---

## Data sources

### Live today (no new tables required for showcase foundation)

| Showcase section | Tables | Key fields |
|------------------|--------|------------|
| Profile Header | `profiles` | `username`, `display_name`, `bio`, `avatar_url`, `is_public` |
| Projects | `stories`, `worlds`, `story_images` | `project_type`, `featured_image_id`, `title`, `summary`, `status` |
| Characters | `characters`, `character_images` | `is_public`, `featured_image_id`, `photo_path` |
| Worlds | `worlds` | `is_public`, `cover_image_path`, `name`, `description` |
| Gallery (manual Phase 2) | `character_images`, `story_images` | `asset_type`, `caption`, `image_path` |

### Future tables (conceptual — not implementation spec)

| Feature | Proposed storage | Phase |
|---------|------------------|-------|
| Featured character/world ordering | `profiles` curation JSON or junction | Portfolio Phase 2 |
| Gallery curation | `portfolio_gallery_items` junction | Portfolio Phase 2 |
| Published works | `published_works` | Portfolio Phase 3 |
| Visibility per asset/story | `visibility` enum column | Showcase Phase 2+ |
| Views | `content_views` or counter on objects | Explore Phase 2 |
| Likes | `content_likes` junction | Explore Phase 2 |
| Bookmarks | `user_bookmarks` junction | Explore Phase 2 |
| Full-text search index | Optional search service or Postgres FTS | Explore Phase 3 |

**Rule:** Creative content lives in existing CharID tables. Engagement and curation tables **reference** content IDs — they do not copy titles, images, or story text.

---

## User flows

### Flow 1 — Creator builds and showcases

```text
Sign up
  → Create characters, worlds, stories (dashboard)
  → Upload reference assets (galleries, covers)
  → Set world/character public
  → Edit portfolio (profile header + future curation)
  → Save → View Public Portfolio (/u/{username})
  → Visitor sees Projects, Characters, Worlds, Gallery
```

### Flow 2 — Visitor discovers via creator page

```text
Land on /u/{username} (link share, Explore, search)
  → Read profile header
  → Browse Projects by type
  → Click project → public story page (chapters, roster, reference assets)
  → Click character → public character page (gallery)
  → Click world → public world page (stories, characters)
  → (Future) Like or bookmark project
```

### Flow 3 — Visitor discovers via Explore

```text
Open /explore
  → Choose category (Novels, Characters, Artwork, …)
  → Apply sort (Newest, Trending, …)
  → Scan grid of cards
  → Click card → creator showcase or entity detail page
  → (Future) Follow bookmark trail in dashboard
```

### Flow 4 — Creator curates showcase (Phase 2)

```text
Dashboard → Portfolio
  → Pin featured characters (reorder)
  → Pin featured worlds (reorder)
  → Add gallery items from existing CharID assets
  → Preview full public layout
  → Save → revalidate public page
```

### Flow 5 — Published work with free download (Phase 3, no payment)

```text
Creator uploads PDF or adds external link
  → Sets visibility: Preview Only OR Free Download
  → Appears in Published Work section on showcase
  → Visitor views or downloads — no checkout
```

---

## Wireframes

### Public creator showcase — `/u/{username}`

```text
┌────────────────────────────────────────────────────────────────┐
│ [CharID nav]                                    [Explore]      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│              ┌──────────┐                                      │
│              │  Avatar  │                                      │
│              └──────────┘                                      │
│             Display Name                                       │
│              @username                                         │
│         Bio paragraph centered                                 │
│                                                                │
│  ── PROJECTS ────────────────────────────────────────────────  │
│  Graphic Novels                                                │
│  [cover][cover][cover]                                         │
│  Novels                                                        │
│  [cover][cover]                                                │
│                                                                │
│  ── CHARACTERS ─────────────────────────────────────────────  │
│  [portrait][portrait][portrait][portrait][portrait]            │
│                                                                │
│  ── WORLDS ─────────────────────────────────────────────────  │
│  [cover + name][cover + name][cover + name]                    │
│                                                                │
│  ── GALLERY ────────────────────────────────────────────────  │
│  [img][img][img][img][img]   ← Phase 2                         │
│                                                                │
│  ── PUBLISHED WORK ─────────────────────────────────────────  │
│  [PDF card][External link]   ← Phase 3, no store              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Explore hub — `/explore`

```text
┌────────────────────────────────────────────────────────────────┐
│ [CharID logo]     Explore    [Search...................]     │
├────────────────────────────────────────────────────────────────┤
│  Browse                                                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │ Graphic │ │  Film / │ │Children's│ │ Novels  │ │  Other  │ │
│  │ Novels  │ │  Anim   │ │  Books   │ │         │ │         │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│  │Characters│ │ Worlds  │ │ Artwork │ │ Creators│             │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘             │
├────────────────────────────────────────────────────────────────┤
│  Featured Projects                              [See all →]    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ cover    │ │ cover    │ │ cover    │ │ cover    │         │
│  │ Title    │ │ Title    │ │ Title    │ │ Title    │         │
│  │ @creator │ │ @creator │ │ @creator │ │ @creator │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
├────────────────────────────────────────────────────────────────┤
│  Trending Characters                            [See all →]    │
│  [card][card][card][card][card][card]                          │
├────────────────────────────────────────────────────────────────┤
│  Featured Creators                              [See all →]    │
│  [avatar+name][avatar+name][avatar+name]                       │
└────────────────────────────────────────────────────────────────┘
```

### Explore category — `/explore/projects/novels`

```text
┌────────────────────────────────────────────────────────────────┐
│  ← Explore    Novels                                           │
│  Sort: [Newest ▼]  [Most Viewed] [Most Liked] [Trending]      │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ cover    │ │ cover    │ │ cover    │ │ cover    │         │
│  │ Title    │ │ Title    │ │ Title    │ │ Title    │         │
│  │ @user    │ │ @user    │ │ @user    │ │ @user    │         │
│  │ ♥ 12 · 340 views      │ │ ...      │ │          │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│  [Load more]                                                   │
└────────────────────────────────────────────────────────────────┘
```

### Dashboard — portfolio curation (Phase 2)

```text
┌─────────────────────────────┬──────────────────────────────────┐
│ PORTFOLIO EDITOR            │ LIVE SHOWCASE PREVIEW            │
│                             │                                  │
│ Profile [fields]            │ (mirrors /u/{username} layout)   │
│ Featured Characters [pin]   │                                  │
│ Featured Worlds [pin]       │                                  │
│ Gallery [add from assets]   │                                  │
│                             │                                  │
│ [Save Portfolio]            │                                  │
│ [View Public Portfolio →]   │                                  │
└─────────────────────────────┴──────────────────────────────────┘
```

---

## Recommended implementation phases

### Phase 1 — Creator showcase foundation

**Goal:** Public creator page answers "what have they made?"

| # | Deliverable |
|---|-------------|
| 1.1 | Projects section on `/u/{username}` — stories grouped by `project_type` with covers |
| 1.2 | Extend `getPublicPortfolio()` with public stories + cover URLs |
| 1.3 | Profile header layout refresh |
| 1.4 | Dashboard portfolio preview mirrors full showcase layout |
| 1.5 | Remove "Coming Soon" stories placeholder |

**No new tables.** Uses live stories, story_images, worlds, characters.

*Detailed breakdown: [PORTFOLIO_V2_VISION.md](./PORTFOLIO_V2_VISION.md) Phase 1.*

---

### Phase 2 — Curation and gallery

**Goal:** Creators control their highlight reel.

| # | Deliverable |
|---|-------------|
| 2.1 | Featured characters — pin + reorder on profile |
| 2.2 | Featured worlds — pin + reorder |
| 2.3 | Gallery section — curated pointers to existing assets |
| 2.4 | Dashboard curation UI (asset picker from CharID memory) |
| 2.5 | Optional `visibility` field on stories/assets (Preview / Free Download / Private) |

---

### Phase 3 — Explore browse (read-only discovery)

**Goal:** Community can browse public creative work.

| # | Deliverable |
|---|-------------|
| 3.1 | Public `/explore` hub replacing dashboard placeholder |
| 3.2 | Category feeds: projects by type, characters, worlds, creators |
| 3.3 | Artwork feed — aggregated public reference assets |
| 3.4 | Sort: Newest, Recently Updated |
| 3.5 | Pagination / infinite scroll |

**No engagement metrics required for initial Explore.**

---

### Phase 4 — Engagement signals

**Goal:** Ranking and personal save-for-later.

| # | Deliverable |
|---|-------------|
| 4.1 | View counts on public story/character/world pages |
| 4.2 | Likes (authenticated, one per user per object) |
| 4.3 | Bookmarks + dashboard "Saved" list |
| 4.4 | Explore sorts: Most Viewed, Most Liked, Trending |

**Comments:** Evaluate separately — moderation policy required before build.

---

### Phase 5 — Published work and advanced discovery

**Goal:** Finished output and richer discovery.

| # | Deliverable |
|---|-------------|
| 5.1 | `published_works` — PDF, external links, video embeds |
| 5.2 | Published Work section on creator showcase |
| 5.3 | Free Download visibility (file serve — no payment) |
| 5.4 | Featured Projects / Featured Creators / Staff Picks sections |
| 5.5 | Cross-entity search |

---

### Phase 6 — Creator profile enhancements

**Goal:** Professional presentation (art school, industry portfolio).

| # | Deliverable |
|---|-------------|
| 6.1 | Extended profile: tagline, location, links |
| 6.2 | Resume / credits sections |
| 6.3 | Optional PDF export of showcase |

---

## Phase dependency map

```text
Phase 1 (Showcase) ──► Phase 2 (Curation/Gallery)
        │
        └──────────► Phase 3 (Explore browse)
                           │
                           └──────► Phase 4 (Engagement/Ranking)
                                          │
Phase 2 ──────────────────────────────────┴──► Phase 5 (Published Work)
                                                      │
                                                      └──► Phase 6 (Resume)
```

**Recommended next step:** Phase 1 — wire public stories into creator showcase. Explore (Phase 3) should follow once individual creator pages present projects compellingly.

---

## Success metrics (product, not technical)

| Metric | Indicates |
|--------|-------------|
| Creator completes showcase (≥1 project + ≥1 character or world public) | Showcase adoption |
| Visitor clicks from showcase into story/character depth | Engagement with creative work |
| Explore browse sessions | Discovery working |
| Return visits to bookmarked content | Bookmark utility (Phase 4) |

No GMV, conversion, or revenue metrics — not a store.

---

## Summary

| Question | Answer |
|----------|--------|
| What is Creator Showcase? | Public presentation of existing CharID creative work |
| What is Explore? | Cross-creator discovery browse system |
| Is it a store? | **No** — showcase and discovery only |
| Where does content live? | Existing characters, worlds, stories, story assets |
| What are Projects? | Public stories grouped by `project_type` |
| What's first? | Phase 1 — projects on `/u/{username}` |
| What's explicitly deferred? | Comments (moderation), payments, subscriptions |
| Related doc | [PORTFOLIO_V2_VISION.md](./PORTFOLIO_V2_VISION.md) for page-level detail |

CharID becomes the place creators **build** consistent projects and **show** them to the world — and where audiences **find** creative work worth their time.

---

*Document status: Draft for review — no code, migrations, or implementation implied.*
