# Freightline

Marketing site, Supabase backend and admin dashboard for a logistics and transportation company.
Built with Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Motion and Supabase.

Everything a visitor sees (headlines, services, fleet, lanes, numbers, testimonials, FAQs, contact details)
is read from the database and edited in `/admin`. Nothing is hard coded in the components.

> **Status:** this code was written without network access, so `npm install` and `npm run build`
> have **not** been run on it yet. Run the checks in "First run" below before showing it to a client,
> and expect to fix a few small type or lint issues the first time.

## What is included

**Public site (`/`)**
- Hero with a line-by-line headline reveal, a live consignment tracking box and an animated India network map
  (lanes draw in, trucks travel along them, hubs pulse). The map is generated from the `locations` and `routes` tables.
- Client name marquee, services with pointer-follow spotlight cards, animated counters,
  departure-board lane list, fleet capacity bars, scroll-driven process timeline, two-row testimonial marquee, FAQ accordion.
- Quote form, contact form and newsletter sign-up, each stored in Supabase.
- WhatsApp button (only shown when a number is set), SEO metadata and JSON-LD from settings, sitemap, robots.
- Respects `prefers-reduced-motion`.

**Admin dashboard (`/admin`)**
- Supabase Auth sign-in; only users listed in `admin_users` get in (checked in middleware, layout and every server action).
- Overview: totals, quote requests per day, pipeline breakdown, latest leads and messages, pinned notes.
- Quote requests and messages: search, status filter, status workflow, per-record internal notes, delete, CSV export.
- Subscribers with CSV export.
- Shipments: create consignments, post tracking updates (the newest one sets the public status), internal notes.
- Notes: shared notebook with pinning.
- Website content: services, fleet, locations, lanes, key numbers, process steps, testimonials, FAQs, client names.
- Site settings: every heading, contact detail, footer line, SEO field and social link.

## First run

1. **Create a Supabase project** at supabase.com.
2. In the SQL editor run, in order:
   1. `supabase/migrations/0001_schema.sql` (tables, row level security, functions). Run it once.
   2. `supabase/seed.sql` (starter content so the site is not empty).
3. **Create your admin user**: Authentication, Users, Add user (email and password). Then in the SQL editor:
   ```sql
   insert into public.admin_users (user_id, email)
   select id, email from auth.users where email = 'you@yourcompany.com';
   ```
   In Authentication settings, turn **off** "Allow new users to sign up". Non-admins could not see data anyway,
   but there is no reason to leave sign-up open.
   **For a client demo only:** `supabase/demo-admin.sql` creates a ready-made admin login in one step
   (edit the password inside first). It is untested against your Supabase version, and you must delete that
   user before going live; the removal statement is at the bottom of the file.
4. Copy `.env.example` to `.env.local` and fill in the project URL and anon key (Project Settings, API).
5. Install and check:
   ```bash
   npm install
   npm run typecheck
   npm run lint
   npm run build
   npm run dev
   ```
6. Open `http://localhost:3000` and `http://localhost:3000/admin`.
   The seed includes a demo shipment: enter tracking code `FLDEMO001` in the hero box.

## Deploying

Vercel works with no configuration: import the repo, set the three environment variables from `.env.example`, deploy.
Set `NEXT_PUBLIC_SITE_URL` to the production URL. In Supabase, add the production URL under Authentication, URL configuration.

Admin edits call `revalidatePath("/")`, so the public page updates within seconds instead of waiting for the 60 second cache.

## Architecture

```
src/
  core/                  No framework code. Everything else depends on this.
    domain/              models.ts, contracts.ts (repository interfaces), errors.ts
    validation/          zod schemas; dynamic.ts builds schemas from field configs
    config/              resources.ts (admin content registry), settings.ts, icons.ts
  infrastructure/        Supabase clients and repository implementations
  services/              Business logic, one class per concern, plus the composition root
  app/                   Routes: public site, /api, /admin
  components/            ui, motion, site (public sections), admin
  lib/                   Small pure helpers (formatting, geo projection, rate limiter, http)
supabase/                Schema, RLS policies, seed data
```

How the SOLID principles show up:

- **Single responsibility.** Repositories only talk to the database; services only hold rules
  (`LeadService` validates and stores visitor input, `TrackingService` looks up a consignment, `DashboardService` builds the overview).
- **Open/closed.** The admin content screens are generated from `core/config/resources.ts`.
  To add a content type (say "certifications") add a table, one registry entry and one line in `AppContainer`.
  No new pages, forms, validation or actions.
- **Liskov.** Every repository honours the same small contracts, so the generic `SupabaseRepository`
  can be extended (`NoteRepository`, `SubscriberRepository`) without callers noticing.
- **Interface segregation.** Public form code only receives `IInsertOnlyRepository`; the dashboard only receives `IReadRepository`.
  `IRateLimiter` is a one-method interface.
- **Dependency inversion.** Services depend on interfaces in `core/domain/contracts.ts`.
  `services/container.ts` is the only file that names concrete classes.
  Swapping Supabase for another store means writing new repositories and changing that one file.

Security notes:

- Row level security is on for every table. Visitors can read only published content and can only **insert** quotes and messages
  (they can never read them back). Everything else requires `is_admin()`.
- Subscribing and tracking go through `security definer` functions that expose only what they need.
  The public tracking result never includes the customer name.
- Form endpoints are validated with zod, rate limited per IP and protected by a honeypot field.
- CSV export neutralises spreadsheet formula injection.

## Known limitations

- The rate limiter is in memory, so limits are per server instance. For several instances or regions,
  implement `IRateLimiter` with Redis or Upstash and register it in the route files.
- No email or WhatsApp notification when a quote arrives yet. A Supabase database webhook or Edge Function
  on `quote_requests` inserts is the natural place to add one.
- The map outline is a simplified polygon of India, tuned for the Indian subcontinent. A different region would need a new outline in `src/lib/geo.ts`.
- Single admin role. Everyone in `admin_users` can do everything.
- No automated tests yet. `core/validation`, `lib/geo` and the services are pure and straightforward to cover with Vitest.
