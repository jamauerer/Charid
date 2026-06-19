# Character Identity Layer — Research & Architecture Proposal

Product architecture document — **research and design only, no implementation**.

CharID's long-term goal:

> **Preserve character identity across time, generations, stories, and AI models.**

This document investigates whether CharID can derive an internal **identity representation** from creator-provided images — beyond storing pixels — and how that layer integrates with the [Character Bible V1](./CHARACTER_BIBLE_V1.md) and future AI generation.

See also:
- [CHARID_CORE_PRINCIPLE.md](./CHARID_CORE_PRINCIPLE.md)
- [REFERENCE_ASSETS_VISION.md](./REFERENCE_ASSETS_VISION.md)
- [CHARACTER_BIBLE_V1.md](./CHARACTER_BIBLE_V1.md)

**This is NOT facial recognition.** The objective is **consistency preservation** for fictional characters — generating the same character from new angles and in new situations, not identifying real people.

**Images are references. Identity is the asset.**

**Approved requirement:** CharID must preserve identity across **all creative formats** — realistic humans, stylized humans, anime, comic, cartoon, fantasy races, creatures, and anthropomorphic characters. The Identity Layer must **not** optimize exclusively for photorealistic human faces.

---

## 1. Problem statement

### Why prompts and reference images fail

Current AI image workflows typically chain:

```text
Prompt + reference image → side view → expressions → scene later
```

Each step **re-interprets** identity. Even with reference images, most systems condition on pixels or coarse embeddings — they do not preserve a stable internal model of facial structure, proportions, or identity markers. Face drift accumulates across generations.

### CharID's opportunity

CharID already stores structured character memory (Character Bible) and typed reference assets (canonical, turnaround, expressions). The **Character Identity Layer** is the next step: derived geometric and semantic data that future generation can treat as **constraints**, not suggestions.

```text
Today (Character Bible V1):
Character
├── Identity (text)
├── Version state (text)
└── Images (pixels)

Future (Identity Layer):
Character
├── Identity (text)              ← permanent
├── Version state (text)         ← evolving
├── Images (pixels)              ← creator-authored references
└── Identity Layer               ← derived, version-scoped
    ├── Reference graph            ← PRIMARY: multi-view asset links
    ├── Visual identity descriptors ← PRIMARY: semantic + extracted traits
    ├── Fused character embedding  ← multi-ref, style-agnostic
    ├── Archetype + format class   ← routes optional analyzers
    ├── Landmark / region data     ← OPTIONAL enrichment (archetype-specific)
    ├── Proportion data            ← OPTIONAL (humanoid silhouettes)
    └── Adapter compilation cache  ← per-backend generation inputs
```

---

## 2. Architecture overview

### Layer stack

```text
┌─────────────────────────────────────────────────────────────────┐
│  CREATOR LAYER (authoritative — all formats)                     │
│  Character Bible · canonical · turnaround · expressions · refs   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  REFERENCE-FIRST IDENTITY CORE                                   │
│  Multi-view graph · visual descriptors · fused embedding         │
│  Works for realistic, stylized, anime, comic, creature, furry    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  ARCHETYPE-Routed ENRICHMENT (optional, confidence-scored)        │
│  Landmarks · proportions · depth · photoreal-only embeddings     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  ADAPTER COMPILER → AI Context Packet → generation backends      │
└─────────────────────────────────────────────────────────────────┘
```

### Design principles

| Principle | Implication |
|-----------|-------------|
| **Creator authority** | Derived data never overrides bible text or canonical image |
| **Not facial recognition** | No matching against real-person databases; embeddings are character-local |
| **All formats first** | Realistic human face tools are **one optional branch**, not the default path |
| **Reference-first** | Multi-view creator assets are the primary identity substrate for every format |
| **Descriptor-backed** | Structured + extracted visual descriptors generalize where geometry fails |
| **Archetype-routed** | Landmarks and 3D run only when character archetype supports them |
| **Confidence-aware** | Every derived field carries `confidence`, `source_image_id`, `analyzer_version` |
| **Recomputable** | Identity layer can be regenerated when analyzers improve |
| **Privacy** | Derived geometry stays workspace-private; same gates as Character Bible |

### Relationship to Character Bible V1

| Character Bible V1 | Identity Layer |
|--------------------|----------------|
| Creator-authored | Machine-derived |
| Required for consistency workflow | Enhances AI Readiness when present |
| Canonical image slot | Primary input for face analysis |
| Turnaround / expression slots | Multi-view fusion inputs |
| AI Readiness metric | Extended by identity layer completeness |

**Recommended integration:** Identity Layer analysis runs **after** canonical image is set. AI Readiness gains a second tier: *Bible Ready* vs *Identity Layer Ready*.

---

## 3. Research evaluation

### 3.1 Facial landmark extraction

**What it is:** 2D (and sometimes 3D) keypoints for eyes, nose, mouth, jaw, brows, and face contour.

**Established approaches:**

| Tool / method | Landmarks | Speed | Notes |
|---------------|-----------|-------|-------|
| **MediaPipe Face Mesh** | 468 3D points | ~5–30 ms / face (CPU/mobile) | On-device, no GPU required; widely used |
| **face-alignment / FAN** | 68 2D (+ 3D variants) | ~20–50 ms | Used by DECA pipeline |
| **InsightFace landmark** | 5 or 106 points | Bundled with detection | Part of face analysis stack |
| **dlib** | 68 points | Legacy, slower | Still referenced in older pipelines |

**Feasibility:** **High** for human-like faces in clear frontal images.

**Complexity:** **Low–Medium** — mature libraries, JSON-serializable output, no training required.

**Limitations for CharID:**

- Trained primarily on **photorealistic human faces**
- **Illustrated, anime, and heavily stylized** characters: landmark detectors often fail or produce unstable points (large eyes, minimal nose, line-art shading)
- **Non-human species** (dragons, robots): detectors may not run or return meaningless geometry
- **Profile / extreme angles:** accuracy drops; needs turnaround views for fusion

**Recommendation:** Use MediaPipe Face Mesh as **default analyzer** for photorealistic and semi-realistic canonical images. Gate illustrated content through a **style classifier** and skip or use alternate analyzers (see §3.6).

**Storage per image:** ~3–8 KB JSON (468 points × normalized x,y,z + metadata).

---

### 3.2 Body landmark extraction

**What it is:** Skeletal keypoints for pose — shoulders, limbs, hips, spine — enabling proportion ratios.

**Established approaches:**

| Tool | Landmarks | Output |
|------|-----------|--------|
| **MediaPipe Pose / Holistic** | 33 pose + 468 face + hands | Normalized + world coordinates (meters) |
| **OpenPose** | 18–25 body keypoints | 2D coordinates |
| **SMPL / SMPL-X** | Parametric body mesh | 3D body shape + pose parameters |

**Derived proportion metrics (examples):**

```text
shoulder_width / head_height
torso_length / total_height
arm_length / height
leg_length / height
```

**Feasibility:** **Medium** — requires **full-body visible** canonical or turnaround images. Character Bible turnaround front/back helps; portrait-only characters cannot derive body proportions.

**Complexity:** **Medium** — Holistic pipeline is fast; deriving stable ratios requires consistent pose normalization.

**Limitations:**

- Illustrations with exaggerated proportions (chibi, heroic scale) produce ratios that are **correct for the image** but must not be interpreted as real-world anthropometry
- Occluded limbs, capes, long hair → missing landmarks
- Multi-character images → must isolate primary character (largest face / user-selected crop)

**Recommendation:** Extract body landmarks from **turnaround_front** and **turnaround_full** (future role) when available. Store ratios as **character-relative proportions**, not absolute measurements.

**Storage:** ~2–5 KB JSON per analyzed image.

---

### 3.3 Single-image depth estimation

**What it is:** Per-pixel relative (or metric) depth from one RGB image — encodes shading, perspective, and occlusal cues.

**Established approaches:**

| Model | Params | Speed (GPU) | Quality |
|-------|--------|-------------|---------|
| **Depth Anything V2 Small** | 25M | ~13–60 ms | Strong relative depth |
| **Depth Anything V2 Large** | 335M | ~80–220 ms | Best generalization |
| **MiDaS / DPT** | varies | similar class | Predecessor |
| **Marigold / GeoWizard** | SD-based | 100–300 ms+ | Slower, diffusion-based |

**Feasibility:** **High** for general depth maps; **Medium** for face-specific geometric accuracy.

**Complexity:** **Medium** — requires GPU worker for batch analysis; CPU-only viable with Small model at reduced resolution.

**Use for identity preservation:**

- Face region depth profile (nose prominence, eye socket depth)
- Silhouette consistency checks between generated and canonical
- Conditioning signal for future 3D-aware generation

**Limitations:**

- **Relative depth only** (unless metric fine-tuned variant) — scale ambiguous from single view
- **Illustration domain:** cell shading and flat color break depth assumptions
- **Hair / accessories** dominate depth maps; may need segmentation mask first

**Recommendation:** Generate **256×256 face-cropped depth maps** for canonical + turnaround front in Phase 2. Store compressed PNG or quantized array. Do not treat as ground-truth geometry.

**Storage:** ~15–80 KB per depth map (compressed PNG or FP16 array).

---

### 3.4 2D-to-3D reconstruction approaches

**What it is:** Recovering 3D face/head/body geometry from one or more 2D images.

**Face (parametric 3DMM / FLAME):**

| Method | Output | Single image? | Notes |
|--------|--------|---------------|-------|
| **DECA** | FLAME shape + expression + detail displacement | Yes | Animatable; widely cited |
| **FLAME** | Parametric mesh (300+ shape dims) | Via regressor | Industry standard base model |
| **3DDFA / 3DDFA-V2** | 3DMM coefficients | Yes | Fast, lighter |
| **PRNet / MeshGraphormer** | Dense mesh | Yes | Higher detail |

**Full body / stylized:**

| Method | Domain | Notes |
|--------|--------|-------|
| **PIFu / ICON** | Clothed human | Needs full body |
| **PAniC-3D / NOVA-3D** | Anime / stylized | Research-stage; domain-specific |
| **Tripo / image-to-3D** | General objects | Character consistency fragile |

**Feasibility:**

| Domain | Single-image 3D face | Full body 3D |
|--------|---------------------|--------------|
| Photorealistic human portrait | **Medium–High** (DECA/FLAME mature) | **Low–Medium** (needs multi-view) |
| Illustrated / anime | **Low** (domain gap) | **Low** (active research) |
| Non-human | **Very low** | **Very low** |

**Complexity:** **High** — GPU inference, model weights, failure handling, optional mesh storage.

**Recommendation:** **Phase 3 only**, photorealistic branch first. Store **FLAME/DECA coefficient vectors** (~1–4 KB) rather than full meshes by default. Full `.obj` export optional for creator preview. Do **not** block V1/V2 on 3D reconstruction.

**Storage:**

| Asset | Size |
|-------|------|
| FLAME/DECA coeffs (JSON) | 1–5 KB |
| Depth + normal maps | 20–100 KB |
| Full head mesh (.obj) | 1–10 MB (optional, Supabase Storage) |

---

### 3.5 Identity embeddings

**What it is:** Dense vector representations capturing face identity — used by generation systems to condition diffusion models.

**Established approaches:**

| Embedding | Dim | Source | Used by |
|-----------|-----|--------|---------|
| **ArcFace (InsightFace)** | 512 | Trained on real faces | InstantID, IP-Adapter FaceID, PuLID |
| **CLIP image embedding** | 512–768 | General vision-language | IP-Adapter (weaker for faces) |
| **FaceID custom** | varies | Fine-tuned on faces | IP-Adapter-FaceID-V2 |
| **Diffusion internal** | varies | Model-specific | Not portable |

**InsightFace pipeline:** detect → align → 112×112 crop → ArcFace → **L2-normalized 512-d vector**.

**Feasibility for storage:** **High** technically — small, fast, well-understood.

**Critical limitation for CharID:**

- ArcFace embeddings encode **real human identity clusters** — optimized for "same person vs different person" in photos
- **Fictional / illustrated characters** are out-of-distribution; embeddings may be unstable or meaningless
- Embeddings are **not interpretable** — creators cannot edit them
- **Not portable across AI models** — InstantID uses InsightFace; other models may expect different formats

**Feasibility for consistency:** **Medium** for photorealistic OCs; **Low** for stylized art without domain-specific training.

**Recommendation:**

- Store ArcFace embedding from **canonical image** as one **optional signal** in Phase 1 (photoreal branch)
- Label clearly: `embedding_type: arcface_v1`, `applicable_styles: [photorealistic, semi_realistic]`
- For illustrated characters, prioritize **landmark ratios + bible text + canonical pixels** over ArcFace
- Long-term: explore **character-local embedding** fine-tuned from creator's multi-view set (Phase 4 research)

**Storage:** 2 KB per embedding (512 × float32). Multiple views → multiple embeddings + fusion metadata.

---

### 3.6 Character consistency in modern image generation

**How production systems preserve identity today:**

| System | Mechanism | Inputs | Training-free? |
|--------|-----------|--------|----------------|
| **InstantID** | ArcFace embedding + face keypoint ControlNet (IdentityNet) | 1 face image | Yes |
| **IP-Adapter FaceID** | FaceID embedding → cross-attention | 1 face image | Yes |
| **PuLID** | Identity injection without ControlNet | 1 face image | Yes |
| **PhotoMaker** | Stacked ID embedding + partial UNet tuning | 1+ faces | Partial fine-tune |
| **StoryDiffusion** | Consistent self-attention across batch | 3–6+ prompts + refs | Yes |
| **LoRA / DreamBooth** | Weight adaptation per character | 5–20 images | No (per character) |

**Key research insight:**

> Modern zero-shot consistency still **conditions on embeddings + landmarks + pixels** — not on a persistent CharID-style identity layer. No mainstream consumer tool stores FLAME coeffs + multi-view fusion as the source of truth.

**Implication for CharID:**

CharID's Identity Layer should be designed as a **model-agnostic intermediate representation** that can **compile down** to whatever each generation backend needs:

```text
Identity Layer  →  Adapter compiler  →  InstantID inputs (embedding + kps)
                                      →  IP-Adapter inputs
                                      →  Future in-house model inputs
```

**Feasibility of CharID as identity hub:** **High strategically** — CharID owns the bible + multi-view assets + derived data; generation backends are interchangeable plugins.

**Complexity:** **High** — maintaining adapter compilers per model generation.

---

## 4. Domain gap: all creative formats (not photoreal-only)

CharID creators work with **fictional characters across many visual formats**. Photoreal face pipelines are one subset — not the architecture center.

### Supported format taxonomy

| Creator format | Examples | Primary identity challenge |
|----------------|----------|--------------------------|
| **Realistic humans** | Photo-real OCs, cinematic characters | Face geometry drift |
| **Stylized humans** | Painterly, semi-real, fashion illustration | Exaggerated features break face detectors |
| **Anime characters** | Cel-shaded, large eyes, minimal nose | Non-photoreal shading; wrong topology assumptions |
| **Comic characters** | Ink, bold lines, flat color | Simplified anatomy; high abstraction |
| **Cartoon characters** | Toon, chibi, rubber-hose | Extreme proportion exaggeration |
| **Fantasy races** | Elves, orcs, demons, hybrids | Non-standard topology (ears, horns, fangs) |
| **Creatures** | Dragons, beasts, monsters | Non-human skeleton; no human face mesh |
| **Anthropomorphic** | Furries, anthro mammals/birds | Animal head + humanoid body; muzzle not human jaw |

### Character archetype routing (Identity Layer)

Every character gets an **`identity_archetype`** — routes which **optional** analyzers run (never blocks core identity):

```text
humanoid_realistic    → optional human face landmarks, ArcFace, FLAME/DECA
humanoid_stylized     → semantic regions + multi-ref embedding
humanoid_anime        → multi-ref + descriptors; stylized region tags
humanoid_comic        → multi-ref + descriptors; palette + silhouette
humanoid_cartoon      → proportion class + multi-ref
humanoid_fantasy      → custom region schema (ears, horns) + multi-ref
creature_quadruped    → silhouette + part regions
creature_other        → bounding regions + descriptors only
anthropomorphic       → muzzle/ear/tail regions + humanoid body optional
```

Creator selects archetype in Character Bible (default inferred from species + style, confirmable).

**Product implication:** Core identity uses **reference graph + descriptors + fused embedding** for every archetype. Landmarks and ArcFace are enrichment only.

---

## 15. Cross-format technique evaluation

Research question: **Which identity preservation techniques generalize across realistic and stylized characters?**

Five techniques evaluated against all CharID format categories.

**Rating key:** ● Strong · ◐ Partial · ○ Weak / not applicable

### 15.1 Evaluation matrix

| Technique | Realistic human | Stylized human | Anime | Comic | Cartoon | Fantasy race | Creature | Anthro |
|-----------|-----------------|----------------|-------|-------|---------|--------------|----------|--------|
| **1. Facial landmarks** | ● | ◐ | ○ | ○ | ○ | ◐ | ○ | ◐ |
| **2. Body landmarks** | ● | ◐ | ◐ | ◐ | ◐ | ◐ | ○ | ◐ |
| **3. Multi-view references** | ● | ● | ● | ● | ● | ● | ● | ● |
| **4. Character embeddings** | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ |
| **5. Visual identity descriptors** | ● | ● | ● | ● | ● | ● | ● | ● |

### 15.2 Technique-by-technique analysis

#### 1. Facial landmarks

**What it captures:** Fixed keypoint topology — eyes, nose, mouth, jaw, contour.

| Strength | Weakness |
|----------|----------|
| Precise for photorealistic human faces | Assumes human facial topology |
| Compact, editable geometry | Anime/cartoon: detectors fail or misplace points |
| Useful for InstantID-style backends | Horns, muzzles, multi-eye creatures: schema mismatch |
| Fast inference | Becomes misleading when confidence is faked on stylized art |

**Generalization verdict:** **Poor universal substrate.** Useful as **optional enrichment** for `humanoid_realistic` and some `humanoid_fantasy` / `anthropomorphic` with custom schemas — not as Identity Layer foundation.

---

#### 2. Body landmarks

**What it captures:** Skeletal pose — shoulders, limbs, spine — enabling proportion ratios.

| Strength | Weakness |
|----------|----------|
| Works for full-body humanoid turnaround | Quadrupeds, serpents, flying creatures need different skeletons |
| Supports silhouette consistency | Cartoon/chibi proportions are intentional, not errors |
| MediaPipe Holistic is fast | Occlusion (capes, hair, weapons) breaks keypoints |

**Generalization verdict:** **Partial — archetype-dependent.** Valuable for humanoid formats when full-body turnaround exists. Store as **proportion class + ratios**, not absolute anthropometry. Skip or use region boxes for non-humanoid creatures.

---

#### 3. Multi-view reference assets

**What it captures:** Creator-authored canonical, turnaround, expression, and reference images — pixels + typed roles from Character Bible.

| Strength | Weakness |
|----------|----------|
| **Format-agnostic** — works for every CharID category | Quality depends on creator completeness |
| Industry-proven: reference sheets, IP-Adapter, StoryDiffusion | Does not alone prevent drift without generation discipline |
| No ML required for storage | Large storage vs pure text |
| Aligns with CharID's existing bible model | Multi-view set needed for angles/expressions |

**Generalization verdict:** **Best universal technique.** Primary identity substrate for all formats. Research and production practice (InstantCharacter, consistent character workflows, animation reference sheets) converge on **multi-view reference sets** as the cross-format consistency anchor.

---

#### 4. Character embeddings

**What it captures:** Dense vectors summarizing visual appearance for conditioning generation models.

| Embedding type | Realistic | Stylized / anime | Creatures | Generalization |
|----------------|-----------|------------------|-----------|----------------|
| **ArcFace / InsightFace** | ● | ○ | ○ | Photoreal human faces only |
| **CLIP image** | ◐ | ◐ | ◐ | Semantic, weak fine detail |
| **SigLIP** | ◐ | ● | ◐ | Better texture/identity detail |
| **DINOv2** | ◐ | ● | ◐ | Robust to background; semantic structure |
| **SigLIP + DINOv2 fused** | ◐ | ● | ◐ | State-of-art for open-domain characters (InstantCharacter) |
| **Multi-ref fused embedding** | ● | ● | ◐ | Aggregate 3–8 bible images → character-local vector |
| **Per-character LoRA weights** | ● | ● | ● | Highest consistency; training cost per character |

**Generalization verdict:** **No single embedding universal alone.** Recommend:

- **Primary:** Per-image SigLIP + DINOv2 embeddings from each bible reference → **fused character embedding** (mean pool or learned fusion)
- **Secondary:** ArcFace **only** when `identity_archetype = humanoid_realistic` and confidence high
- **Never** gate Identity Layer readiness on ArcFace for stylized or non-human characters

---

#### 5. Visual identity descriptors

**What it captures:** Structured semantic description of appearance — creator bible fields plus machine-extracted traits.

**Sources:**

| Source | Examples |
|--------|----------|
| **Character Bible (creator)** | species, hair, eyes, permanent features, clothing, scars |
| **VLM extraction (derived)** | "triangular face, violet eyes, spiked blue hair, red scarf" |
| **Palette / silhouette** | dominant colors, contrast profile, head:body ratio class |
| **Semantic regions** | `{ region: "left_horn", bbox, label, color }` for fantasy/creature |
| **Style tags** | anime cel-shade, comic ink, photoreal, chibi |

| Strength | Weakness |
|----------|----------|
| **Universal across all formats** | VLM extraction can hallucinate — needs confidence + creator confirm |
| Human-readable and editable | Less precise than geometry for micro-expressions |
| Combines with any generation backend | Text alone insufficient without reference images |
| Supports creatures with no face mesh | Descriptor drift if not tied to reference graph |

**Generalization verdict:** **Best universal complement to multi-view references.** Descriptors + references together match how human artists maintain consistency (model sheet notes + drawings).

---

### 15.3 Generalization ranking

| Rank | Technique | Role in CharID Identity Layer |
|------|-----------|-------------------------------|
| **1** | Multi-view reference assets | **Primary substrate** — reference graph from Character Bible |
| **2** | Visual identity descriptors | **Primary semantic layer** — bible + extracted traits + regions |
| **3** | Character embeddings (SigLIP+DINOv2 fusion) | **Primary derived signal** — multi-ref fused embedding |
| **4** | Body landmarks / proportions | **Optional enrichment** — humanoid archetypes with full-body views |
| **5** | Facial landmarks | **Optional enrichment** — realistic/stylized humanoid only; custom schemas for fantasy/anthro |

**Architectural rule:** Techniques ranked 4–5 must **never block** identity preservation for formats where they fail. AI Readiness for a dragon cannot require human face landmarks.

---

### 15.4 Recommended architecture: Reference-First Identity Model (RFIM)

CharID's Character Identity Layer should be built on **three pillars** — not on photoreal face geometry.

```text
┌─────────────────────────────────────────────────────────────────┐
│  PILLAR A — REFERENCE GRAPH (primary, all formats)             │
│  Typed bible images: canonical, turnaround_*, expression_*     │
│  Edges: same_character, same_version, view_angle, emotion       │
│  Generation compiles N reference URIs + roles → adapter inputs   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  PILLAR B — VISUAL IDENTITY DESCRIPTORS (primary, all formats)   │
│  Creator bible text + palette + silhouette class + style tags    │
│  Optional VLM-extracted traits (confidence-scored)               │
│  Semantic regions for non-human: horns, muzzle, wings, tail      │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  PILLAR C — DERIVED SIGNALS (optional, archetype-routed)       │
│  Fused SigLIP+DINOv2 embedding · body proportions              │
│  Face landmarks (humanoid_realistic branch) · ArcFace (opt.)   │
│  Depth maps · FLAME/DECA (photoreal opt-in)                    │
└─────────────────────────────────────────────────────────────────┘
```

#### Identity compilation (future generation)

```text
Input:  character_id + version_id + target_scene
Output: AI Context Packet

1. Load reference graph (all published bible images for version)
2. Load visual descriptors (creator + derived, creator wins conflicts)
3. Load fused embedding (if analysis complete)
4. Load archetype-routed enrichments (if applicable + confident)
5. Compile to backend adapter:
     - stylized/anime/creature  → IP-Adapter multi-ref + descriptors + StoryDiffusion batch
     - realistic humanoid       → above + optional InstantID branch if ArcFace available
```

#### What changes from prior photoreal-centric proposal

| Prior proposal | Revised (cross-format) |
|----------------|------------------------|
| Landmarks + ArcFace in Phase 1 | **Reference graph + descriptors + SigLIP/DINOv2 fusion** in Phase 1 |
| Skip illustrated in Phase 1 | **All formats supported** from Phase 1 via Pillars A + B |
| ArcFace as core embedding | ArcFace as **optional adapter input** for realistic humanoid only |
| Face mesh / DECA in Phase 3 | **Opt-in enrichment**; never required for Identity Layer readiness |
| `style_class` routes skip | `identity_archetype` routes **optional** enrichments, never core |

#### Identity Layer readiness (cross-format)

Readiness must be **archetype-aware** but **format-inclusive**:

| Checkpoint | Applies to |
|------------|------------|
| Canonical reference set | All formats |
| ≥ 1 turnaround view | All humanoid + anthro |
| ≥ 1 expression reference | All humanoid + anthro with faces |
| Visual descriptors complete (bible) | All formats |
| Fused embedding computed | All formats (when ≥ 2 refs) |
| Body proportion summary | Humanoid with full-body turnaround |
| Face landmarks | `humanoid_realistic` optional bonus |
| ArcFace embedding | `humanoid_realistic` optional bonus |

A **complete anime character** can score 100% Identity Layer readiness **without** human face landmarks.

---

## 5. Proposed data model (future)

**Revised for Reference-First Identity Model.** Not migrations — architecture proposal only.

### `character_identity_layers`

One row per character version (V1: 1:1 with `character_bible`).

```text
character_identity_layers
├── id                      uuid PK
├── character_id            uuid FK
├── character_bible_id      uuid FK
├── user_id                 uuid
├── identity_archetype      text NOT NULL
│                           -- humanoid_realistic | humanoid_stylized | humanoid_anime
│                           -- humanoid_comic | humanoid_cartoon | humanoid_fantasy
│                           -- creature_quadruped | creature_other | anthropomorphic
├── creative_format         text      -- creator label: anime, comic, cartoon, etc.
├── reference_graph_json    jsonb     -- Pillar A: nodes + edges over character_images
├── descriptor_json         jsonb     -- Pillar B: visual identity descriptors
├── fused_embedding_path    text NULL -- Pillar C: SigLIP+DINOv2 multi-ref fusion
├── analyzer_version        text
├── analysis_status         text
├── last_analyzed_at        timestamptz
├── created_at, updated_at
```

### `character_identity_assets` (derived signals — Pillar C)

```text
character_identity_assets
├── id                      uuid PK
├── identity_layer_id       uuid FK
├── source_image_id         uuid FK → character_images
├── asset_type              text
│                           -- image_embedding_siglip | image_embedding_dino
│                           -- fused_character_embedding | vlm_extracted_traits
│                           -- face_landmarks | body_landmarks | semantic_regions
│                           -- proportion_ratios | depth_map | arcface_embedding
├── storage_path            text NULL
├── data_json               jsonb NULL
├── confidence              real
├── applicable_archetypes   text[]
├── analyzer                text
├── created_at
```

### `character_semantic_regions` (creatures, fantasy, anthro)

When human face landmarks fail, store **named regions**:

```text
character_semantic_regions
├── identity_layer_id       uuid FK
├── source_image_id         uuid FK
├── region_key              text      -- muzzle, left_horn, wing, tail, ear, eye_left
├── bbox_normalized         jsonb     -- { x, y, w, h } 0–1
├── label                   text NULL
├── dominant_colors         text[] NULL
├── confidence              real
```

### `character_proportions` (humanoid optional)

```text
character_proportions
├── identity_layer_id       uuid FK
├── proportion_class        text      -- realistic | stylized | chibi | heroic
├── head_height_ratio       real NULL
├── shoulder_width_ratio    real NULL
├── custom_ratios           jsonb NULL
├── source_image_ids        uuid[]
├── confidence              real
```

### Binary storage layout

```text
{user_id}/characters/{character_id}/identity/{identity_layer_id}/
├── fused_embedding.bin
├── siglip_{source_image_id}.bin
├── dino_{source_image_id}.bin
├── landmarks_{source_image_id}.json    (optional, humanoid_realistic)
├── arcface_{source_image_id}.bin       (optional)
└── depth_{source_image_id}.png         (optional)
```

---

## 6. Feasibility summary (cross-format)

| Capability | All formats? | Feasibility | Priority |
|------------|--------------|-------------|----------|
| **Multi-view reference graph** | ● Yes | **High** | Phase 0–1 (core) |
| **Visual identity descriptors** | ● Yes | **High** | Phase 1 (core) |
| **Fused SigLIP+DINOv2 embedding** | ● Yes | **High** | Phase 1 (core) |
| **Semantic regions** | ● Yes | **Medium–High** | Phase 2 |
| **Body landmarks + proportions** | ◐ Humanoid | **Medium** | Phase 2 (optional) |
| **Facial landmarks** | ○ Humanoid realistic mainly | **Medium** photoreal / **Low** stylized | Phase 2 (optional) |
| **ArcFace embedding** | ○ Realistic humanoid only | **High** photoreal / **Low** else | Phase 2 (optional) |
| **Single-image depth** | ◐ Partial | **Medium** | Phase 3 optional |
| **2D→3D face (DECA/FLAME)** | ○ Realistic humanoid | **Medium** | Phase 4 opt-in |
| **Adapter compiler (multi-ref)** | ● Yes | **Medium** | Phase 3 |
| **Illustrated 3D reconstruction** | ○ Research | **Low** | Phase 4+ evaluate |

**Overall verdict:** Cross-format identity preservation is **feasible** when built on **references + descriptors + style-agnostic embeddings** — not on photoreal face geometry alone.

---

## 7. Complexity summary

| Area | Engineering complexity | ML ops complexity |
|------|------------------------|-------------------|
| Landmark extraction worker | Low | Low (off-the-shelf) |
| Style classification | Medium | Medium (train or heuristic) |
| Depth map worker | Medium | Medium (GPU worker) |
| Embedding extraction | Low | Low (InsightFace) |
| Multi-view fusion logic | Medium–High | Medium |
| DECA/FLAME pipeline | High | High (GPU, model licensing) |
| Adapter compiler (per AI backend) | High | Medium |
| Illustrated / stylized branch | Very High | High (research) |

**Recommended execution model:** Async **analysis jobs** triggered on image upload (canonical, turnaround, expression). Not in Next.js request path. Options: Supabase Edge Function + external GPU worker, or dedicated queue (Inngest / BullMQ + Python worker).

---

## 8. Storage implications

### Per character (typical photorealistic, Phase 2 complete)

| Asset | Count | Size each | Total |
|-------|-------|-----------|-------|
| Face landmarks JSON | 5–10 images | 5 KB | ~50 KB |
| Body landmarks JSON | 2–4 images | 3 KB | ~12 KB |
| ArcFace embeddings | 1–5 | 2 KB | ~10 KB |
| Depth maps | 1–5 | 40 KB | ~200 KB |
| Proportion summary | 1 | 2 KB | ~2 KB |
| FLAME params (optional) | 1 | 4 KB | ~4 KB |
| **Typical total** | | | **~300 KB – 1 MB** |
| Optional mesh | 1 | 1–5 MB | +1–5 MB |

### At scale (10k characters, avg 500 KB identity data)

~5 GB derived data — manageable in Supabase Storage + JSONB.

### Retention policy

- Recompute on `analyzer_version` bump; keep prior version blob for 30 days (optional rollback)
- Delete identity assets when source `character_images` row deleted (cascade)

---

## 9. Performance implications

### Analysis pipeline (Phase 1 — all formats, ~5 bible images)

| Step | Latency (GPU worker) | Applies to |
|------|---------------------|------------|
| Palette + silhouette extraction | 50–100 ms | All formats |
| SigLIP + DINOv2 per image | 80–200 ms each | All formats |
| Fused embedding compute | 20–50 ms | All formats |
| VLM trait extraction (optional) | 1–3 s | All formats |
| MediaPipe face mesh (Phase 2 opt.) | 10–30 ms | humanoid_realistic only |
| ArcFace (Phase 2 opt.) | 50–150 ms | humanoid_realistic only |
| **Phase 1 total (5 refs)** | **~1–2 s** | Universal path |

### User experience

- Analysis runs **async** — creator sees "Analyzing identity…" badge
- Character Bible page loads immediately from creator data; identity section populates when job completes
- Re-analysis debounced (max 1 job per image per 5 minutes)

### Infrastructure

| Phase | Infra |
|-------|-------|
| Phase 1 | GPU worker for SigLIP+DINOv2; CPU viable at lower throughput |
| Phase 2 | GPU for semantic regions + optional landmarks |
| Phase 3–4 | GPU for generation adapters; DECA opt-in only |

---

## 10. Future workflow

```text
Build Character Bible (all formats)
        ↓
Set identity_archetype + upload canonical / turnaround / expressions
        ↓
Trigger identity analysis job (async)
        ↓
Pillar A: Build reference graph from typed bible images
Pillar B: Compile descriptors (bible + optional VLM extraction)
Pillar C: Per-image SigLIP+DINOv2 → fused embedding
        ↓
Archetype-routed enrichments (optional):
  humanoid_realistic → landmarks, ArcFace
  creature/anthro    → semantic regions
  humanoid + full body → proportions
        ↓
Update Identity Layer readiness (archetype-aware checkpoints)
        ↓
Creator reviews extracted traits / regions (optional confirm)
        ↓
Future generation:
  compile RFIM → AI Context Packet → adapter
  (multi-ref IP-Adapter / InstantCharacter / optional InstantID)
        ↓
Generate side view / expression / scene
        ↓
Optional: drift score vs fused embedding + descriptors → flag regen
```

---

## 11. AI Context Packet extension (future)

Building on [Character Bible V1 §6](./CHARACTER_BIBLE_V1.md), the packet gains an `identity_layer` block:

```json
{
  "identity_layer": {
    "identity_archetype": "humanoid_anime",
    "creative_format": "anime",
    "analysis_status": "complete",
    "reference_graph": {
      "canonical": "uri",
      "turnaround": ["front_uri", "back_uri"],
      "expressions": ["neutral_uri", "happy_uri"]
    },
    "visual_descriptors": {
      "creator": { "species": "Human", "hair": "Spiked blue", "eyes": "Violet" },
      "extracted": [{ "trait": "triangular face", "confidence": 0.82 }],
      "palette": ["#2a1f5c", "#4fc3f7", "#ffffff"],
      "silhouette_class": "heroic_humanoid"
    },
    "embeddings": {
      "fused_siglip_dino": { "dim": 2048, "vector_uri": "...", "ref_count": 5 }
    },
    "semantic_regions": [],
    "enrichments": {
      "face_landmarks": null,
      "arcface": null,
      "proportions": { "proportion_class": "stylized", "confidence": 0.71 }
    },
    "generation_adapters": {
      "ip_adapter_multi_ref": { "reference_uris": ["..."], "weights": [1.0, 0.8] },
      "instantid": null
    }
  },
  "scores": {
    "consistency_score": 72,
    "bible_completion": 68,
    "ai_readiness": 54,
    "identity_layer_readiness": 88
  }
}
```

**Identity Layer Readiness** is archetype-aware: an anime character at 88% requires **no** face landmarks or ArcFace.

---

## 12. Recommended phased approach (revised — all formats)

### Phase 0 — Now (Character Bible V1) **← current priority**

**Scope:** Creator builds the **Reference Graph** (Pillar A) + creator-authored **Visual Identity Descriptors** (Pillar B partial). See [CHARACTER_BIBLE_V1.md](./CHARACTER_BIBLE_V1.md).

**Delivers:**

- Typed `character_images` nodes: `canonical`, `reference`, `turnaround_*`, `expression_*`
- `identity_archetype` + `creative_format` on `character_bible`
- `assembleReferenceGraph()` — materializes graph for RFIM Phase 1 consumption
- Reference Graph Completion (archetype-aware scoring)

**Outcome:** RFIM-ready reference package exists for every character. No derived analysis.

**Identity Layer:** None derived.

---

### Phase 1 — Reference-First Identity core (all formats)

**Scope:**

- Build **reference graph** from bible images (canonical, turnaround, expressions, reference)
- Compile **visual identity descriptors** from Character Bible text + palette extraction
- Per-image **SigLIP + DINOv2** embeddings → **fused character embedding**
- Optional VLM trait extraction (confidence-scored, creator confirm)
- `identity_archetype` selector in bible UI
- Identity Layer panel: reference graph + descriptors + embedding status
- **Archetype-aware Identity Layer readiness** (no landmark requirement for stylized/creature)

**Explicitly not Phase 1:** ArcFace, face landmarks, DECA, depth maps

**Effort:** ~3–4 weeks

**Value:** Universal identity substrate for realistic, anime, comic, creature, anthro

---

### Phase 2 — Archetype-routed enrichment

**Scope:**

- **Semantic regions** for creature / fantasy / anthro (SAM-style or VLM bbox)
- **Body proportions** for humanoid with full-body turnaround
- **Face landmarks** for `humanoid_realistic` + some `anthropomorphic` only
- **ArcFace** optional branch → enables InstantID adapter compilation for photoreal OCs
- Drift score v0: cosine distance of generated output vs fused embedding

**Effort:** ~3–4 weeks

**Value:** Stronger structural signals where applicable; never blocks non-humanoid

---

### Phase 3 — Adapter compiler + generation integration

**Scope:**

- Compile RFIM → **IP-Adapter multi-ref**, InstantCharacter-style, StoryDiffusion batch
- Optional InstantID branch when ArcFace present
- Identity Layer readiness gates future AI features (archetype-aware checklist)
- Depth maps optional for humanoid_realistic

**Effort:** ~4–6 weeks + GPU infra

**Value:** CharID generation uses stored identity across all supported formats

---

### Phase 4 — Advanced enrichment + drift loop

**Scope:**

- FLAME/DECA opt-in for humanoid_realistic
- Per-character LoRA training option (highest consistency, creator opt-in)
- Stylized 3D research evaluation (PAniC-3D class) — no commitment
- Post-generation drift loop with regen suggestions
- Custom landmark schemas for fantasy/anthro

**Effort:** Research + ongoing

---

### Phase summary

```text
Phase 0  Character Bible V1           ← creator references (all formats)
Phase 1  Reference graph + descriptors + fused embedding  ← universal core
Phase 2  Archetype enrichments       ← regions, proportions, optional landmarks
Phase 3  Adapter compiler + AI gen   ← multi-ref backends
Phase 4  Advanced 3D + drift + LoRA   ← optional depth
```

**Do not skip Phase 0.** Phase 1 must ship **before** photoreal-only analyzers — otherwise anime and creature support is an afterthought.

---

## 13. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Analyzers fail on illustrated art | Style routing + skip with clear UX; never fake confidence |
| Creators distrust "AI analyzed my character" | Show provenance; read-only v1; optional creator confirm |
| Privacy concerns (face embedding) | Character-local storage; no global face DB; not facial recognition |
| Analyzer obsolescence | Version field + recompute job; blobs keyed by analyzer_version |
| Over-engineering before AI features | Phase 1 is small; defer DECA until generation ships |
| Embedding lock-in to InsightFace | Store raw vector + type; adapter compiler is swappable |
| Regulatory (biometric data) | Fictional characters; no real-person matching; document in privacy policy |

---

## 14. Open research questions

1. **Character-local embedding:** Can 5–10 creator turnaround images fine-tune a small adapter that outperforms ArcFace for illustrated characters?
2. **Landmark-free consistency:** Can diffusion models conditioned on StoryDiffusion-style reference sets avoid landmarks entirely for anime?
3. **Drift metrics:** What perceptual + geometric metric best predicts creator-perceived "same character"?
4. **Version-scoped identity:** When Fire ages 17→40, is identity layer fully replaced or diffed?
5. **Non-human anatomy:** Custom landmark schemas for species ( horns, snouts, multiple eyes)?

---

## Summary

| Question | Answer |
|----------|--------|
| Supported formats | Realistic, stylized, anime, comic, cartoon, fantasy, creature, anthro — **all first-class** |
| Best universal techniques | **Multi-view references** + **visual descriptors** + **fused SigLIP/DINOv2 embedding** |
| Facial landmarks | Optional enrichment — humanoid realistic/anthro only; **not** universal |
| Body landmarks | Partial — humanoid archetypes with full-body turnaround |
| Character embeddings | Multi-ref fusion generalizes; ArcFace photoreal-only optional branch |
| Recommended architecture | **Reference-First Identity Model (RFIM)** — three pillars (§15.4) |
| Is this facial recognition? | **No** — consistency preservation for fictional characters |
| Identity vs pixels | Images are references; identity = graph + descriptors + fused embedding |
| Next step | Phase 0 Character Bible V1, then Phase 1 RFIM core (all formats) |

---

*Document status: Revised for cross-format identity preservation — research & architecture only. No implementation implied.*
