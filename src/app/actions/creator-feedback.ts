"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  type CreatorFeedback,
  normalizeCreatorFeedback,
  type CreatorFeedbackRow,
} from "@/types/creator-feedback";

export type CreatorFeedbackActionState = {
  error?: string;
  success?: boolean;
  feedback?: CreatorFeedback;
};

function formatFeedbackError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find the table")
  ) {
    return (
      "Creator feedback is not available yet. Run supabase/migrations/20250625000000_platform_hardening.sql " +
      "and supabase/fix-platform-hardening-api.sql in the Supabase SQL Editor."
    );
  }
  return message;
}

export async function submitCharacterVisionFeedback(
  _prevState: CreatorFeedbackActionState,
  formData: FormData
): Promise<CreatorFeedbackActionState> {
  const characterId = String(formData.get("character_id") ?? "").trim();
  const ratingRaw = Number(formData.get("rating"));
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!characterId) {
    return { error: "Character is required." };
  }
  if (!Number.isInteger(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
    return { error: "Please select a rating from 1 to 5 stars." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: character, error: characterError } = await supabase
    .from("characters")
    .select("id")
    .eq("id", characterId)
    .eq("user_id", user.id)
    .single();

  if (characterError || !character) {
    return { error: "Character not found." };
  }

  const { data, error } = await supabase
    .from("creator_feedback")
    .insert({
      user_id: user.id,
      entity_type: "character",
      entity_id: characterId,
      feedback_type: "vision_rating",
      rating: ratingRaw,
      notes,
      metadata: {},
    })
    .select()
    .single();

  if (error || !data) {
    return {
      error: formatFeedbackError(error?.message ?? "Failed to save feedback.", error?.code),
    };
  }

  revalidatePath(`/dashboard/characters/${characterId}`);
  return {
    success: true,
    feedback: normalizeCreatorFeedback(data as CreatorFeedbackRow),
  };
}

export async function getLatestCharacterVisionFeedback(
  characterId: string
): Promise<{ feedback: CreatorFeedback | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { feedback: null, error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("creator_feedback")
    .select("*")
    .eq("user_id", user.id)
    .eq("entity_type", "character")
    .eq("entity_id", characterId)
    .eq("feedback_type", "vision_rating")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      feedback: null,
      error: formatFeedbackError(error.message, error.code),
    };
  }

  return {
    feedback: data ? normalizeCreatorFeedback(data as CreatorFeedbackRow) : null,
  };
}
