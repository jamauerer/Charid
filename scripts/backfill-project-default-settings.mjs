/**
 * One-time backfill: ensure every project has a linked setting (world) row.
 *
 * Usage:
 *   node scripts/backfill-project-default-settings.mjs
 *   node scripts/backfill-project-default-settings.mjs --dry-run
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = {
  ...loadEnv(path.join(__dirname, "..", ".env.local")),
  ...process.env,
};

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const dryRun = process.argv.includes("--dry-run");

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const AUTO_SETTING_DESCRIPTION = "[auto]";

function defaultSettingName(projectTitle) {
  return `${projectTitle} — Setting`;
}

function slugifyWorldName(value) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  return slug.length >= 2 ? slug : "world";
}

function slugWithSuffix(base, suffix) {
  const suffixStr = String(suffix);
  const maxBaseLen = 50 - suffixStr.length;
  return `${base.slice(0, maxBaseLen)}${suffixStr}`;
}

async function isWorldSlugTaken(supabase, userId, slug) {
  const { data } = await supabase
    .from("worlds")
    .select("id")
    .eq("user_id", userId)
    .eq("slug", slug)
    .maybeSingle();
  return data !== null;
}

async function resolveAvailableWorldSlug(supabase, userId, name) {
  const base = slugifyWorldName(name);
  if (!(await isWorldSlugTaken(supabase, userId, base))) return base;
  for (let n = 2; n <= 9999; n++) {
    const candidate = slugWithSuffix(base, n);
    if (!(await isWorldSlugTaken(supabase, userId, candidate))) return candidate;
  }
  throw new Error("Unable to allocate slug");
}

async function ensureProjectDefaultSetting(supabase, userId, project) {
  const { data: linkedWorld } = await supabase
    .from("worlds")
    .select("*")
    .eq("project_id", project.id)
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (linkedWorld) {
    return { action: "exists", worldId: linkedWorld.id };
  }

  const { data: storyRows } = await supabase
    .from("stories")
    .select("world_id")
    .eq("project_id", project.id)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  const storyWorldIds = [
    ...new Set(
      (storyRows ?? [])
        .map((row) => row.world_id)
        .filter(Boolean)
    ),
  ];

  if (storyWorldIds.length > 0) {
    const { data: orphanWorld } = await supabase
      .from("worlds")
      .select("*")
      .eq("id", storyWorldIds[0])
      .eq("user_id", userId)
      .maybeSingle();

    if (orphanWorld) {
      if (!orphanWorld.project_id) {
        if (dryRun) {
          return { action: "link", worldId: orphanWorld.id };
        }
        await supabase
          .from("worlds")
          .update({ project_id: project.id })
          .eq("id", orphanWorld.id)
          .eq("user_id", userId);
      }
      return { action: "link", worldId: orphanWorld.id };
    }
  }

  const name = defaultSettingName(project.title);
  const slug = await resolveAvailableWorldSlug(supabase, userId, name);

  if (dryRun) {
    return { action: "create", name, slug };
  }

  const { data: created, error } = await supabase
    .from("worlds")
    .insert({
      user_id: userId,
      project_id: project.id,
      name,
      slug,
      description: AUTO_SETTING_DESCRIPTION,
      is_public: false,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { action: "create", worldId: created.id, name, slug };
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: projects, error: projectsError } = await supabase
  .from("projects")
  .select("id, user_id, title")
  .order("created_at", { ascending: true });

if (projectsError) {
  console.error(projectsError.message);
  process.exit(1);
}

let created = 0;
let linked = 0;
let skipped = 0;

for (const project of projects ?? []) {
  try {
    const result = await ensureProjectDefaultSetting(
      supabase,
      project.user_id,
      project
    );
    if (result.action === "exists") {
      skipped += 1;
      console.log(`SKIP  ${project.title} (${project.id}) — already has setting`);
    } else if (result.action === "link") {
      linked += 1;
      console.log(
        `${dryRun ? "DRY " : ""}LINK  ${project.title} (${project.id}) → world ${result.worldId}`
      );
    } else {
      created += 1;
      console.log(
        `${dryRun ? "DRY " : ""}CREATE ${project.title} (${project.id}) → ${result.name}`
      );
    }
  } catch (err) {
    console.error(`FAIL  ${project.title} (${project.id}):`, err.message);
  }
}

console.log(
  `\nDone${dryRun ? " (dry run)" : ""}: ${created} created, ${linked} linked, ${skipped} skipped, ${projects?.length ?? 0} total projects`
);
