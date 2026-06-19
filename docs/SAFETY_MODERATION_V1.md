# Safety & Moderation V1

Protect creators, protect the platform, and reduce legal risk while respecting creator privacy.

## Core principles

- **Private content stays private** — human review only when AI flags content, a report is submitted, or a legal obligation exists.
- **Scanning is automated** — AI is advisory; human review is authoritative.
- **Never auto-delete on flag** — flagged uploads remain stored; admins decide Approve / Remove / Escalate / Suspend.

## Architecture

```
Upload or save text
       ↓
  Content scanner (pluggable)
       ↓
   Safe ──────────→ stored normally
       ↓
  Flagged ────────→ moderation_queue (pending)
                         ↓
              /dashboard/admin/moderation
                         ↓
         Approve | Remove | Escalate | Suspend account
```

## Database

Run in Supabase SQL Editor:

1. `supabase/migrations/20250630000000_moderation_queue.sql`
2. `supabase/fix-moderation-api.sql`

### `moderation_queue`

| Column | Purpose |
|--------|---------|
| `content_type` | `image` or `text` |
| `entity_type` | e.g. `character_image`, `chapter`, `world` |
| `entity_id` | Related record UUID |
| `risk_score` | 0–1 advisory score |
| `risk_categories` | e.g. `explicit_sexual_content`, `platform_policy` |
| `scanner_result` | Full JSON from scanner |
| `status` | `pending`, `approved`, `removed`, `escalated` |

### Account suspension

`profiles.is_suspended` and `profiles.suspended_at` — set via admin **Suspend account** action.

## Scanner providers

Set `MODERATION_SCANNER` in environment:

| Value | Behavior |
|-------|----------|
| `stub` (default) | Always safe — production pipeline placeholder |
| `heuristic` | Dev-only text test: include `__moderation_flag_test__` in content to simulate a flag |

Replace `getContentScanner()` in `src/lib/moderation/scanner.ts` with a production provider (OpenAI Moderation, AWS Rekognition, Hive, etc.) when ready.

## Integration points

### Image scan (`scanUploadedImage`)

Runs **after** successful upload + DB write. Never blocks or deletes.

- `uploadCharacterImage`
- `uploadStoryImage`
- `createCharacter` (legacy photo)
- `createWorld` / `updateWorld` (cover)
- `updateProfile` (avatar)
- `submitSupportTicket` (screenshot)

### Text scan (`scanSavedText`)

Runs **after** successful save. Never blocks writes.

- `updateChapter` (title, content)
- `createStory` / `updateStory`
- `createCharacter` / `updateCharacter`
- `saveCharacterIdentitySection` / `saveCharacterDetailsSection`
- `createWorld` / `updateWorld`
- `updateProfile` (bio, display name)
- `updateCharacterImageCaption` / `updateStoryImageCaption`
- `submitSupportTicket`

## Admin UI

Route: **`/dashboard/admin/moderation`**

Requires `profiles.role = 'admin'`. Sidebar link visible to admins only.

Actions:

- **Approve** — mark reviewed; content stays
- **Remove** — mark removed (content removal workflows expand in V2)
- **Escalate** — mark for senior review
- **Suspend account** — sets `profiles.is_suspended = true`

## Risk categories

- `csam_indicators`
- `sexualized_minors`
- `explicit_sexual_content`
- `graphic_gore`
- `extremist_content`
- `illegal_content`
- `platform_policy`

## Future (V2+)

- User reporting flow
- Comments / messages scanning
- Automatic public visibility hold on high-severity flags
- Production AI scanner integration
- Audit log for moderation decisions
