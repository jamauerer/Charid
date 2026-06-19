# Founder Dashboard V1

**Route:** `/dashboard/admin`  
**Auth:** `profiles.role = 'admin'` — non-admins receive **403** via `forbidden()`  
**Status:** Shipped (Phase 1 + 2 UI; Phase 3 placeholders)

## Setup

1. Run migrations (in order):
   - `20250625000000_platform_hardening.sql`
   - `20250629000000_founder_admin_role.sql`
   - `fix-platform-hardening-api.sql`
   - `fix-founder-admin-api.sql`

2. Set environment variable:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. Promote founder account in Supabase SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where username = 'yourusername';
   ```

## Sections

| # | Section | Status |
|---|---------|--------|
| 1 | Platform overview | Live |
| 2 | Creator activity | Live (sampled bible scores) |
| 3 | Support | Live |
| 4 | Creator feedback | Live |
| 5 | Content metrics | Live |
| 6 | Continuity metrics | Live (sampled) |
| 7 | Platform health | Partial (assets + tickets; costs Phase 3) |

## Navigation

**Admin Dashboard** sidebar link visible only when `profiles.role = 'admin'`.

See also: [FOUNDER_ANALYTICS.md](./FOUNDER_ANALYTICS.md)
