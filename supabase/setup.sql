create table if not exists public.visits (
    id uuid primary key default gen_random_uuid(),
    visited_at timestamptz not null default now(),
    device text not null check (char_length(device) between 1 and 100),
    model text not null default 'Not available' check (char_length(model) between 1 and 80),
    ip_address text not null default 'Unavailable' check (char_length(ip_address) between 1 and 64)
);

alter table public.visits
    add column if not exists ip_address text not null default 'Unavailable'
    check (char_length(ip_address) between 1 and 64);
alter table public.visits
    add column if not exists model text not null default 'Not available'
    check (char_length(model) between 1 and 80);

alter table public.visits enable row level security;
revoke all on public.visits from public, anon, authenticated;
grant select on public.visits to authenticated;
grant insert on public.visits to service_role;

drop policy if exists "Visitors can submit minimal visit details" on public.visits;

drop policy if exists "Only signed-in admins can read visits" on public.visits;
create policy "Only signed-in admins can read visits"
    on public.visits
    for select
    to authenticated
    using (
        lower((select auth.jwt() ->> 'email')) = lower('abhisheksmart811@gmail.com')
    );

create table if not exists public.gallery_password_attempts (
    id uuid primary key default gen_random_uuid(),
    attempted_at timestamptz not null default now(),
    device text not null check (char_length(device) between 1 and 120),
    model text not null default 'Not available' check (char_length(model) between 1 and 80),
    ip_address text not null default 'Unavailable' check (char_length(ip_address) between 1 and 64)
);

alter table public.gallery_password_attempts
    add column if not exists model text not null default 'Not available'
    check (char_length(model) between 1 and 80);

alter table public.gallery_password_attempts enable row level security;
revoke all on public.gallery_password_attempts from public, anon, authenticated;
grant select on public.gallery_password_attempts to authenticated;
grant all on public.gallery_password_attempts to service_role;

drop policy if exists "Only signed-in admins can read gallery password attempts" on public.gallery_password_attempts;
create policy "Only signed-in admins can read gallery password attempts"
    on public.gallery_password_attempts
    for select
    to authenticated
    using (
        lower((select auth.jwt() ->> 'email')) = lower('abhisheksmart811@gmail.com')
    );

create table if not exists public.gallery_activity (
    id uuid primary key default gen_random_uuid(),
    recorded_at timestamptz not null default now(),
    activity text not null check (activity in ('gallery_entry', 'yes', 'no')),
    device text not null check (char_length(device) between 1 and 100),
    model text not null default 'Not available' check (char_length(model) between 1 and 80),
    ip_address text not null default 'Unavailable' check (char_length(ip_address) between 1 and 64)
);

alter table public.gallery_activity enable row level security;
revoke all on public.gallery_activity from public, anon, authenticated;
grant select on public.gallery_activity to authenticated;
grant insert on public.gallery_activity to service_role;

drop policy if exists "Only signed-in admins can read gallery activity" on public.gallery_activity;
create policy "Only signed-in admins can read gallery activity"
    on public.gallery_activity
    for select
    to authenticated
    using (
        lower((select auth.jwt() ->> 'email')) = lower('abhisheksmart811@gmail.com')
    );

notify pgrst, 'reload schema';
