import type { AiPromptTemplate } from "@/types/ai/core";

const now = new Date().toISOString();

export const DEFAULT_PROMPT_TEMPLATES: AiPromptTemplate[] = [
  {
    id: "story_analysis",
    name: "Story Analysis",
    description: "Analyze story, scenes, characters, locations, and timeline for production planning.",
    category: "production_planning",
    systemPrompt:
      "You are CharID, a visual storytelling production assistant. Analyze stories for adaptation across storybooks, graphic novels, film, and campaigns. Return JSON only.",
    userPromptTemplate:
      "Analyze this story for production planning.\n\nStory: {{storyTitle}}\nSynopsis: {{synopsis}}\nScenes: {{scenes}}\nCharacters: {{characters}}\nLocations: {{locations}}\n\nReturn JSON: { storySummary, sceneSummary, suggestedPageCount, suggestedPanelCount, suggestedReadingPace, characterNotes[], locationNotes[], timelineNotes[] }",
    updatedAt: now,
  },
  {
    id: "scene_breakdown",
    name: "Scene Breakdown",
    description: "Break scenes into visual storytelling beats.",
    category: "production_planning",
    systemPrompt: "You are CharID. Break narrative scenes into visual production beats. JSON only.",
    userPromptTemplate:
      "Break these scenes into production beats:\n{{scenes}}\n\nReturn JSON: { beats: [{ sceneId, title, visualBeat, emotionalTone }] }",
    updatedAt: now,
  },
  {
    id: "comic_page_planning",
    name: "Page Planning",
    description: "Propose volume structure and page breakdown for visual production.",
    category: "production_planning",
    systemPrompt:
      "You are CharID. Plan page structure from story analysis for visual storytelling production. JSON only. Creator reviews before commit.",
    userPromptTemplate:
      "Plan a production volume from:\n{{storyAnalysis}}\n\nTarget pages: {{pageCount}}\n\nReturn JSON: { issueTitle, issueDescription, pageCount, pages: [{ pageNumber, title, description, panelCount, sceneIds, pacing }], pacingNotes }",
    updatedAt: now,
  },
  {
    id: "panel_planning",
    name: "Panel Planning",
    description: "Panel descriptions, camera, composition, dialogue suggestions.",
    category: "production_planning",
    systemPrompt:
      "You are CharID. Plan individual panels for visual production. JSON only. No image generation.",
    userPromptTemplate:
      "Plan {{panelCount}} panels for page \"{{pageTitle}}\": {{pageDescription}}\n\nContext: {{context}}\n\nReturn JSON: { panels: [{ panelIndex, description, cameraAngle, composition, characterPlacement, emotion, lighting, dialogueSuggestion, captionSuggestion, sfxSuggestion }] }",
    updatedAt: now,
  },
  {
    id: "character_description",
    name: "Character Description",
    description: "Character visual description for continuity.",
    category: "characters",
    systemPrompt: "You are CharID. Describe characters for visual consistency across production.",
    userPromptTemplate: "Describe character for visual production:\n{{character}}",
    updatedAt: now,
  },
  {
    id: "character_consistency",
    name: "Character Consistency",
    description: "Maintain character appearance across scenes and assets.",
    category: "characters",
    systemPrompt: "You are CharID. Evaluate character consistency across visual assets.",
    userPromptTemplate:
      "Character reference:\n{{character}}\n\nScenes/assets:\n{{context}}\n\nReturn consistency notes.",
    updatedAt: now,
  },
  {
    id: "environment_description",
    name: "Environment Prompt",
    description: "Location and environment visual description.",
    category: "image_generation",
    systemPrompt: "You are CharID. Describe environments for visual production and image generation.",
    userPromptTemplate: "Describe environment:\n{{location}}",
    updatedAt: now,
  },
  {
    id: "image_prompt",
    name: "Image Prompt",
    description: "Image generation prompt from panel or scene plan.",
    category: "image_generation",
    systemPrompt: "You are CharID. Write image generation prompts for visual storytelling panels.",
    userPromptTemplate:
      "Panel plan:\n{{panelPlan}}\nArt style: {{artStyle}}\n\nWrite a single image prompt.",
    updatedAt: now,
  },
  {
    id: "style_prompt",
    name: "Style Prompt",
    description: "Art direction and style guidance for image generation.",
    category: "image_generation",
    systemPrompt: "You are CharID. Write style prompts that preserve creative direction.",
    userPromptTemplate: "Art direction:\n{{artStyle}}\n\nContext:\n{{context}}\n\nWrite a style prompt.",
    updatedAt: now,
  },
  {
    id: "video_prompt",
    name: "Video Prompt",
    description: "Video generation prompt for motion storytelling.",
    category: "video",
    systemPrompt: "You are CharID. Write video generation prompts for visual storytelling.",
    userPromptTemplate: "Scene: {{scene}}\n\nWrite a video prompt.",
    updatedAt: now,
  },
  {
    id: "campaign_planning",
    name: "Campaign Planning",
    description: "Plan character-driven advertising and campaign storytelling.",
    category: "advertising",
    systemPrompt:
      "You are CharID. Plan advertising campaigns that use characters, scenes, assets, and narrative consistency.",
    userPromptTemplate:
      "Campaign brief:\n{{context}}\n\nCharacters: {{characters}}\n\nReturn JSON: { campaignTitle, beats[], assetNeeds[] }",
    updatedAt: now,
  },
  {
    id: "product_prompt",
    name: "Product Prompt",
    description: "Product-focused prompt with character and scene consistency.",
    category: "advertising",
    systemPrompt: "You are CharID. Write product prompts grounded in storytelling assets.",
    userPromptTemplate: "Product: {{context}}\nCharacters: {{characters}}\n\nWrite a product prompt.",
    updatedAt: now,
  },
  {
    id: "production_intelligence_story",
    name: "Production Intelligence — Story",
    description: "Rich story metadata for pacing, density, and format estimates.",
    category: "production_intelligence",
    systemPrompt:
      "You are CharID Production Intelligence. Analyze stories for visual production planning. Return JSON only with concise explanations.",
    userPromptTemplate:
      "Analyze for production intelligence:\nStory: {{storyTitle}}\nSynopsis: {{synopsis}}\nProject type: {{projectType}}\n\nReturn JSON with storyType, pacing, dialogueDensity, actionDensity, estimates, and recommendations[].explanation.",
    updatedAt: now,
  },
  {
    id: "scene_intelligence",
    name: "Scene Intelligence",
    description: "Per-scene purpose, pacing, and panel estimates.",
    category: "production_intelligence",
    systemPrompt: "You are CharID Production Intelligence. Analyze scenes for production planning. JSON only.",
    userPromptTemplate:
      "Scenes:\n{{scenes}}\nStory context: {{context}}\n\nReturn JSON: { scenes: [{ sceneId, purpose, estimatedPanels, dialogueLoad, actionLoad, visualComplexity, sceneImportance, recommendations[] }] }",
    updatedAt: now,
  },
  {
    id: "page_intelligence",
    name: "Page Intelligence",
    description: "Layout complexity and panel count recommendations per page.",
    category: "production_intelligence",
    systemPrompt: "You are CharID Production Intelligence. Recommend page layouts and panel counts. JSON only.",
    userPromptTemplate:
      "Page plan context:\n{{pagePlan}}\n\nReturn JSON with layoutStyle, recommendedPanelCount, layoutComplexity, recommendations[].explanation per page.",
    updatedAt: now,
  },
  {
    id: "panel_intelligence",
    name: "Panel Intelligence",
    description: "Camera, emotion, and dialogue density per panel.",
    category: "production_intelligence",
    systemPrompt: "You are CharID Production Intelligence. Plan panel-level cinematography. JSON only.",
    userPromptTemplate:
      "Panel context:\n{{panelPlan}}\n\nReturn JSON with cameraRecommendation, recommendedEmotion, dialogueDensity, visualImportance, recommendations[] per panel.",
    updatedAt: now,
  },
  {
    id: "film_planning",
    name: "Film Planning",
    description: "Shot count, keyframes, and camera motion planning (no generation).",
    category: "production_intelligence",
    systemPrompt: "You are CharID Production Intelligence. Plan film shots and keyframes. JSON only. No video generation.",
    userPromptTemplate:
      "Scene plan:\n{{scenes}}\n\nReturn JSON: { sceneDuration, estimatedShotCount, recommendedKeyframes, cameraMotionSuggestion, recommendations[] }",
    updatedAt: now,
  },
  {
    id: "advertisement_planning",
    name: "Advertisement Planning",
    description: "Campaign goals, hierarchy, and CTA planning.",
    category: "production_intelligence",
    systemPrompt:
      "You are CharID Production Intelligence. Plan character-driven advertising. JSON only. No generation.",
    userPromptTemplate:
      "Brief:\n{{context}}\n\nReturn JSON: { campaignGoal, targetAudience, primaryProduct, supportingAssets[], recommendedLayoutStyle, recommendedVisualHierarchy, recommendedCallToAction, recommendations[] }",
    updatedAt: now,
  },
];
