# Character Relationships V1

**Status:** Future architecture — **planning only, no implementation**  
**Date:** 2026-06-14  
**Version:** 1.0  
**Authority:** [CHARID_VISION_V3.md](./CHARID_VISION_V3.md) · [PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md](./PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md)  
**Related:** [CHARACTER_CLASSIFICATION_V2.md](./CHARACTER_CLASSIFICATION_V2.md) · [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) · [ARCHITECTURE_COMPATIBILITY_REPORT.md](./ARCHITECTURE_COMPATIBILITY_REPORT.md) · [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md)

---

## Purpose

Define **Character Relationships** as a **first-class storytelling object** — not free-text notes buried inside character records.

Relationships power:

- Creator understanding of cast dynamics
- Scene and story continuity (“who is with whom, and how?”)
- Reference Graph and Context Packet enrichment
- Future AI generation that respects canon bonds

**Continuity architecture is unchanged.** Character Bible, World Bible, Story Bible, Reference Graph, and Context Packet remain. Relationships **extend** the graph — they do not replace bibles or character identity fields.

---

## Founder discovery

| Finding | Implication |
|---------|-------------|
| **Relationships are storytelling objects** | Parent/child, rival, mentor, daemon, mount — these drive plot, not metadata |
| **Free-text backstory is insufficient** | “Lyra’s best friend is Roger” in a textarea is not queryable or scene-aware |
| **Special bonds need typed labels** | Daemon, familiar, companion, mount — distinct from generic “friend” |
| **Relationships span stories** | Gandalf ↔ Frodo persists across LOTR books; project-scoped, not story-only |
| **Relationships cross worlds** | Multiverse pairs (Will ↔ Lyra) are project-level, not world-owned |
| **Direction matters** | Mentor → Student is not symmetric; Parent → Child has an inverse |
| **Scenes need relationship context** | A confrontation scene between rivals should inherit rivalry without re-entry |

**Verdict:** Relationships belong in the **Project-centered IA** as a peer of Characters — linked in a **relationship graph** that feeds continuity and future AI.

---

## Canonical project structure (updated)

```
Project
├ Stories
├ Worlds
├ Characters
├ Relationships
├ Assets
└ Scenes
```

Scenes remain under Story → Chapter in the narrative hierarchy. Relationships are **horizontal** — edges between characters — not nested under a single character row.

---

## Relationship types (V1 vocabulary)

### Preset labels (creator-facing)

| Type | Directional | Typical inverse | Notes |
|------|-------------|---------------|-------|
| **Parent** | Yes | Child | Family line |
| **Child** | Yes | Parent | |
| **Sibling** | Symmetric | Sibling | Same relationship both ways |
| **Friend** | Symmetric* | Friend | *Can be stored once or mirrored |
| **Best Friend** | Symmetric* | Best Friend | Stronger than Friend |
| **Rival** | Symmetric* | Rival | |
| **Enemy** | Symmetric* | Enemy | |
| **Mentor** | Yes | Student | |
| **Student** | Yes | Mentor | |
| **Partner** | Symmetric* | Partner | Romantic or professional |
| **Spouse** | Symmetric* | Spouse | |
| **Companion** | Yes | — | Travel companion; inverse optional |
| **Familiar** | Yes | Owner / Guardian | Magical bond |
| **Daemon** | Yes | Human | His Dark Materials — bound soul |
| **Mount** | Yes | Rider / Owner | Dragon, horse, vehicle creature |
| **Owner** | Yes | Familiar / Mount / Pet | |
| **Guardian** | Yes | Ward | |
| **Custom** | Configurable | Creator-defined inverse label | Escape hatch |

**Custom** allows professionals to define “Sworn Shield”, “Apprentice”, “Co-conspirator” without schema changes. Presets cover 90% of child and hobbyist use.

### Direction model

| Mode | Behavior | Example |
|------|----------|---------|
| **Directed** | A → B label may differ from B → A | Mentor(Lyra) → Student(Will) wrong; Mentor(Gandalf) → Student(Frodo) |
| **Symmetric** | One edge; both endpoints share label | Friend(A, B) |
| **Paired directed** | Two linked rows or auto-inverse | Parent(Lyra) → Child(Pantalaimon) + Child → Parent |

**Implementation recommendation:** Store **directed edges** always. Symmetric types auto-create or display inverse with the same label. Directed types use explicit `inverse_type` or companion row.

---

## Data model (planning sketch)

### Core table: `character_relationships`

```sql
-- Planning only — NOT for migration yet

create table public.character_relationships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,

  from_character_id uuid not null references public.characters(id) on delete cascade,
  to_character_id uuid not null references public.characters(id) on delete cascade,

  relationship_type text not null,
  -- preset slug: parent, child, friend, mentor, daemon, custom, ...
  inverse_type text,
  -- when directed: inverse label for to → from (e.g. student for mentor edge)

  custom_label text,
  -- when relationship_type = 'custom': creator-facing label both ways unless directed

  strength text default 'primary'
    check (strength in ('primary', 'secondary', 'background')),
  -- narrative prominence: main cast bond vs mention

  is_public boolean not null default false,
  notes text,
  -- optional free text — supplements, never replaces, typed edge

  started_at_story_id uuid references public.stories(id) on delete set null,
  ended_at_story_id uuid references public.stories(id) on delete set null,
  -- optional: relationship begins/ends in narrative (Phase E+)

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (from_character_id <> to_character_id),
  unique (project_id, from_character_id, to_character_id, relationship_type)
);
```

### Scope rules

| Scope | Rule |
|-------|------|
| **Project** | Every relationship belongs to one project — spans all stories/worlds in that IP |
| **Story** | Optional `started_at_story_id` / `ended_at_story_id` for arc-specific bonds |
| **World** | No world_id on edge — world context comes from characters + scenes |
| **Scene** | Future: `scene_relationship_context` or derived from cast pairs in scene |

### Junction: story-visible relationships (optional)

When a story roster should **highlight** subset of project relationships:

```sql
-- Optional denormalized view or materialized filter
-- story_id + relationship_id for "relationships active in this story"
```

Default: all project relationships where **both endpoints** are on the story roster (computed, not stored).

### Relationship graph (logical)

```
Character A ──[mentor]──► Character B
Character B ──[student]──► Character A   (paired or inverse_type)

Character C ──[daemon]──► Character D
Character D ──[human]──► Character C       (Pan ↔ Lyra pattern)
```

Graph is **project-scoped**. Query: all edges where `from_character_id` or `to_character_id` in cast set.

---

## UX model

### Creator-facing name

**Relationships** — not “Character links”, “Social graph”, or “Edges”.

### Surfaces

| Surface | Purpose |
|---------|---------|
| **Project → Relationships** | Browse all bonds in the universe (table or graph view) |
| **Character page → Relationships** | “Who is this character connected to?” — filtered ego graph |
| **Story page → Cast dynamics** | Relationships among story roster — compact list or diagram |
| **Scene workspace** | When two+ characters present, show active bonds between them |
| **Add relationship modal** | Pick Character A, Character B, type, optional notes |

### Add relationship flow

```
1. Creator opens Character (Lyra) or Story cast section
2. Clicks "Add relationship"
3. Picks other character (Pantalaimon) — search project cast
4. Picks type: Daemon (directed: Lyra → Pan)
5. Optional note: "Can only travel so far apart"
6. Save → edge appears on both character pages
```

**Child-simple defaults:** Preset chips (Friend, Family, Rival, Companion) before full type list.

### Display rules

| Rule | Detail |
|------|--------|
| **Plain language** | Show “Best friend”, not `best_friend` slug |
| **Direction shown when it matters** | “Gandalf is Frodo’s mentor” — not symmetric glyph |
| **No graph jargon** | “Connections” or “Relationships” in UI |
| **Custom without dead ends** | Custom label + optional inverse |

### Graph visualization (future, optional)

- **Ego graph** on character page (1 hop)
- **Story cast map** on story advanced plan — optional, not default for children
- Power users: project-level relationship diagram (Phase E+)

---

## Creator workflow

### Simple path (child)

```
Create characters → Add relationship (Friend / Companion) → Write story
```

Relationships appear when adding characters to a story — “Roger is already Lyra’s friend” surfaces automatically.

### Professional path

```
Project → define cast → map relationship web → assign to stories → scenes inherit context
```

- Import relationship from template (“Found family”, “Rival pair”) — future
- Mark relationship **starts** in Story 2, **ends** in Story 5
- Custom types for IP-specific bonds

### Integration with existing workflows

| Existing | Relationship layer |
|----------|-------------------|
| Story roster (`story_characters`) | Auto-suggest relationships between roster members |
| Character backstory (free text) | Notes field on edge — not replacement |
| Story bible character **notes** tab | Stays for narrative detail; relationships are structured |
| Special trait: Companion ([CHARACTER_CLASSIFICATION_V2.md](./CHARACTER_CLASSIFICATION_V2.md)) | Trait = identity; Relationship = bond to named character |

**Pan (daemon):** Character Type = Spirit; Special Trait = Companion; **Relationship** = Daemon (Lyra → Pan).

---

## Continuity implications

### Reference Graph extension

Today the Reference Graph links **character ↔ image slots**. V1 extension adds **character ↔ character** edges as graph nodes:

```
ReferenceGraph (extended)
├── characterId
├── image nodes (existing)
└── relationshipEdges[]
    ├── toCharacterId
    ├── type
    ├── label
    └── strength
```

Assembly in `assemble-reference-graph.ts` (future): load project relationships for character and neighbors.

### Context Packet extension

```json
{
  "character": { "...": "..." },
  "relationships": [
    {
      "toCharacterId": "...",
      "toCharacterName": "Pantalaimon",
      "type": "daemon",
      "label": "Daemon",
      "direction": "from",
      "notes": "Cannot stray far from Lyra"
    }
  ],
  "sceneRelationshipContext": [
    {
      "between": ["lyra-id", "roger-id"],
      "type": "best_friend",
      "label": "Best friends"
    }
  ]
}
```

Scenes with multiple characters receive **pairwise relevant edges** from project graph filtered by present cast.

### Story and Scene awareness

| Layer | Relationship behavior |
|-------|----------------------|
| **Story** | Show all edges where both characters on roster |
| **Chapter** | Unchanged — relationships are not chapter-scoped |
| **Scene** | Highlight bonds between characters **in this scene** |
| **Comic panel** (Phase B+) | Optional: dialogue generation respects rival/mentor context |

### Continuity checks (future)

| Check | Example |
|-------|---------|
| **Orphan bond** | Relationship references deleted character — warn |
| **Conflicting types** | A is Mentor and Rival to B — allow but surface |
| **Story scope** | Relationship ended in Story 3 — warn if scene in Story 5 treats them as spouses |
| **Cross-project** | Block edges across projects — characters must share `project_id` |

**CharID remembers relationships** — same principle as “CharID remembers” for visual canon.

---

## AI implications

Per [AI_CREATION_CONTROL_PRINCIPLE.md](./AI_CREATION_CONTROL_PRINCIPLE.md): AI accelerates; creator controls. Relationships feed AI as **structured canon**, never auto-written without review.

| Use case | Relationship role |
|----------|-------------------|
| **Scene summary draft** | “Lyra and Roger (best friends) enter the cave” |
| **Dialogue tone** | Mentor/student register vs rival banter |
| **Image generation** | Two-character shot: include relationship label in context packet |
| **Proposed structure** | AI may **suggest** relationships in review UI — creator approves before persist |
| **Consistency check** | “This scene treats them as strangers but they are spouses in canon” |

**Do not** infer relationships solely from backstory text without creator confirmation in V1.

---

## Relationship graph concepts

### Terminology (internal)

| Term | Meaning |
|------|---------|
| **Edge** | One directed or symmetric relationship row |
| **Ego network** | All edges for one character |
| **Cast subgraph** | Edges induced by story roster |
| **Scene subgraph** | Edges between characters present in scene |
| **Relationship Graph** | Project-scoped multigraph of character edges |

### Distinction from Reference Graph

| Graph | Nodes | Edges |
|-------|-------|-------|
| **Reference Graph** | Image assets, slots | Character ↔ image assignments |
| **Relationship Graph** | Characters | Character ↔ character bonds |

Both compile into **Context Packet**. Creators never see “graph” — they see **Relationships** and **Reference images**.

### Distinction from Story roster

| Concept | Meaning |
|---------|---------|
| **Story roster** | Who appears in this story |
| **Relationship** | How two characters are connected **in the project** |

Roster membership ≠ relationship. A character can be on roster with no defined relationship (guest). Relationship can exist before character joins a story (prequel planning).

---

## Examples

| Characters | Types | Direction | Project scope |
|------------|-------|-----------|---------------|
| Lyra ↔ Pantalaimon | Daemon | Lyra → Pan | His Dark Materials |
| Lyra ↔ Roger | Best Friend | Symmetric | HDM |
| Gandalf → Frodo | Mentor → Student | Directed pair | LOTR project |
| Smaug ↔ Thorin | Enemy | Symmetric | Hobbit project |
| Child → Dog | Owner → (pet) | Directed; dog may use Companion trait | Afternoon comic |
| Rider → Dragon | Mount | Directed | Fantasy project |
| Will ↔ Lyra | Friend → (cross-world) | Symmetric; project spans worlds | HDM |

---

## Migration recommendations

**No migration until Phase E (Project object) or dedicated relationship slice.**

### Recommended order

| Stage | Work |
|-------|------|
| **E0** | `projects` table exists ([PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md](./PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md)) |
| **E1** | `character_relationships` table + RLS |
| **E2** | Character page + story cast relationship UI |
| **E3** | Reference graph + context packet extension |
| **E4** | Scene relationship context |
| **E5** | Project relationships browse + optional graph viz |

### Backfill

- No automatic backfill from free-text backstory (too error-prone)
- Optional founder tool: suggest relationships from notes — human approve

### Interim (before Project)

- Store `project_id` nullable; default to user’s **default project** per backfill
- Or defer entirely until Project ships

---

## Implementation recommendations

| Priority | Deliverable | Phase |
|----------|-------------|-------|
| **P1** | Types + preset vocabulary | Phase E |
| **P1** | `character_relationships` migration | Phase E |
| **P2** | Add relationship modal (contextual on character + story) | Phase E |
| **P2** | Ego list on character page | Phase E |
| **P3** | Context packet `relationships[]` slice | Phase E / F |
| **P3** | Scene pairwise context | Phase E (with Scenes) |
| **P4** | Project relationships page | Phase E |
| **Defer** | Auto-infer from backstory | Not V1 |
| **Defer** | Full graph visualization | Optional pro feature |

**Do not block Phase A–D** (workflow, comics, publish) on relationships. Relationships enhance continuity depth for Phase E+ and AI (Phase F).

---

## Rationale summary

| Audience | Need | Relationships V1 |
|----------|------|------------------|
| **Child** | “Roger is Lyra’s friend” | Preset types, simple add flow |
| **Hobbyist** | Cast dynamics across chapters | Project-scoped, story-visible |
| **Professional** | IP bible with bond web | Custom types, story arc bounds, graph |
| **Continuity engine** | Structured context | Reference Graph + Context Packet extension |
| **Future AI** | Tone and consistency | Relationship-aware scene packets |

**Simple bonds on the surface. A full relationship graph underneath.**

---

## Document index

| Doc | Relationship |
|-----|--------------|
| [PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md](./PROJECT_CENTERED_INFORMATION_ARCHITECTURE.md) | Project tree includes Relationships |
| [CHARACTER_CLASSIFICATION_V2.md](./CHARACTER_CLASSIFICATION_V2.md) | Traits vs relationships (Companion trait ≠ bond to named character) |
| [SCENE_ARCHITECTURE_V1.md](./SCENE_ARCHITECTURE_V1.md) | Scenes consume relationship context |
| [ASSET_SYSTEM_V1.md](./ASSET_SYSTEM_V1.md) | Assets orthogonal — ownership ≠ character bond |

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-06-14 | Initial — first-class relationships, data model, graph, continuity + AI |
