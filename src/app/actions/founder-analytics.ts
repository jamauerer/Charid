"use server";

import { isFounderAdmin } from "@/lib/founder-auth";
import { sanitizeFounderError } from "@/lib/founder-messages";
import { createAdminClient } from "@/lib/supabase/admin";

export type FounderSupportTicket = {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
};

export type FounderFeedbackEntry = {
  id: string;
  rating: number | null;
  notes: string | null;
  entity_id: string;
  created_at: string;
};

export type FounderModerationEntry = {
  id: string;
  content_type: string;
  entity_type: string;
  status: string;
  risk_score: number;
  risk_categories: string[];
  created_at: string;
};

export type FounderDashboardData = {
  overview: {
    totalUsers: number;
    newUsers7d: number;
    charactersCreated: number;
    worldsCreated: number;
    storiesCreated: number;
    projectsCreated: number;
    publicPortfolios: number;
    supportTicketsOpen: number;
    moderationQueuePending: number;
    avgCharacterRating: number | null;
    newFeedback7d: number;
  };
  support: {
    open: number;
    inProgress: number;
    resolved: number;
    total: number;
    byCategory: { category: string; ticketCount: number }[];
    recentTickets: FounderSupportTicket[];
  };
  moderation: {
    pending: number;
    escalated: number;
    approved: number;
    removed: number;
    flagged7d: number;
    byCategory: { category: string; count: number }[];
    recentActivity: FounderModerationEntry[];
  };
  feedback: {
    avgRating: number | null;
    totalRatings: number;
    distribution: { rating: number; count: number }[];
    recentFeedback: FounderFeedbackEntry[];
  };
  content: {
    totalCharacters: number;
    totalWorlds: number;
    totalStories: number;
    publicCharacters: number;
    privateCharacters: number;
    publicWorlds: number;
    privateWorlds: number;
    publicProfiles: number;
    privateProfiles: number;
    avgAssetsPerCharacter: number;
    avgAssetsPerWorld: number;
  };
  futureMetrics: {
    costTracking: string;
    storageMetrics: string;
    aiCosts: string;
    revenue: string;
    subscriptionMetrics: string;
    retention: string;
  };
  funnel: {
    signups: number;
    createdCharacter: number;
    createdWorld: number;
    createdStory: number;
    publishedPortfolio: number;
    publishedWork: number;
  };
  activationRates: {
    signupToCharacter: number;
    signupToWorld: number;
    signupToStory: number;
    signupToPortfolio: number;
    signupToPublishedWork: number;
  };
  completionRates: {
    characterWithAssets: number;
    worldWithAssets: number;
    storyWithAssets: number;
  };
  dropoffPoints: {
    stage: string;
    fromCount: number;
    toCount: number;
    dropoffPct: number;
  }[];
};

function aggregateModerationCategories(
  rows: { risk_categories?: string[] | null }[]
): { category: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const category of row.risk_categories ?? []) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function dropoff(fromCount: number, toCount: number) {
  if (fromCount <= 0) return 0;
  return Math.round(((fromCount - toCount) / fromCount) * 1000) / 10;
}

export async function getFounderDashboardData(): Promise<{
  data: FounderDashboardData | null;
  error?: string;
}> {
  if (!(await isFounderAdmin())) {
    return { data: null, error: "Forbidden." };
  }

  try {
    const admin = createAdminClient();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      overviewRes,
      activityRes,
      supportSummaryRes,
      supportCategoryRes,
      feedbackSummaryRes,
      contentRes,
      recentTicketsRes,
      distributionRes,
      recentFeedbackRes,
      moderationSummaryRes,
      moderationRecentRes,
      moderationCategoryRes,
      moderationStatusRes,
      publicCharacterUsersRes,
      publicWorldUsersRes,
      characterAssetUsersRes,
      worldAssetUsersRes,
      storyAssetUsersRes,
      newFeedback7dRes,
      projectsCountRes,
    ] = await Promise.all([
      admin.from("v_founder_platform_overview").select("*").single(),
      admin.from("v_founder_creator_activity").select("*").single(),
      admin.from("v_founder_support_summary").select("*").single(),
      admin.from("v_founder_support_by_category").select("*"),
      admin.from("v_founder_character_feedback_summary").select("*").single(),
      admin.from("v_founder_content_metrics").select("*").single(),
      admin
        .from("support_tickets")
        .select("id, subject, category, status, priority, created_at")
        .order("created_at", { ascending: false })
        .limit(15),
      admin
        .from("creator_feedback")
        .select("rating")
        .eq("entity_type", "character")
        .eq("feedback_type", "vision_rating")
        .not("rating", "is", null),
      admin
        .from("creator_feedback")
        .select("id, rating, notes, entity_id, created_at")
        .eq("entity_type", "character")
        .eq("feedback_type", "vision_rating")
        .order("created_at", { ascending: false })
        .limit(10),
      admin.from("v_founder_moderation_summary").select("*").single(),
      admin
        .from("moderation_queue")
        .select(
          "id, content_type, entity_type, status, risk_score, risk_categories, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(15),
      admin
        .from("moderation_queue")
        .select("risk_categories")
        .not("risk_categories", "eq", "{}"),
      admin.from("moderation_queue").select("status"),
      admin.from("characters").select("user_id").eq("is_public", true),
      admin.from("worlds").select("user_id").eq("is_public", true),
      admin.from("character_images").select("character_id"),
      admin.from("world_images").select("world_id"),
      admin.from("story_images").select("story_id"),
      admin
        .from("creator_feedback")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo),
      admin.from("projects").select("id", { count: "exact", head: true }),
    ]);

    const overview = overviewRes.data;
    const activity = activityRes.data;
    const supportSummary = supportSummaryRes.data;
    const content = contentRes.data;
    const feedbackSummary = feedbackSummaryRes.data;
    const moderationSummary = moderationSummaryRes.data;

    const statusCounts = { pending: 0, escalated: 0, approved: 0, removed: 0 };
    for (const row of moderationStatusRes.data ?? []) {
      const status = row.status as keyof typeof statusCounts;
      if (status in statusCounts) statusCounts[status] += 1;
    }

    const ratingCounts = new Map<number, number>();
    for (const row of distributionRes.data ?? []) {
      if (row.rating == null) continue;
      ratingCounts.set(row.rating, (ratingCounts.get(row.rating) ?? 0) + 1);
    }

    const distribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: ratingCounts.get(rating) ?? 0,
    }));

    const totalUsers = Number(overview?.total_users ?? 0);
    const createdCharacter = Number(activity?.users_with_characters ?? 0);
    const createdWorld = Number(activity?.users_with_worlds ?? 0);
    const createdStory = Number(activity?.users_with_stories ?? 0);
    const publishedPortfolio = Number(
      activity?.users_with_public_portfolios ?? 0
    );

    const publishedWorkUserIds = new Set<string>();
    for (const row of publicCharacterUsersRes.data ?? []) {
      if (row.user_id) publishedWorkUserIds.add(row.user_id);
    }
    for (const row of publicWorldUsersRes.data ?? []) {
      if (row.user_id) publishedWorkUserIds.add(row.user_id);
    }
    const publishedWork = publishedWorkUserIds.size;

    async function usersWithAssetsForEntities(
      entityIds: string[],
      table: "characters" | "worlds" | "stories",
      idColumn: "id"
    ): Promise<number> {
      if (entityIds.length === 0) return 0;
      const uniqueIds = [...new Set(entityIds)];
      const { data } = await admin
        .from(table)
        .select("user_id")
        .in(idColumn, uniqueIds);
      return new Set((data ?? []).map((row) => row.user_id).filter(Boolean))
        .size;
    }

    const characterAssetUsers = await usersWithAssetsForEntities(
      (characterAssetUsersRes.data ?? []).map((row) => row.character_id),
      "characters",
      "id"
    );
    const worldAssetUsers = await usersWithAssetsForEntities(
      (worldAssetUsersRes.data ?? []).map((row) => row.world_id),
      "worlds",
      "id"
    );
    const storyAssetUsers = await usersWithAssetsForEntities(
      (storyAssetUsersRes.data ?? []).map((row) => row.story_id),
      "stories",
      "id"
    );

    const funnel = {
      signups: totalUsers,
      createdCharacter,
      createdWorld,
      createdStory,
      publishedPortfolio,
      publishedWork,
    };

    const activationRates = {
      signupToCharacter: pct(createdCharacter, totalUsers),
      signupToWorld: pct(createdWorld, totalUsers),
      signupToStory: pct(createdStory, totalUsers),
      signupToPortfolio: pct(publishedPortfolio, totalUsers),
      signupToPublishedWork: pct(publishedWork, totalUsers),
    };

    const completionRates = {
      characterWithAssets: pct(characterAssetUsers, createdCharacter),
      worldWithAssets: pct(worldAssetUsers, createdWorld),
      storyWithAssets: pct(storyAssetUsers, createdStory),
    };

    const dropoffPoints = [
      {
        stage: "Signups → Created Character",
        fromCount: totalUsers,
        toCount: createdCharacter,
        dropoffPct: dropoff(totalUsers, createdCharacter),
      },
      {
        stage: "Created Character → Created World",
        fromCount: createdCharacter,
        toCount: createdWorld,
        dropoffPct: dropoff(createdCharacter, createdWorld),
      },
      {
        stage: "Created World → Created Story",
        fromCount: createdWorld,
        toCount: createdStory,
        dropoffPct: dropoff(createdWorld, createdStory),
      },
      {
        stage: "Created Story → Published Portfolio",
        fromCount: createdStory,
        toCount: publishedPortfolio,
        dropoffPct: dropoff(createdStory, publishedPortfolio),
      },
      {
        stage: "Published Portfolio → Published Work",
        fromCount: publishedPortfolio,
        toCount: publishedWork,
        dropoffPct: dropoff(publishedPortfolio, publishedWork),
      },
    ];

    return {
      data: {
        overview: {
          totalUsers: Number(overview?.total_users ?? 0),
          newUsers7d: Number(overview?.new_users_7d ?? 0),
          charactersCreated: Number(overview?.characters_created ?? 0),
          worldsCreated: Number(overview?.worlds_created ?? 0),
          storiesCreated: Number(overview?.stories_created ?? 0),
          projectsCreated: Number(projectsCountRes.count ?? 0),
          publicPortfolios: Number(
            activity?.users_with_public_portfolios ?? 0
          ),
          supportTicketsOpen: Number(overview?.support_tickets_open ?? 0),
          moderationQueuePending: Number(
            moderationSummary?.pending_count ?? statusCounts.pending
          ),
          avgCharacterRating: overview?.avg_character_rating
            ? Number(overview.avg_character_rating)
            : null,
          newFeedback7d: Number(newFeedback7dRes.count ?? 0),
        },
        support: {
          open: Number(supportSummary?.open_tickets ?? 0),
          inProgress: Number(supportSummary?.in_progress_tickets ?? 0),
          resolved: Number(supportSummary?.resolved_tickets ?? 0),
          total: Number(supportSummary?.total_tickets ?? 0),
          byCategory: (supportCategoryRes.data ?? []).map((row) => ({
            category: row.category,
            ticketCount: Number(row.ticket_count),
          })),
          recentTickets: (recentTicketsRes.data ?? []) as FounderSupportTicket[],
        },
        moderation: {
          pending: Number(
            moderationSummary?.pending_count ?? statusCounts.pending
          ),
          escalated: Number(
            moderationSummary?.escalated_count ?? statusCounts.escalated
          ),
          approved: statusCounts.approved,
          removed: statusCounts.removed,
          flagged7d: Number(moderationSummary?.flagged_7d ?? 0),
          byCategory: aggregateModerationCategories(
            moderationCategoryRes.data ?? []
          ),
          recentActivity: (moderationRecentRes.data ?? []).map((row) => ({
            id: row.id,
            content_type: row.content_type,
            entity_type: row.entity_type,
            status: row.status,
            risk_score: Number(row.risk_score),
            risk_categories: row.risk_categories ?? [],
            created_at: row.created_at,
          })),
        },
        feedback: {
          avgRating: feedbackSummary?.avg_rating
            ? Number(feedbackSummary.avg_rating)
            : null,
          totalRatings: Number(feedbackSummary?.response_count ?? 0),
          distribution,
          recentFeedback: (recentFeedbackRes.data ??
            []) as FounderFeedbackEntry[],
        },
        content: {
          totalCharacters: Number(content?.total_characters ?? 0),
          totalWorlds: Number(content?.total_worlds ?? 0),
          totalStories: Number(content?.total_stories ?? 0),
          publicCharacters: Number(content?.public_characters ?? 0),
          privateCharacters: Number(content?.private_characters ?? 0),
          publicWorlds: Number(content?.public_worlds ?? 0),
          privateWorlds: Number(content?.private_worlds ?? 0),
          publicProfiles: Number(content?.public_profiles ?? 0),
          privateProfiles: Number(content?.private_profiles ?? 0),
          avgAssetsPerCharacter: Number(content?.avg_assets_per_character ?? 0),
          avgAssetsPerWorld: Number(content?.avg_assets_per_world ?? 0),
        },
        futureMetrics: {
          costTracking: "Coming soon",
          storageMetrics: "Coming soon",
          aiCosts: "Coming soon",
          revenue: "Coming soon",
          subscriptionMetrics: "Coming soon",
          retention: "Coming soon",
        },
        funnel,
        activationRates,
        completionRates,
        dropoffPoints,
      },
    };
  } catch (err) {
    const raw =
      err instanceof Error
        ? err.message
        : "Failed to load founder dashboard data.";
    return {
      data: null,
      error: sanitizeFounderError(raw) ?? "Founder analytics unavailable.",
    };
  }
}
