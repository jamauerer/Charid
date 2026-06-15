# CharID

Character ID generator — create and manage character profiles with photos.

Phase 1 includes user authentication, a dashboard, and character creation with image upload via Supabase.

## Prerequisites

- **Node.js 20+** and npm
- A [Supabase](https://supabase.com) account

## 1. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and click **New project**.
2. Name it **CharID**, set a database password, and pick a region.
3. Wait for provisioning to finish (~2 minutes).

### Get your API keys

Open **Project Settings → API** and copy:

- **Project URL**
- **anon public** key

### Configure email auth (recommended for local dev)

Open **Authentication → Providers → Email** and ensure Email is enabled.

For instant signup during development, disable **Confirm email** under Email settings.

## 2. Set up the database and storage

### Run the SQL migration

Open **SQL Editor** in the Supabase Dashboard and run the contents of [`supabase/schema.sql`](supabase/schema.sql).

This creates the `characters` table with row-level security policies and grants that expose it to the Supabase Data API.

### Create the storage bucket

1. Open **Storage → New bucket**
2. Name: `character-photos`
3. **Public bucket**: Off (private)
4. Create the bucket

Then run the storage policy section at the bottom of [`supabase/schema.sql`](supabase/schema.sql) (the `storage.objects` policies).

### Expand character fields (existing projects)

If you already have a `characters` table with `physical_description`, run [`supabase/migrations/20250615000000_expand_character_fields.sql`](supabase/migrations/20250615000000_expand_character_fields.sql) in the SQL Editor. This adds gender, age, location, and backstory, migrates existing descriptions to backstory, and removes the old column.

## 3. Configure environment variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Never commit `.env.local` or expose your **service role** key in the app.

## 4. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. **Sign up** at `/signup` with email and password.
2. You'll land on the **dashboard** at `/dashboard`.
3. Click **New Character** to add a name, physical description, and optional photo.
4. Saved characters appear on the dashboard with their photos.

## Project structure

```
src/
├── app/
│   ├── actions/          # Server actions (auth + characters)
│   ├── auth/callback/    # Supabase auth callback
│   ├── dashboard/        # Protected dashboard
│   ├── login/
│   └── signup/
├── components/
├── lib/supabase/         # Browser + server Supabase clients
└── types/
```

## Security

- **RLS** on `characters` ensures users only access their own data.
- **Storage policies** restrict photo access to each user's folder (`{user_id}/...`).
- Photos are served via **signed URLs** from a private bucket.

## Troubleshooting

### "Could not find the table 'public.characters' in the schema cache"

On newer Supabase projects, tables are not automatically exposed to the Data API. The table exists in the database, but the REST API cannot see it until you grant access.

In **SQL Editor**, run [`supabase/fix-characters-api.sql`](supabase/fix-characters-api.sql):

```sql
grant select on public.characters to anon;
grant select, insert, update, delete on public.characters to authenticated;
grant select, insert, update, delete on public.characters to service_role;

notify pgrst, 'reload schema';
```

Then refresh the dashboard.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start development server |
| `npm run build`| Production build         |
| `npm run start`| Start production server  |
| `npm run lint` | Run ESLint               |
