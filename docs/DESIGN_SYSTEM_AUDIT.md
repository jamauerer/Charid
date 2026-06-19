# CharID Design System Audit & Migration

**Date:** June 2026  
**Goal:** Unify the entire application under a single minimalist light visual language — editorial, calm, content-forward (Midjourney / Linear / Notion / Arc).

---

## 1. Audit Findings

### 1.1 Three generations of UI (before migration)

| Generation | Characteristics | Where it appeared |
|------------|-----------------|-------------------|
| **Old (dark SaaS)** | `#141416` panels, `text-zinc-*`, neon violet gradients, heavy shadows, `bg-black/70` modals | Modals, forms, scene workspace, bible editors, portfolio |
| **Middle (amber admin)** | Beige/amber warnings, low-contrast `text-amber-*`, stone borders | Admin dashboard, moderation, support/feedback inboxes |
| **New (light editorial)** | `#FAF8F5` background, white surfaces, `#7C3AED` accent, subtle borders | Partially applied in Phase 3/4 cards, marketing homepage |

### 1.2 Duplicate color definitions (resolved)

Previously scattered across components:

- Hard-coded hex: `#141416`, `#0f0f11`, `#121214`, `#1a1614`
- Tailwind palette: `zinc-*`, `stone-*`, `violet-600`, `amber-500`, `indigo-600`
- Multiple purple accents: `violet-500`, `purple-*`, `#a855f7`, gradient pairs

**Single source of truth now:**

- CSS variables: `src/app/globals.css`
- Reference constants: `src/lib/design-tokens.ts` (`DS` object)
- Tailwind class library: `src/lib/design-system.ts` (`ds*` exports)
- Backward-compat re-exports: `src/lib/visual-identity.ts` → `studio*` aliases

### 1.3 Typography inconsistencies (addressed)

| Element | Before | After |
|---------|--------|-------|
| Page titles | Mixed `text-zinc-100`, `text-stone-50` | `dsPageTitle` → `#171717`, semibold |
| Section labels | Ad-hoc 10px uppercase | `dsSectionLabel` / `dsEyebrow` |
| Body | Low-contrast zinc-400/500 | `dsBody` → `#6B7280` |
| Admin headers | Amber links, stone text | Same tokens as creator studio |

Shared component: `src/components/studio/PageHeader.tsx`

### 1.4 Card & surface inconsistencies (addressed)

| Pattern | Before | After |
|---------|--------|-------|
| Cards | Dark `#141416`, `border-white/10`, `shadow-2xl` | `dsCard` — white surface, `#E5E7EB` border, light hover |
| Modals | Dark panels, 70% black backdrop | `dsModalPanel`, `dsModalBackdrop` (40% black, light surface) |
| Empty states | Dark dashed boxes | Light dashed border on `--brand-surface` |
| Admin metric cards | Dark stone cards | `studioAdminCard` (= `dsPanel`) |

### 1.5 Dark theme remnants (mostly removed)

Converted to light system:

- `FormModalShell`, `CreateModal` modal shells
- `PortfolioEditor` fieldsets, share URL block (was `bg-black/30`)
- Admin recent activity lists (was `bg-black/20`)
- Bulk migration across **142 component files**

**Intentionally kept dark:**

- Optional `sunset-dark` theme in `globals.css` (user choice in Settings → Appearance)
- Image preview wells use `--studio-empty-fill` (neutral gray, not black chrome)

### 1.6 Sidebar active state (fixed)

`DashboardNavItem.tsx`:

- **Inactive:** `#6B7280`, hover → elevated background + darker text
- **Active:** `#171717`, `font-semibold`, **purple left bar** (`dsNavIndicator`) — not faint purple text
- Audited routes: Home, Projects, Stories, Characters, Worlds, Portfolio, Explore, Admin, Moderation

### 1.7 Logo placeholder (added)

`src/components/brand/BrandLogoSlot.tsx` — single swap point wrapping `CharIDLogo`.

Used in:

- `DashboardSidebar`
- `MarketingHeader`

---

## 2. Color System (canonical)

| Token | Value | CSS variable |
|-------|-------|--------------|
| Background | `#FAF8F5` | `--background` / `--brand-background` |
| Surface | `#FFFFFF` | `--brand-surface` |
| Primary text | `#171717` | `--foreground` |
| Secondary text | `#6B7280` | `--brand-text-secondary` |
| Borders | `#E5E7EB` | `--brand-border` |
| Accent | `#7C3AED` | `--brand-accent` |
| Accent hover | `#6D28D9` | `--brand-accent-hover` |
| Success | `#059669` | `--brand-success` |
| Warning | `#D97706` | `--brand-warning` |
| Danger | `#DC2626` | `--brand-danger` |

Default theme is **light-first** (`sunset-light`); dark remains available in settings.

---

## 3. Files Changed

### 3.1 New files

| File | Purpose |
|------|---------|
| `src/lib/design-tokens.ts` | Hex reference constants |
| `src/lib/design-system.ts` | Unified Tailwind class library |
| `src/components/brand/BrandLogoSlot.tsx` | Global logo swap point |
| `src/components/studio/PageHeader.tsx` | Shared page title block |
| `src/components/admin/AdminBackLink.tsx` | Consistent admin navigation back |
| `scripts/migrate-design-tokens.mjs` | Bulk legacy class migration (reusable) |
| `docs/DESIGN_SYSTEM_AUDIT.md` | This document |

### 3.2 Core infrastructure

- `src/app/globals.css` — full light palette + semantic tokens
- `src/lib/visual-identity.ts` — re-exports `design-system`
- `src/lib/theme.ts` — light-first default + init script
- `src/components/dashboard/DashboardNavItem.tsx` — sidebar active fix
- `src/components/dashboard/DashboardSidebar.tsx` — `BrandLogoSlot`, token borders
- `src/components/dashboard/FormModalShell.tsx` — light modal shell
- `src/components/dashboard/CreateModal.tsx` — light create flow
- `src/components/marketing/MarketingHeader.tsx` — `BrandLogoSlot`

### 3.3 List & home views

- `src/app/dashboard/DashboardCharactersView.tsx`
- `src/app/dashboard/DashboardWorldsView.tsx`
- `src/app/dashboard/DashboardStoriesView.tsx`

### 3.4 Admin (aligned with creator studio)

- `src/components/admin/FounderDashboard.tsx`
- `src/components/admin/ModerationQueue.tsx`
- `src/components/admin/SupportInbox.tsx` (bulk migrated)
- `src/components/admin/FeedbackInbox.tsx` (bulk migrated)
- `src/app/dashboard/admin/{moderation,support,feedback}/page.tsx`

### 3.5 Portfolio

- `src/app/dashboard/portfolio/PortfolioEditor.tsx` — dark panels → light

### 3.6 Bulk migration (~142 files)

Automated replacement via `scripts/migrate-design-tokens.mjs`:

- All dashboard forms & modals
- Bible editors (character / world / story)
- Scene workspace components
- Public portfolio pages (`/u/[username]/*`)
- Gallery managers, auth forms, cards, badges

---

## 4. Inconsistencies Fixed

1. **Single accent purple** — removed gradient CTAs (`from-violet-600 to-indigo-600`, amber-orange gradients)
2. **Modal parity** — all shared shells use light surfaces + subtle backdrop
3. **Admin no longer amber-themed** — uses same panels, alerts, and typography as studio
4. **Sidebar selection** — high-contrast active state with purple indicator bar
5. **Warning states** — semantic `dsAlertWarning` instead of low-contrast amber-on-dark
6. **Inputs** — unified `dsInput` focus ring tied to `--brand-accent`
7. **Cards** — `ProjectCard`, `StoryCard`, `WorldCard`, `CharacterCard` use `dsCard` patterns
8. **Theme default** — new users land on light; no system-dark auto-switch
9. **Logo** — centralized in `BrandLogoSlot` for future brand mark

---

## 5. Remaining Areas for Manual Review

These files still contain **isolated** legacy Tailwind tokens (mostly semantic badges, progress bars, or public-page presentation). They are functional but not yet on `ds*` helpers:

| Area | Files | Notes |
|------|-------|-------|
| Scene workspace | `SceneCreateStudio.tsx`, `SceneSuggestionEditStudio.tsx`, `SceneSuggestionStagingPanel.tsx` | Some `amber-*` emphasis on AI-suggested content — consider `dsAlertInfo` |
| Bible metrics headers | `*BibleMetricsHeader.tsx` (character/world/story) | Progress/completion colors may use raw Tailwind |
| Public portfolio | `src/app/u/[username]/**` | Visitor-facing pages; may warrant a separate “public showcase” sub-theme |
| Story banners | `StoryWelcomeBanner.tsx`, `StoryFinishPath.tsx` | Celebratory UI — review tone vs. calm principle |
| Settings appearance | `SettingsAppearancePanel.tsx` | Preview swatches — verify against new tokens |
| Support inbox | `SupportInbox.tsx` | Residual amber status badges |
| Image picker / cover gen | `ImagePickerModal.tsx`, `GenerateCoverReferencesPanel.tsx` | Dense tool UI |
| Start project wizard | `StartNewProjectWizard.tsx` | Multi-step flow — spot-check on device |

**Recommendation:** When touching any of these files next, import from `@/lib/design-system` instead of ad-hoc classes. Re-run:

```bash
node scripts/migrate-design-tokens.mjs
```

### 5.1 Not in scope (by design)

- **New logo design** — placeholder only; swap inside `BrandLogoSlot`
- **Dark mode polish** — optional theme exists; light is the product default
- **Business logic / routing** — no functional changes

---

## 6. Verification

- `npx tsc --noEmit` — pass
- `npm run build` — pass (Next.js 16.2.9)

---

## 7. Usage Guide (for future work)

```tsx
import {
  dsPageTitle,
  dsBtnPrimary,
  dsCard,
  dsInput,
  dsAlertWarning,
} from "@/lib/design-system";
import { PageHeader } from "@/components/studio/PageHeader";
import { BrandLogoSlot } from "@/components/brand/BrandLogoSlot";
```

Prefer CSS variables in one-off cases: `text-[var(--foreground)]`, `border-[var(--brand-border)]`.

Avoid: `text-zinc-*`, `bg-[#141416]`, `from-violet-*`, `border-amber-*` for chrome (amber/warning only via `--brand-warning` semantic alerts).

---

*The interface should disappear into the background and let characters, stories, worlds, and creative work become the focus.*
