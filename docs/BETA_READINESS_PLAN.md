# Beta Readiness Plan

Prepare CharID for outside creator testing. Focus: usability, reliability, and creator onboarding.

**Out of scope for beta prep:** AI generation, social features, marketplace.

**Status key:** `[ ]` open · `[~]` in progress · `[x]` done

---

## Critical Before Beta

Must be resolved before inviting external creators.

### Infrastructure

- [ ] `DATABASE_HEALTHCHECK.sql` — all 7 table rows Ready + `__OVERALL__` ALL READY
- [ ] Founder Dashboard database health — all components Ready
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in production/staging for founder analytics
- [ ] Founder admin role assigned for at least one operator account

### Core creator workflows

- [ ] Character flow passes full checklist (create → bible → assets → slots)
- [ ] World flow passes full checklist (create → bible → assets → roles)
- [ ] Story flow passes full checklist (create → link characters → story bible)
- [ ] Portfolio publish flow works (edit → preview → public URL)

### Support & safety

- [ ] Support ticket submit + founder visibility verified
- [ ] Moderation queue accessible to admin; flagged content reviewable
- [ ] No “not available yet” errors on platform-hardening features

### UX issues (Critical)

_Add from `UX_BUGS_AND_CONFUSION.md` as discovered._

---

## Important Before Beta

Should be resolved; beta can proceed with documented workarounds if needed.

### Onboarding

- [ ] First-time creator path is obvious (dashboard → create character)
- [ ] Empty states explain what to do next on characters, worlds, stories
- [ ] Portfolio editor explains public vs private before publish
- [ ] Help / support link visible from dashboard

### Support workflow

- [ ] Support categories cover expected issue types (bug, account, feature)
- [ ] Ticket confirmation feedback after submit
- [ ] Founder can triage tickets without opening Supabase

### Moderation workflow

- [ ] Upload paths trigger moderation scan without blocking saves incorrectly
- [ ] Admin moderation queue shows actionable detail (entity, risk, status)
- [ ] Approve/remove actions persist and reflect in queue counts

### Portfolio workflow

- [ ] Public portfolio URL shareable and stable (`/u/[username]`)
- [ ] Featured work selection reflects editor choices
- [ ] Private characters/worlds hidden on public portfolio

### UX issues (Important)

_Add from `UX_BUGS_AND_CONFUSION.md` as discovered._

---

## Nice To Have

Improve before or during beta; not blockers.

### Mobile

- [ ] Dashboard usable on phone (navigation, forms, uploads)
- [ ] Portfolio public pages readable on mobile
- [ ] Character/world asset grids usable on small screens
- [ ] Admin dashboard acceptable on tablet (founder-only)

### Polish

- [ ] Consistent loading and error states across workspaces
- [ ] Bible completeness indicators accurate across character/world/story
- [ ] Funnel metrics on founder dashboard validated against manual counts

### Documentation

- [ ] `TESTING_CHECKLIST_V1.md` completed by founder
- [ ] Known limitations documented for beta invite email

### UX issues (Nice To Have)

_Add from `UX_BUGS_AND_CONFUSION.md` as discovered._

---

## Pre-beta verification sequence

1. Run `supabase/DATABASE_HEALTHCHECK.sql` in Supabase SQL Editor.
2. Complete `TESTING_CHECKLIST_V1.md` end-to-end.
3. Log issues in `UX_BUGS_AND_CONFUSION.md`.
4. Triage into this document.
5. Fix Critical items; re-run healthcheck and affected checklist sections.
6. Invite 1–3 trusted creators; expand after first feedback round.

---

## Beta invite criteria

Ready to invite external creators when:

- All **Critical Before Beta** items checked
- No open Critical UX issues
- Database health Ready across all 7 dashboard components
- Founder can monitor support, moderation, and funnel from admin dashboard
