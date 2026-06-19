const fs = require("fs");
const path = require("path");

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
    )
      val = val.slice(1, -1);
    env[key] = val;
  }
  return env;
}

const env = { ...loadEnv(path.join(__dirname, "..", ".env.local")), ...process.env };
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  env.SUPABASE_SERVICE_ROLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const databaseUrl = env.DATABASE_URL;

const FIX_MAP = {
  "20250625000000_platform_hardening.sql": "fix-platform-hardening-api.sql",
  "20250627000000_world_bible.sql": "fix-world-bible-api.sql",
  "20250628000000_world_slot_roles_v2.sql": null,
  "20250629000000_founder_admin_role.sql": "fix-founder-admin-api.sql",
  "20250630000000_moderation_queue.sql": "fix-moderation-api.sql",
  "20250631000000_story_bible.sql": "fix-story-bible-api.sql",
  "20250701000000_phase_a_worldbuilding_foundations.sql":
    "fix-worldbuilding-foundations-api.sql",
};

const EXPECTED = [
  ["20250615000000_expand_character_fields.sql", "column:characters.species"],
  ["20250616000000_portfolio_profiles.sql", "table:profiles"],
  ["20250617000000_character_images.sql", "table:character_images"],
  ["20250618000000_worlds.sql", "table:worlds"],
  ["20250619000000_stories.sql", "table:stories"],
  ["20250620000000_chapters.sql", "table:chapters"],
  ["20250621000000_story_project_type.sql", "column:stories.project_type"],
  ["20250622000000_story_images.sql", "table:story_images"],
  ["20250623000000_character_bible.sql", "table:character_bible"],
  ["20250624000000_privacy_defaults_private.sql", "column:worlds.is_public_default"],
  ["20250625000000_platform_hardening.sql", "table:support_tickets"],
  [
    "20250626000000_character_image_slot_assignments.sql",
    "table:character_image_slot_assignments",
  ],
  ["20250627000000_world_bible.sql", "table:world_bible"],
  ["20250628000000_world_slot_roles_v2.sql", "constraint:world_slot_v2"],
  ["20250629000000_founder_admin_role.sql", "column:profiles.role"],
  ["20250630000000_moderation_queue.sql", "table:moderation_queue"],
  ["20250631000000_story_bible.sql", "table:story_bible"],
  [
    "20250701000000_phase_a_worldbuilding_foundations.sql",
    "table:character_relationships",
  ],
];

const SQL = `WITH expected (migration_file, probe) AS (
  VALUES
    ('20250615000000_expand_character_fields.sql',        'column:characters.species'),
    ('20250616000000_portfolio_profiles.sql',              'table:profiles'),
    ('20250617000000_character_images.sql',                'table:character_images'),
    ('20250618000000_worlds.sql',                           'table:worlds'),
    ('20250619000000_stories.sql',                          'table:stories'),
    ('20250620000000_chapters.sql',                        'table:chapters'),
    ('20250621000000_story_project_type.sql',               'column:stories.project_type'),
    ('20250622000000_story_images.sql',                     'table:story_images'),
    ('20250623000000_character_bible.sql',                  'table:character_bible'),
    ('20250624000000_privacy_defaults_private.sql',         'column:worlds.is_public_default'),
    ('20250625000000_platform_hardening.sql',               'table:support_tickets'),
    ('20250626000000_character_image_slot_assignments.sql', 'table:character_image_slot_assignments'),
    ('20250627000000_world_bible.sql',                      'table:world_bible'),
    ('20250628000000_world_slot_roles_v2.sql',              'constraint:world_slot_v2'),
    ('20250629000000_founder_admin_role.sql',               'column:profiles.role'),
    ('20250630000000_moderation_queue.sql',                 'table:moderation_queue'),
    ('20250631000000_story_bible.sql',                      'table:story_bible'),
    ('20250701000000_phase_a_worldbuilding_foundations.sql','table:character_relationships')
),
probes AS (
  SELECT migration_file, probe,
    CASE probe
      WHEN 'table:profiles' THEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles')
      WHEN 'table:character_images' THEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='character_images')
      WHEN 'table:worlds' THEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='worlds')
      WHEN 'table:stories' THEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='stories')
      WHEN 'table:chapters' THEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='chapters')
      WHEN 'table:story_images' THEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='story_images')
      WHEN 'table:character_bible' THEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='character_bible')
      WHEN 'table:support_tickets' THEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='support_tickets')
      WHEN 'table:character_image_slot_assignments' THEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='character_image_slot_assignments')
      WHEN 'table:world_bible' THEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='world_bible')
      WHEN 'table:moderation_queue' THEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='moderation_queue')
      WHEN 'table:story_bible' THEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='story_bible')
      WHEN 'table:character_relationships' THEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='character_relationships')
      WHEN 'column:characters.species' THEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='characters' AND column_name='species')
      WHEN 'column:stories.project_type' THEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='stories' AND column_name='project_type')
      WHEN 'column:profiles.role' THEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='role')
      WHEN 'column:worlds.is_public_default' THEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='worlds' AND column_name='is_public'
          AND column_default LIKE '%false%'
      )
      WHEN 'constraint:world_slot_v2' THEN EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE t.relname = 'world_image_slot_assignments'
          AND c.conname = 'world_image_slot_assignments_slot_role_check'
          AND pg_get_constraintdef(c.oid) LIKE '%mood_board%'
      )
    END AS applied
  FROM expected
)
SELECT migration_file,
       CASE WHEN applied THEN 'Applied' ELSE 'NOT APPLIED' END AS status
FROM probes
ORDER BY migration_file;`;

async function runPostgres() {
  let Client;
  try {
    Client = require("pg").Client;
  } catch {
    return { ok: false, reason: "pg module not installed" };
  }
  if (!databaseUrl) return { ok: false, reason: "DATABASE_URL not set" };
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    const res = await client.query(SQL);
    return { ok: true, rows: res.rows, method: "postgres" };
  } finally {
    await client.end();
  }
}

async function probeTable(supabase, table) {
  const { error } = await supabase.from(table).select("*").limit(0);
  if (!error) return true;
  const msg = (error.message || "") + (error.code || "");
  if (
    error.code === "PGRST205" ||
    /Could not find the table|relation .* does not exist/i.test(msg)
  )
    return false;
  if (error.code === "42501" || /permission denied/i.test(msg)) return "unknown_rls";
  return false;
}

async function probeColumn(supabase, table, column) {
  const { error } = await supabase.from(table).select(column).limit(0);
  if (!error) return true;
  const msg = error.message || "";
  if (/column .* does not exist|PGRST204/i.test(msg)) return false;
  if (error.code === "PGRST205") return false;
  if (error.code === "42501" || /permission denied/i.test(msg)) return "unknown_rls";
  return false;
}

async function runSupabaseProbes() {
  if (!url || !key)
    return {
      ok: false,
      reason: "Missing NEXT_PUBLIC_SUPABASE_URL or Supabase key in .env.local",
    };
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const rows = [];
  const notes = [];
  for (const [migration_file, probe] of EXPECTED) {
    let applied = false;
    let note = null;
    if (probe.startsWith("table:")) {
      const table = probe.slice(6);
      const r = await probeTable(supabase, table);
      if (r === "unknown_rls") {
        note = "table probe blocked by RLS/permissions; treating as present if no PGRST205";
        applied = true;
      } else applied = r;
    } else if (probe === "column:characters.species") {
      const r = await probeColumn(supabase, "characters", "species");
      applied = r === true || r === "unknown_rls";
    } else if (probe === "column:stories.project_type") {
      const r = await probeColumn(supabase, "stories", "project_type");
      applied = r === true || r === "unknown_rls";
    } else if (probe === "column:profiles.role") {
      const r = await probeColumn(supabase, "profiles", "role");
      applied = r === true || r === "unknown_rls";
    } else if (probe === "column:worlds.is_public_default") {
      const r = await probeColumn(supabase, "worlds", "is_public");
      applied = r === true || r === "unknown_rls";
      if (applied)
        note =
          "REST probe: is_public column only (default false not verified without postgres)";
    } else if (probe === "constraint:world_slot_v2") {
      applied = null;
      note = "constraint probe requires postgres/information_schema; not verified via REST";
    }
    rows.push({
      migration_file,
      probe,
      status:
        applied === null
          ? "UNKNOWN (needs DATABASE_URL)"
          : applied
            ? "Applied"
            : "NOT APPLIED",
      note,
    });
  }
  return { ok: true, rows, method: "supabase-rest-probes" };
}

(async () => {
  const connection = {
    hasUrl: Boolean(url),
    hasKey: Boolean(key),
    hasDatabaseUrl: Boolean(databaseUrl),
    keyType: env.SUPABASE_SERVICE_ROLE_KEY
      ? "service_role"
      : env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? "anon"
        : "none",
  };

  let result;
  const pgAttempt = await runPostgres();
  if (pgAttempt.ok) {
    result = {
      connection,
      method: pgAttempt.method,
      rows: pgAttempt.rows.map((r) => ({
        migration_file: r.migration_file,
        status: r.status,
      })),
    };
  } else {
    const probe = await runSupabaseProbes();
    if (!probe.ok) {
      console.log(
        JSON.stringify(
          {
            connected: false,
            connection,
            postgresSkip: pgAttempt.reason,
            error: probe.reason,
          },
          null,
          2
        )
      );
      process.exit(1);
    }
    result = {
      connection,
      method: probe.method,
      postgresSkip: pgAttempt.reason,
      rows: probe.rows.map(({ migration_file, status, note, probe: p }) => ({
        migration_file,
        status,
        ...(note ? { note } : {}),
        probe: p,
      })),
    };
  }

  const notApplied = result.rows.filter((r) => r.status === "NOT APPLIED");
  result.fix_scripts_for_not_applied = notApplied.map((r) => {
    const fix = FIX_MAP[r.migration_file];
    return {
      migration_file: r.migration_file,
      fix_script: fix === undefined ? "(no mapped fix)" : fix,
    };
  });

  console.log(JSON.stringify(result, null, 2));
})().catch((e) => {
  console.error(JSON.stringify({ connected: false, error: e.message }, null, 2));
  process.exit(1);
});
