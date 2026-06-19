# Visual Identity — Phase 3 Implementation

**Date:** 2026-06-14  
**Status:** Implemented  
**Authority:** [VISUAL_IDENTITY_V1.md](./VISUAL_IDENTITY_V1.md) · [BRAND.md](./BRAND.md) · [HOMEPAGE_V2_CREATIVE_STUDIO.md](./HOMEPAGE_V2_CREATIVE_STUDIO.md)

Phase 3 delivers the **Sunset Creative Studio** visual identity: two first-class themes, a redesigned marketing homepage, art-forward cards, encouraging empty states, and theme selection in Settings. **No schema, routing, business logic, workflow, permission, or AI architecture changes.**

---

## Summary

| Deliverable | Status |
|-------------|--------|
| Sunset Light theme | ✅ Default CSS + `data-theme="sunset-light"` |
| Sunset Dark theme | ✅ `data-theme="sunset-dark"` |
| Theme toggle (Settings → Appearance) | ✅ |
| System preference on first visit | ✅ |
| Marketing homepage redesign | ✅ |
| Improved list cards | ✅ Project, Story, Character, World |
| Improved empty states | ✅ Shared component + copy |
| Updated design tokens | ✅ `globals.css`, `visual-identity.ts` |

---

## Theme system

### Themes

| Theme | Background | Surface | Text | Borders |
|-------|------------|---------|------|---------|
| **Sunset Light** | `#FAF8F5` | `#FFFFFF` | `#1C1917` | `#E7E5E4` |
| **Sunset Dark** | `#0F0C0A` | `#1A1614` | `#F5F5F4` | `#292524` |

**Shared accents:** amber `#F59E0B`, orange `#F97316`, blush `#FB7185`  
**Supporting only:** lavender `#A78BFA` — links/focus, never dominant CTAs

### Implementation

| File | Role |
|------|------|
| `src/lib/theme.ts` | Theme IDs, storage key, init script, helpers |
| `src/components/theme/ThemeProvider.tsx` | React context; syncs DOM + localStorage |
| `src/app/layout.tsx` | Inline init script (no flash); wraps app in provider |
| `src/app/globals.css` | CSS variables per `[data-theme]` |
| `src/components/settings/SettingsAppearancePanel.tsx` | Settings → Appearance UI |
| `src/app/dashboard/settings/` | Settings page (replaces placeholder) |

### Preference resolution

1. Saved `localStorage` key `charid-theme` → use saved theme  
2. No saved preference → `prefers-color-scheme: dark` → Sunset Dark, else Sunset Light  
3. System preference changes apply **only when no saved preference**

---

## Design tokens (Phase 3)

### New / updated CSS variables

| Token | Purpose |
|-------|---------|
| `--studio-gradient-hero` | Marketing hero wash |
| `--studio-gradient-card` | Showcase frames |
| `--studio-gradient-empty` | Empty covers / placeholders |
| `--studio-ambient` | Dashboard shell ambient background |
| `--brand-warm-accent-rose` | Blush accent |

### Tailwind library (`src/lib/visual-identity.ts`)

Updated for theme-aware surfaces:

- `studioCardSurface` — rounded-2xl, minimal border, art-first hover
- `studioPanel` / `studioSection` — use `var(--brand-border)` and `var(--brand-surface)`
- `studioMarketingHeadline` / `studioMarketingSectionTitle` / `studioMarketingBody`
- `studioShowcaseFrame` — editorial showcase blocks
- CTAs remain **amber → orange** gradient (not violet)

---

## Marketing homepage

**File:** `src/components/marketing/HomePageContent.tsx`  
**Header:** `src/components/marketing/MarketingHeader.tsx`

### Messaging shift

| Before | After |
|--------|-------|
| “Create characters, worlds, and stories that stay consistent” | “A place where stories begin.” |
| Feature-card SaaS explainer | Idea → Story → Scene → Comic → Publish pipeline |
| Violet-primary CTAs | Sunset amber CTAs |

### Sections

1. **Hero** — editorial headline, warm gradient, art strip placeholders  
2. **How it works** — five-step pipeline  
3. **Character showcase** — large art frame, minimal chrome  
4. **World showcase** — maps / locations / mood  
5. **AI collaboration** — partner framing (suggest scenes/chapters, generate covers)  
6. **Publish** — studio → portfolio path  
7. **Final CTA** — Start your first project  

---

## Cards

| Component | Changes |
|-----------|---------|
| `ProjectCard` | 16:10 cover, larger title, warmer hover, simplified metadata |
| `StoryCard` | 16:10 cover, encouraging empty summary copy |
| `CharacterCard` | 4:5 portrait ratio, theme-aware text |
| `WorldCard` | 16:10 cover, removed violet hover |
| `CardCoverPlaceholder` | Theme-aware gradient empty covers |
| `ProjectCharactersSection` | Uses `studioCardSurface` + portrait ratio |

Grid gaps increased on projects list (`gap-5`).

---

## Empty states

**Copy:** `src/lib/studio-empty-copy.ts`  
**Component:** `src/components/studio/StudioEmptyState.tsx`

| Entity | Headline |
|--------|----------|
| Project | What do you want to create? |
| Story | Every story starts somewhere. |
| Character | Who do you want to meet? |
| World | What kind of place are we exploring? |
| Scene | What happens next? |
| Studio (home) | Your studio is waiting for its first image. |

### Surfaces updated

- Dashboard home recent work  
- Projects, Characters, Worlds list pages  
- Project stories / characters sections  
- Story scenes panel  

---

## Dashboard shell

**File:** `src/components/dashboard/DashboardShell.tsx`

- Ambient background uses `--studio-ambient` (amber wash; minimal lavender)  
- Sidebar subtitle: “Creative Studio”  
- Theme-aware sidebar border/background  

**File:** `src/app/dashboard/DashboardHomeView.tsx` — CSS variable text colors

---

## Founder test checklist

After deploy, open in order and ask: *“Software or studio?”*

1. `/` — marketing homepage  
2. `/dashboard` — studio home  
3. `/dashboard/projects` — project gallery  
4. Story workspace  
5. World workspace  
6. Character workspace  
7. `/dashboard/settings` — toggle Sunset Light ↔ Sunset Dark  

**Pass:** Warm, art-forward, inviting — not SaaS dashboard or AI control panel.

---

## Out of scope (unchanged)

- Database schema  
- Routing  
- Business logic / workflows  
- Permissions  
- AI architecture  
- Full workspace token migration (many internal panels still use legacy zinc classes — future pass)

---

## Files changed (primary)

```
src/app/globals.css
src/app/layout.tsx
src/app/page.tsx
src/app/dashboard/DashboardHomeView.tsx
src/app/dashboard/settings/
src/components/marketing/HomePageContent.tsx
src/components/marketing/MarketingHeader.tsx
src/components/theme/ThemeProvider.tsx
src/components/settings/SettingsAppearancePanel.tsx
src/components/studio/StudioEmptyState.tsx
src/components/studio/CardCoverPlaceholder.tsx
src/components/project/ProjectCard.tsx
src/components/project/ProjectStoriesSection.tsx
src/components/project/ProjectCharactersSection.tsx
src/components/StoryCard.tsx
src/components/CharacterCard.tsx
src/components/WorldCard.tsx
src/components/dashboard/DashboardShell.tsx
src/components/dashboard/DashboardSidebar.tsx
src/components/dashboard/HomeRecentWork.tsx
src/components/scene-workspace/StoryScenesPanel.tsx
src/lib/theme.ts
src/lib/visual-identity.ts
src/lib/studio-empty-copy.ts
```

---

## Verification

```bash
npx tsc --noEmit
npm run build
```

Both pass as of 2026-06-14.
