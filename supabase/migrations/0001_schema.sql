-- =====================================================================
-- Freightline: schema, row level security and helper functions
-- Run in Supabase: SQL Editor -> paste -> Run (or `supabase db push`).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Admin access
-- ---------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Site settings (key -> JSON object, edited from the admin dashboard)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create or replace trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Public content tables
-- ---------------------------------------------------------------------
create table if not exists public.services (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  summary      text not null,
  icon         text not null default 'Truck',
  features     text[] not null default '{}',
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.fleet_vehicles (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  category      text not null,
  capacity_tons numeric(8,2) not null check (capacity_tons >= 0),
  description   text not null default '',
  features      text[] not null default '{}',
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.locations (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  state        text not null default '',
  latitude     numeric(9,6) not null check (latitude between -90 and 90),
  longitude    numeric(9,6) not null check (longitude between -180 and 180),
  is_hub       boolean not null default false,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.routes (
  id               uuid primary key default gen_random_uuid(),
  from_location_id uuid not null references public.locations (id) on delete cascade,
  to_location_id   uuid not null references public.locations (id) on delete cascade,
  transit_hours    integer not null default 12 check (transit_hours > 0),
  label            text not null default 'Daily departure',
  sort_order       integer not null default 0,
  is_published     boolean not null default true,
  created_at       timestamptz not null default now(),
  check (from_location_id <> to_location_id)
);

create table if not exists public.stats (
  id           uuid primary key default gen_random_uuid(),
  label        text not null,
  value        numeric(14,2) not null,
  prefix       text not null default '',
  suffix       text not null default '',
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.process_steps (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text not null,
  icon         text not null default 'Package',
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.testimonials (
  id           uuid primary key default gen_random_uuid(),
  author_name  text not null,
  author_role  text not null default '',
  company      text not null default '',
  quote        text not null,
  rating       integer not null default 5 check (rating between 1 and 5),
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.faqs (
  id           uuid primary key default gen_random_uuid(),
  question     text not null,
  answer       text not null,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.clients (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Collected data (written by visitors, read by admins only)
-- ---------------------------------------------------------------------
create table if not exists public.quote_requests (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null check (char_length(full_name) between 2 and 120),
  email         text not null check (char_length(email) between 5 and 200),
  phone         text not null check (char_length(phone) between 6 and 30),
  company       text,
  service_label text,
  origin        text not null check (char_length(origin) between 2 and 120),
  destination   text not null check (char_length(destination) between 2 and 120),
  cargo_type    text,
  weight_kg     numeric(12,2) check (weight_kg is null or weight_kg > 0),
  pickup_date   date,
  message       text check (message is null or char_length(message) <= 2000),
  status        text not null default 'new'
                check (status in ('new','contacted','quoted','won','lost')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists quote_requests_created_idx on public.quote_requests (created_at desc);
create index if not exists quote_requests_status_idx on public.quote_requests (status);
create or replace trigger quote_requests_updated_at before update on public.quote_requests
  for each row execute function public.set_updated_at();

create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null check (char_length(full_name) between 2 and 120),
  email      text not null check (char_length(email) between 5 and 200),
  phone      text check (phone is null or char_length(phone) <= 30),
  subject    text check (subject is null or char_length(subject) <= 160),
  message    text not null check (char_length(message) between 5 and 4000),
  status     text not null default 'new'
             check (status in ('new','read','replied','archived')),
  created_at timestamptz not null default now()
);
create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);

create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique check (char_length(email) between 5 and 200),
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Shipment tracking
-- ---------------------------------------------------------------------
create table if not exists public.shipments (
  id            uuid primary key default gen_random_uuid(),
  tracking_code text not null unique
                default ('FL' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  origin        text not null,
  destination   text not null,
  customer_name text,
  status        text not null default 'booked'
                check (status in ('booked','picked_up','in_transit','out_for_delivery','delivered','delayed')),
  eta           timestamptz,
  created_at    timestamptz not null default now()
);

create table if not exists public.shipment_events (
  id          uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  status      text not null
              check (status in ('booked','picked_up','in_transit','out_for_delivery','delivered','delayed')),
  location    text not null,
  description text,
  occurred_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);
create index if not exists shipment_events_shipment_idx on public.shipment_events (shipment_id, occurred_at desc);

-- Keep the shipment's headline status in sync with its newest event.
create or replace function public.sync_shipment_status()
returns trigger
language plpgsql
as $$
begin
  update public.shipments set status = new.status where id = new.shipment_id;
  return new;
end;
$$;
create or replace trigger shipment_events_sync after insert on public.shipment_events
  for each row execute function public.sync_shipment_status();

-- ---------------------------------------------------------------------
-- Admin notes (general notebook + notes attached to leads/messages/shipments)
-- ---------------------------------------------------------------------
create table if not exists public.admin_notes (
  id           uuid primary key default gen_random_uuid(),
  entity_type  text not null default 'general'
               check (entity_type in ('general','quote','message','shipment')),
  entity_id    uuid,
  title        text not null default '',
  body         text not null check (char_length(body) between 1 and 8000),
  pinned       boolean not null default false,
  author_email text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists admin_notes_entity_idx on public.admin_notes (entity_type, entity_id);
create or replace trigger admin_notes_updated_at before update on public.admin_notes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Public RPCs
-- ---------------------------------------------------------------------
create or replace function public.track_shipment(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'tracking_code', s.tracking_code,
    'origin', s.origin,
    'destination', s.destination,
    'status', s.status,
    'eta', s.eta,
    'events', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'status', e.status,
          'location', e.location,
          'description', e.description,
          'occurred_at', e.occurred_at
        ) order by e.occurred_at desc)
      from public.shipment_events e where e.shipment_id = s.id
    ), '[]'::jsonb)
  )
  from public.shipments s
  where s.tracking_code = upper(trim(p_code))
  limit 1;
$$;

create or replace function public.subscribe_email(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_email is null or p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(p_email) > 200 then
    raise exception 'invalid email';
  end if;
  insert into public.subscribers (email) values (lower(trim(p_email)))
  on conflict (email) do update set is_active = true;
end;
$$;

grant execute on function public.track_shipment(text) to anon, authenticated;
grant execute on function public.subscribe_email(text) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------
alter table public.admin_users      enable row level security;
alter table public.site_settings    enable row level security;
alter table public.services         enable row level security;
alter table public.fleet_vehicles   enable row level security;
alter table public.locations        enable row level security;
alter table public.routes           enable row level security;
alter table public.stats            enable row level security;
alter table public.process_steps    enable row level security;
alter table public.testimonials     enable row level security;
alter table public.faqs             enable row level security;
alter table public.clients          enable row level security;
alter table public.quote_requests   enable row level security;
alter table public.contact_messages enable row level security;
alter table public.subscribers      enable row level security;
alter table public.shipments        enable row level security;
alter table public.shipment_events  enable row level security;
alter table public.admin_notes      enable row level security;

-- Published content: anyone can read published rows, admins manage everything.
do $$
declare t text;
begin
  foreach t in array array['services','fleet_vehicles','locations','routes','stats',
                           'process_steps','testimonials','faqs','clients']
  loop
    execute format('create policy "%1$s public read" on public.%1$I for select using (is_published)', t);
    execute format('create policy "%1$s admin all" on public.%1$I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

create policy "settings public read" on public.site_settings for select using (true);
create policy "settings admin all" on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- Visitors may only insert (never read) their own submissions.
create policy "quotes public insert" on public.quote_requests for insert
  to anon, authenticated with check (status = 'new');
create policy "quotes admin all" on public.quote_requests for all
  using (public.is_admin()) with check (public.is_admin());

create policy "messages public insert" on public.contact_messages for insert
  to anon, authenticated with check (status = 'new');
create policy "messages admin all" on public.contact_messages for all
  using (public.is_admin()) with check (public.is_admin());

create policy "subscribers admin all" on public.subscribers for all
  using (public.is_admin()) with check (public.is_admin());

create policy "shipments admin all" on public.shipments for all
  using (public.is_admin()) with check (public.is_admin());
create policy "shipment events admin all" on public.shipment_events for all
  using (public.is_admin()) with check (public.is_admin());

create policy "notes admin all" on public.admin_notes for all
  using (public.is_admin()) with check (public.is_admin());

create policy "admin users self read" on public.admin_users for select
  using (user_id = auth.uid() or public.is_admin());
