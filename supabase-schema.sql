-- Run this in Supabase → SQL Editor

create table if not exists riders (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  mobile text not null,
  zone text not null,
  vehicle_type text not null check (vehicle_type in ('bike','scooter','cycle','ev')),
  language text not null default 'en',
  status text not null default 'active' check (status in ('active','inactive','pending')),
  created_at timestamptz default now()
);

create table if not exists platforms (
  id uuid default gen_random_uuid() primary key,
  company_name text not null,
  email text not null unique,
  mobile text not null,
  contact_name text not null,
  expected_volume text not null,
  zones text[] not null default '{}',
  status text not null default 'active' check (status in ('active','pending','inactive')),
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  platform_id uuid references platforms(id) on delete set null,
  platform_name text not null,
  zone text not null,
  riders_requested integer not null,
  riders_confirmed integer not null default 0,
  tier text not null,
  ppd numeric not null,
  total_cost numeric not null,
  status text not null default 'fulfilling' check (status in ('fulfilling','fulfilled','at_risk')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table riders enable row level security;
alter table platforms enable row level security;
alter table orders enable row level security;

-- Public read/write for demo (tighten before prod)
create policy "public_all" on riders for all using (true) with check (true);
create policy "public_all" on platforms for all using (true) with check (true);
create policy "public_all" on orders for all using (true) with check (true);
