# Creator Economy and Rights

**Status:** Policy draft — basis for future Terms of Service, Privacy Policy, and creator licensing.  
**Effective when:** ToS published at Stripe / AI launch (whichever comes first).  
**Principle:** Creator-first. CharID hosts and tools creator IP; it does not own it.

---

## Summary

| Topic | CharID position |
|-------|----------------|
| **Ownership** | Creators own characters, worlds, stories, uploads, and AI outputs from their projects |
| **Default privacy** | Private |
| **CharID IP claim** | None on creator content |
| **Marketing use** | Public content only, with consent in platform terms |
| **Commercial use** | Tier-dependent (see Commercial Rights) |
| **Remix** | Opt-in per project; never assumed |

This document aligns with the product model: **Character → World → Story → Continuity → Portfolio → Publishing**. AI assists creation; it does not transfer ownership to CharID or to third-party model providers beyond the license needed to operate the service.

---

## Ownership

Creators retain all intellectual property rights in their work, subject only to the limited licenses they grant CharID to host and operate the platform (see CharID Rights).

### What creators own

| Asset | Owner | Notes |
|-------|-------|-------|
| **Characters** | Creator | Including identity, bible text, metadata, and relationships |
| **Worlds** | Creator | Including world bible, rules, setting, and linked lore |
| **Stories** | Creator | Including plot, timeline, chapters, and story bible |
| **Uploaded assets** | Creator | Photos, art, documents, and reference files the creator uploads |
| **Generated assets** | Creator | Images, text, or other outputs created **from the creator’s projects** using CharID tools (including AI), when generated under the creator’s account and tied to their character/world/story |

### What CharID does not own

- Creator names, character names, world names, or story titles
- Creator bible content, notes, or private drafts
- Creator-uploaded or AI-generated visuals assigned to creator projects
- Any right to sublicense creator IP to third parties for their own products

### AI-generated content

When a creator uses AI features (future):

1. **Input** (bible text, prompts, references, slot assignments) remains creator-owned.
2. **Output** is treated as **creator-owned** for use within CharID and under the creator’s subscription tier (see Commercial Rights).
3. CharID does not claim ownership because generation ran on CharID infrastructure or through third-party APIs.
4. Third-party AI providers may impose their own terms on API usage; CharID selects providers that allow creator-facing commercial use where required by paid tiers. Provider terms are disclosed in the ToS subprocessor list.

### Account deletion

On account deletion, creators may export their content where the product supports export. CharID deletes or anonymizes hosted copies per the Privacy Policy. Deletion does not transfer ownership—it ends the hosting license.

---

## Privacy

CharID defaults to **private**. Creators choose what to share.

### Default: Private

- New **profiles**, **characters**, **worlds**, and **stories** default to **private** (`is_public = false` in the current product).
- Private content is visible only to the creator (and platform systems required to operate the service: storage, moderation, support).
- Private content is **not** indexed for discovery, **not** shown on public portfolios, and **not** eligible for CharID marketing use.

### Optional visibility levels

Creators may set visibility per entity (and portfolio) when the product supports it:

| Level | Who can view | Discovery | Portfolio / public URL |
|-------|--------------|-----------|-------------------------|
| **Private** | Creator only | No | Hidden |
| **Public** | Anyone with link or public portfolio | No broad discovery | Shown on creator’s public portfolio when published |
| **Discoverable** | Public + listed in CharID explore/search (when available) | Yes | Shown in discovery surfaces |
| **Remixable** | Public/discoverable **and** others may create derivative works per Remix Permissions | Per discoverable rules | Remix terms displayed on project |

**Hierarchy:** Private is the baseline. Public, Discoverable, and Remixable are **explicit opt-in** upgrades. Setting a parent portfolio to private hides public children from anonymous visitors even if a child flag were mis-set—portfolio publish remains the gate for public presence.

### Stories and chapters

Stories inherit visibility from world and portfolio context unless overridden. Published chapters on a public story follow the story’s visibility. Draft or private stories remain creator-only.

---

## Remix Permissions

Remixing is **never on by default**. It applies per **project** (character, world, or story—whichever is designated the remixable unit in the UI).

### Levels

| Permission | Meaning |
|------------|---------|
| **No remixing** | Default. Others may view (if public) but may not copy, fork, or derive new projects from this work |
| **Remix with attribution** | Others may create derivative projects inside CharID with mandatory credit to the original creator |
| **Remix allowed** | Others may fork/remix for non-commercial personal use within CharID |
| **Commercial remix allowed** | Others may use derivatives in commercial work, subject to attribution and platform rules |

### Rules

1. **Remixable** visibility (or explicit remix permission) is required before any remix level above “No remixing.”
2. **Attribution** must include original creator username and link to source project when the platform supports remix chains.
3. **Remix does not transfer ownership** of the original work to the remixer or to CharID.
4. **Remixers own their derivatives** but must comply with the original project’s remix license and CharID ToS.
5. CharID may disable remix on any project that violates policy or receives valid rights complaints.

### Not yet in product

Remix permissions are **policy-first**; UI and schema (`remix_policy`, fork lineage) ship before public remix launch. Until then, all projects are **No remixing**.

---

## CharID Rights

**CharID does NOT own creator IP.**

CharID receives only the licenses needed to operate the service. Creators grant CharID a **non-exclusive, worldwide, royalty-free license** to:

- Host, store, backup, and transmit content
- Display content to users permitted by creator privacy settings
- Process content for moderation, safety, and support
- Run AI features **at the creator’s direction** (when enabled)
- Improve platform reliability (e.g., caching, thumbnails)

This license **ends** when content is deleted, except where retention is required by law or legitimate backup windows.

### Marketing and promotion

CharID may use **public** creator content **only** for:

- Platform promotion (website, social, ads)
- Featured creator showcases
- Marketing examples and tutorials

**Conditions:**

1. Content must be **public** (or Discoverable/Remixable with public visibility).
2. Use must be allowed under the **published Terms of Service** and any in-product “feature me” or showcase consent creators accept.
3. **Private content may never be used for marketing**, training public case studies, or external promotion without separate written permission from the creator.
4. Creators may opt out of showcase programs in settings when that control exists; opt-out does not affect hosting license.

CharID will **not**:

- Sell creator IP
- License creator characters/worlds/stories to third-party AI training datasets without explicit creator consent
- Use private bibles, drafts, or support attachments in marketing

### Moderation and legal

CharID may remove or restrict content that violates law or ToS. Removal is not a claim of ownership.

---

## Commercial Rights

**Commercial use** means use in connection with a business, monetization, client work, merchandise, publishing for sale, or other revenue-generating activity—whether by the creator or a remixer (where remix allows commercial use).

Personal, non-commercial portfolio and hobby use is permitted on all tiers unless otherwise stated in ToS.

### By subscription tier

Aligned with [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md) plans:

| Tier | Price | Personal / portfolio | Commercial use — **uploaded** assets | Commercial use — **AI-generated** assets | Notes |
|------|-------|--------------------|--------------------------------------|------------------------------------------|-------|
| **Free** | $0 | Yes (non-commercial) | **No** | **No** (AI not available) | Hobby and learning; public portfolio allowed |
| **Creator** | $9/mo | Yes | **Yes** — creator’s own uploads | **Yes** — outputs from creator’s projects | Indie creators, small projects |
| **Pro** | $19/mo | Yes | **Yes** | **Yes** | Professional creators; higher credit allowance |
| **Studio** | $49/mo | Yes | **Yes** | **Yes** | Teams and commercial volume; highest credits |

### Clarifications

1. **Uploaded assets:** Creators are responsible for ensuring they have rights to upload reference art (e.g., commissions, licensed stock). CharID does not warrant third-party provenance.
2. **AI-generated assets:** Commercial rights on paid tiers apply to outputs generated **under that creator’s account** while subscribed (or during a grace period defined in ToS). Downgrade to Free does not retroactively revoke rights in already-created commercial work already published under a paid tier, unless ToS states otherwise—**recommended:** grandfather commercial use for assets created while on a paid plan.
3. **Free tier:** Public portfolio is allowed; **commercial exploitation** of CharID-hosted work requires upgrading to Creator or above.
4. **Remix commercial:** Only where original project sets **Commercial remix allowed** and remixer complies with attribution.
5. **Provider limits:** If an AI provider’s terms restrict certain commercial uses, CharID will use commercially licensed providers for paid tiers or disclose limitations in ToS.

### Watermarks and attribution (future)

Free or trial AI outputs may include optional watermarks until ToS finalizes. Paid tiers receive unmarked outputs for creator use subject to this policy.

---

## Relationship to other documents

| Document | Role |
|----------|------|
| [MONETIZATION_AND_AI_ROADMAP.md](./MONETIZATION_AND_AI_ROADMAP.md) | Billing tiers and credits |
| [AI_COST_MODEL.md](./AI_COST_MODEL.md) | Provider economics (not creator rights) |
| [BETA_LAUNCH_PLAN.md](./BETA_LAUNCH_PLAN.md) | Legal checklist before launch |
| Future **Terms of Service** | Binding legal text derived from this policy |
| Future **Privacy Policy** | Data handling, subprocessors, deletion |

---

## Implementation notes (non-binding)

For engineering and product—not legal advice:

- [ ] `remix_policy` enum on characters / worlds / stories
- [ ] `discoverable` flag separate from `is_public` when explore launches
- [ ] Settings: “Allow CharID to feature my public work”
- [ ] Billing: gate AI and commercial rights by `subscriptions.plan`
- [ ] Export bundle on account deletion
- [ ] Display tier commercial rights on `/settings/billing` before checkout

---

## Open questions for ToS counsel

1. Jurisdiction and dispute resolution
2. Exact grace period on downgrade for commercial AI assets
3. DMCA agent and repeat infringer policy
4. Age gate and parental consent
5. EU/UK GDPR lawful basis for AI processing of bible content
6. Whether “Studio” needs explicit team/seat licensing language

---

## Version

| Version | Date | Change |
|---------|------|--------|
| 0.1 | 2026-06-14 | Initial creator-first policy draft pre-Stripe |
