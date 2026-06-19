# Testing Checklist V1

Founder verification pass before outside creator testing. Work through each flow in order. Log issues in `UX_BUGS_AND_CONFUSION.md`.

**Environment:** local dev or staging with migrations applied and `DATABASE_HEALTHCHECK.sql` showing all Ready.

---

## Character Flow

Route: `/dashboard/characters/[id]`

- [ ] **Create character** — Dashboard → Characters → New character. Name saves; character appears in list.
- [ ] **Complete Identity section** — Fill display name, tagline, pronouns, and other identity fields. Save persists after refresh.
- [ ] **Upload assets** — Add at least one image to the reference gallery. Thumbnail renders; no upload errors.
- [ ] **Assign Canonical role** — Assign one asset to the Canonical slot. Slot badge shows on the asset.
- [ ] **Assign Turnaround roles** — Assign front / side / back (or equivalent turnaround slots). All assigned slots visible.
- [ ] **Complete Character Bible** — Fill bible sections (appearance, personality, backstory, etc.). Completeness indicator updates; no save errors.

**Pass criteria:** Character workspace loads without warnings; bible data survives refresh; slot assignments persist.

---

## World Flow

Route: `/dashboard/worlds/[id]`

- [ ] **Create world** — Dashboard → Worlds → New world. Title and slug save correctly.
- [ ] **Complete World Bible** — Fill canon sections (setting, rules, tone, etc.). Save and refresh confirms data.
- [ ] **Upload world assets** — Add reference images to world gallery. Images display in grid.
- [ ] **Assign asset roles** — Assign slots (e.g. establishing shot, map, key location). Roles show on assets.
- [ ] **Verify no warnings** — No amber “not available yet” banners; no console errors; bible completeness reflects filled sections.

**Pass criteria:** World workspace fully functional; asset roles and bible data persist.

---

## Story Flow

Route: `/dashboard/worlds/[id]/stories/[storyId]`

- [ ] **Create story** — From a world, add a new story. Title and metadata save.
- [ ] **Link characters** — Attach at least one character from the story roster. Linked character appears in story context.
- [ ] **Link world** — Confirm story is scoped to parent world (implicit on create). World context visible on story page.
- [ ] **Add timeline/events** — Add at least one timeline entry or story event in the bible foundation. Entry saves and displays.
- [ ] **Verify Story Bible foundation works** — Story bible sections load, save, and show completeness. No missing-table errors.

**Pass criteria:** Story page loads; character links and bible foundation usable end-to-end.

---

## Portfolio Flow

Route: `/dashboard/portfolio` · Public: `/u/[username]`

- [ ] **Edit portfolio** — Update bio, headline, featured work, and visibility toggles. Changes save.
- [ ] **Preview portfolio** — Use preview mode (if available) or open owner preview on public URL. Layout matches editor.
- [ ] **Publish portfolio** — Set portfolio to public. `is_public` reflects published state.
- [ ] **Verify public URL** — Visit `/u/[your-username]` in a logged-out browser. Portfolio renders with correct content.
- [ ] **Verify private/public behavior** — Set portfolio private; public URL shows access gate or 404. Public characters/worlds respect their own visibility flags.

**Pass criteria:** Published portfolio reachable at public URL; private state hides content from anonymous visitors.

---

## Support Flow

Route: `/dashboard/help`

- [ ] **Submit support ticket** — Fill subject, category, description. Optional screenshot upload. Submit succeeds.
- [ ] **Verify ticket appears** — Ticket listed under “Your recent tickets” on Help page with correct status.
- [ ] **Verify founder can see it** — Admin dashboard → Support section shows ticket in recent list and category counts update.

**Pass criteria:** No “Support tickets not available yet” message; ticket visible to creator and founder.

---

## Founder Dashboard Flow

Route: `/dashboard/admin` (requires `profiles.role = 'admin'`)

- [ ] **Verify admin access** — Non-admin users blocked. Admin user sees full dashboard.
- [ ] **Verify moderation** — Moderation section shows counts; link to `/dashboard/admin/moderation` works.
- [ ] **Verify support metrics** — Open / in progress / resolved counts and recent tickets populate.
- [ ] **Verify creator feedback metrics** — Average rating, distribution, and recent feedback render (or empty states if none).
- [ ] **Verify content metrics** — Character/world/story counts and public/private breakdown match Supabase.
- [ ] **Verify database health** — Database Health section shows Ready for all components (or documents Missing/Warning with remediation).

**Pass criteria:** All dashboard sections load without errors; database health aligns with `DATABASE_HEALTHCHECK.sql`.

---

## After testing

1. Record every issue in `UX_BUGS_AND_CONFUSION.md`.
2. Triage items into `BETA_READINESS_PLAN.md` (Critical / Important / Nice To Have).
3. Re-run `supabase/DATABASE_HEALTHCHECK.sql` if any migration fixes were applied.
