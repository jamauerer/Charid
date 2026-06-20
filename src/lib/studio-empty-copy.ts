/** Encouraging empty-state copy — creative tone, not technical. */

export const STUDIO_EMPTY_COPY = {
  project: {
    headline: "What do you want to create?",
    description:
      "A comic, a picture book, a setting — start a project and your art will live here.",
  },
  story: {
    headline: "No stories yet",
    description: "Start your first story when you're ready.",
  },
  character: {
    headline: "Who do you want to meet?",
    description: "Add a portrait when you're ready — or start with a name.",
  },
  world: {
    headline: "What kind of place are we exploring?",
    description: "This setting is still taking shape.",
  },
  scene: {
    headline: "What happens next?",
    description: "Scenes are the beats where your story comes alive.",
  },
  studio: {
    headline: "Your studio is waiting for its first image.",
    description: "Create a character, setting, or story — your art will appear here.",
  },
} as const;

/** Inline placeholder copy for missing images and covers */
export const EMPTY_PLACEHOLDER_COPY = {
  cover: {
    title: "No cover yet",
    description: "This project is waiting for its first visual.",
  },
  projectCover: {
    title: "No cover yet",
    description: "Add a cover when you're ready to show this work.",
  },
  storyCover: {
    title: "No cover yet",
    description: "Your story's first visual can go here.",
  },
  worldCover: {
    title: "No cover yet",
    description: "This setting is still taking shape.",
  },
  characterPhoto: {
    title: "No portrait yet",
    description: "Add a photo when you're ready.",
  },
  image: {
    title: "No image yet",
    description: "Visuals you add will appear here.",
  },
  location: {
    title: "No image yet",
    description: "A reference or illustration can live here.",
  },
} as const;
