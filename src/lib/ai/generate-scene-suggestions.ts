import { openAIChatCompletion } from "@/lib/ai/openai-chat";
import {
  sceneSuggestionContextToPrompt,
  type SceneSuggestionContext,
} from "@/lib/assemble-scene-suggestion-context";
import type {
  SceneSuggestionDraft,
  SceneSuggestionGenerationResult,
} from "@/types/scene-suggestion";

const SYSTEM_PROMPT = `You are CharID, a creative collaborator helping storytellers plan scenes.
You suggest narrative beats — never full prose, never screenplay formatting.
Return JSON only with this shape:
{
  "suggestions": [
    {
      "title": "Short scene title",
      "summary": "One or two sentences: what happens in this moment",
      "character_names": ["Name from canon only"],
      "location_name": "Place name from canon or a brief new place label"
    }
  ]
}
Rules:
- Suggest 3 to 8 scenes unless asked for exactly one.
- Use character_names only from the provided character list when possible.
- Use location_name from provided locations when fitting; otherwise a short free-text place.
- Do not duplicate existing scene titles or repeat the same beat.
- Keep language clear and age-appropriate.
- These are proposals only — the creator approves each scene individually.`;

function parseSuggestionsJson(raw: string): SceneSuggestionDraft[] | null {
  try {
    const parsed = JSON.parse(raw) as {
      suggestions?: SceneSuggestionDraft[];
    };
    if (!Array.isArray(parsed.suggestions)) return null;

    const cleaned = parsed.suggestions
      .map((s) => ({
        title: String(s.title ?? "").trim(),
        summary: String(s.summary ?? "").trim(),
        character_names: Array.isArray(s.character_names)
          ? s.character_names.map(String).filter(Boolean)
          : [],
        location_name: s.location_name
          ? String(s.location_name).trim() || null
          : null,
      }))
      .filter((s) => s.title.length >= 2 && s.summary.length >= 8);

    return cleaned.length > 0 ? cleaned.slice(0, 8) : null;
  } catch {
    return null;
  }
}

function templateSuggestions(
  context: SceneSuggestionContext,
  count: number,
  excludeTitles: string[] = []
): SceneSuggestionDraft[] {
  const exclude = new Set(excludeTitles.map((t) => t.toLowerCase()));
  const lead = context.characters[0]?.name ?? "the protagonist";
  const place =
    context.locations[0]?.name ??
    (context.world.name.includes("Coast") ? "Pleasure Point" : context.world.name);

  const pool: SceneSuggestionDraft[] = [
    {
      title: "Dawn Patrol",
      summary: `${lead} arrives before sunrise and sees perfect conditions.`,
      character_names: [lead],
      location_name: place,
    },
    {
      title: "The Forecast",
      summary: `News of a large winter swell begins spreading through the lineup.`,
      character_names: context.characters.slice(0, 2).map((c) => c.name),
      location_name: place,
    },
    {
      title: "Meeting a Mentor",
      summary: `An older surfer shares advice that changes how ${lead} reads the ocean.`,
      character_names: [lead],
      location_name: place,
    },
    {
      title: "Contest Day",
      summary: `${lead} enters a first competition and faces nerves and a bigger crowd.`,
      character_names: [lead],
      location_name: place,
    },
    {
      title: "Sunset Session",
      summary: `After a hard day, ${lead} paddles out alone as the light turns gold.`,
      character_names: [lead],
      location_name: place,
    },
    {
      title: "The Wipeout",
      summary: `${lead} takes a heavy fall and has to decide whether to try again.`,
      character_names: [lead],
      location_name: place,
    },
    {
      title: "Celebration on the Beach",
      summary: `Friends gather to mark a milestone ${lead} has been working toward.`,
      character_names: context.characters.map((c) => c.name).slice(0, 3),
      location_name: place,
    },
  ];

  const filtered = pool.filter((s) => !exclude.has(s.title.toLowerCase()));
  return filtered.slice(0, Math.min(Math.max(count, 3), 8));
}

export async function generateSceneSuggestionDrafts(
  context: SceneSuggestionContext,
  options?: { count?: number; excludeTitles?: string[]; single?: boolean }
): Promise<SceneSuggestionGenerationResult> {
  const count = options?.single ? 1 : (options?.count ?? 5);
  const excludeTitles = [
    ...context.existingScenes.map((s) => s.title),
    ...(options?.excludeTitles ?? []),
  ];

  const userPrompt = [
    sceneSuggestionContextToPrompt(context),
    "",
    options?.single
      ? "Suggest exactly ONE new scene beat that fits next. Return JSON with one item in suggestions."
      : `Suggest ${Math.min(count, 8)} scene beats that could happen next in this story. Return JSON.`,
    excludeTitles.length > 0
      ? `Avoid duplicating these titles: ${excludeTitles.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { content, error } = await openAIChatCompletion(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    { jsonMode: true, temperature: 0.85 }
  );

  if (content) {
    const parsed = parseSuggestionsJson(content);
    if (parsed && parsed.length > 0) {
      return {
        suggestions: options?.single ? parsed.slice(0, 1) : parsed,
        source: "openai",
      };
    }
  }

  if (error && process.env.NODE_ENV === "development") {
    console.warn("[scene-suggestions] OpenAI fallback:", error);
  }

  return {
    suggestions: templateSuggestions(context, count, excludeTitles),
    source: "template",
  };
}

export function resolveDraftToPayload(
  draft: SceneSuggestionDraft,
  context: SceneSuggestionContext
): {
  title: string;
  summary: string;
  character_ids: string[];
  world_location_id: string | null;
  location_label: string | null;
} {
  const nameToId = new Map(
    context.characters.map((c) => [c.name.toLowerCase(), c.id])
  );

  const character_ids = (draft.character_names ?? [])
    .map((name) => nameToId.get(name.toLowerCase()))
    .filter((id): id is string => Boolean(id));

  const fallbackIds =
    character_ids.length > 0
      ? character_ids
      : context.characters.length > 0
        ? [context.characters[0].id]
        : [];

  let world_location_id: string | null = null;
  let location_label: string | null = null;

  const locName = draft.location_name?.trim();
  if (locName) {
    const match = context.locations.find(
      (l) => l.name.toLowerCase() === locName.toLowerCase()
    );
    if (match) {
      world_location_id = match.id;
    } else {
      location_label = locName;
    }
  }

  return {
    title: draft.title,
    summary: draft.summary,
    character_ids: fallbackIds,
    world_location_id,
    location_label,
  };
}
