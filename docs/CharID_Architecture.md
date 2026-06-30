# CharID Architecture — How the AI Actually Works
### Status: companion document to the Studio Implementation Spec — read this before making UI decisions

CharID is **not** a design tool like Canva or Polotno. Those are UI references only. Studio is the final review/adjustment stage of a much larger AI production pipeline, not the product itself.

---

## The philosophy

The user should feel like they are simply creating a book. Behind the scenes, CharID maintains a structured universe of reusable information. The user should never need to understand this structure — everything should feel simple.

Studio is where AI-generated content is reviewed and adjusted before publishing. Everything that appears inside Studio comes from structured project data.

---

## High-level pipeline

```
Project → Story → Story Timeline → Scenes → Pages → Panels → Artwork → Speech/Thought/Captions → Published Book
```

Studio primarily edits the bottom half of this pipeline (Pages → Panels → Artwork → Dialogue).

---

## Story

Title, synopsis, genre, style, audience, tone. User-written or AI-generated.

## Story Timeline (formerly "Timeline")

Not a video timeline — the narrative structure. A sequence of Scenes (e.g. *Noah wakes up* → *Drives to the beach* → *Learns to surf* → *Sunset*). Each Scene eventually becomes one or more Pages.

## Scene

Contains: what happens, who appears, dialogue, mood, camera intent, settings used, assets used, outfits used. This is the AI's main source of context — when generating artwork, AI primarily reads the Scene.

## Pages

Generated from Scenes. One Scene may become 1 page or several, depending on pacing. Users can also manually create pages.

## Panels

Editable layout containers on a page (choose layout, move, resize, delete, generate/replace artwork per panel). **Panels are presentation — Scenes remain the source of truth.**

## Artwork

Generated inside panels. Never final — users must be able to crop, scale, pan, replace, and regenerate it without changing the underlying Scene.

## Dialogue

Generated from the Scene script. AI never permanently bakes speech bubbles into artwork. Instead: AI suggests who speaks, what they say, and roughly where; the user chooses bubble style, position, size, and tail direction; AI may auto-fill the text. The bubble itself always stays editable.

---

## The hidden project library

Users never see the word "Canon." Internally, every project maintains a reusable structured library that powers consistency across the story. The user only experiences these as project resources.

**Current categories:**

- **Characters** — reference images, appearance, height, age, hair, eyes, important features, personality, description, generation prompt, approved images. AI always uses this whenever the character appears.
- **Assets** — reusable objects (surfboard, car, camera, sword, spaceship, coffee mug). Reference images (front/back/side), description, dimensions, prompt, approved images.
- **Settings** — locations (Noah's apartment, Santa Cruz beach, lighthouse, school, forest, castle). Reference images, description, time-of-day options, weather options, approved images, prompt. Scenes reference Settings.
- **Wardrobe** — outfits per character (school uniform, winter jacket, surf wetsuit, casual clothes, armor, business suit). Reference images, description, prompt, approved images. Scenes reference outfits.

**Future categories may include:** Vehicles, Creatures, Props, Organizations, Magic systems, etc.

---

## AI generation context hierarchy

When generating artwork for a Scene, the AI automatically gathers context from, in order:

```
Story → Scene → Characters → Settings → Assets → Wardrobe → Previous approved images → Style guide → Current page → Current panel
```

The user never manually assembles this context — CharID does it automatically.

---

## AI inside Studio

Studio should never feel like ChatGPT. The AI appears as production assistance, surfaced as concrete actions operating on existing project data:

- Generate Panel / Generate Page / Generate Pages / Generate From Story / Generate From Scene
- Regenerate Selection
- Suggest Dialogue / Suggest Caption / Suggest Panel Layout / Suggest Camera Angle / Suggest Composition

---

## Design philosophy

The editor should feel familiar within minutes, with no training needed — think Polotno, Figma, Canva, Photoshop, but simplified. **The complexity belongs inside the AI, not inside the interface.**

---

## Important — relationship to the Implementation Spec

Do not redesign the interface based on this document. The HTML reference and the Studio Implementation Spec remain the visual source of truth for layout, spacing, and interaction. This document explains *what the UI is for* and *where its data comes from* — wire the existing editor and AI pipeline into that interface; don't invent a new workflow.

In practice: every button, suggestion banner, and "Generate" action in the Implementation Spec (Section 10's AI suggestion banners, Section 11's tiered layers, the AI Gen sidebar panel) should be read as a thin UI surface over this pipeline — e.g. the Speech panel's AI suggestion banner is the Scene's dialogue context surfacing through Studio, not a standalone feature; the AI Gen panel's "Scene context" box (Story name, Scene name, characters in scene) is this same context hierarchy made visible in miniature.
