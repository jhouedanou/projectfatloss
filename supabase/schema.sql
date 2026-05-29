-- ============================================================================
-- Project Fat Loss — Schéma Supabase
-- À exécuter dans le SQL Editor du dashboard Supabase (ou via la CLI).
-- Idempotent : peut être relancé sans casser l'existant.
-- ============================================================================

-- gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles : 1 ligne par utilisateur auth, créée automatiquement à l'inscription
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Création auto du profil au signup (Google / Apple / magic link)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'user_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- exercises : catalogue partagé (owner_id null) + exercices personnels du user
-- ----------------------------------------------------------------------------
create table if not exists public.exercises (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid references auth.users (id) on delete cascade, -- null = catalogue global
  name              text not null,
  sets              text,
  equip             text,
  description       text,
  calories_per_set  integer[],
  total_sets        integer,
  nb_rep            integer,
  muscle_groups     text[],
  day_title         text,
  category          text,
  muscle_group      text,
  is_timer          boolean default false,
  default_duration  integer,
  sort_order        integer default 0,
  created_at        timestamptz not null default now()
);

create index if not exists exercises_owner_idx on public.exercises (owner_id);

alter table public.exercises enable row level security;

-- Lecture : catalogue global OU exercices du user
drop policy if exists "exercises_select" on public.exercises;
create policy "exercises_select" on public.exercises
  for select using (owner_id is null or owner_id = auth.uid());

-- Écriture : uniquement ses propres exercices
drop policy if exists "exercises_insert_own" on public.exercises;
create policy "exercises_insert_own" on public.exercises
  for insert with check (owner_id = auth.uid());

drop policy if exists "exercises_update_own" on public.exercises;
create policy "exercises_update_own" on public.exercises
  for update using (owner_id = auth.uid());

drop policy if exists "exercises_delete_own" on public.exercises;
create policy "exercises_delete_own" on public.exercises
  for delete using (owner_id = auth.uid());

-- ----------------------------------------------------------------------------
-- workouts : séances loggées par utilisateur
-- client_id = l'id local (Date.now()) pour un upsert offline-first sans doublon
-- ----------------------------------------------------------------------------
create table if not exists public.workouts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  client_id     bigint,
  title         text,
  date          timestamptz not null default now(),
  display_date  text,
  duration      integer,
  calories      numeric,
  weight_lifted numeric,
  exercises     jsonb,
  created_at    timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists workouts_user_date_idx on public.workouts (user_id, date desc);

alter table public.workouts enable row level security;

drop policy if exists "workouts_all_own" on public.workouts;
create policy "workouts_all_own" on public.workouts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- weigh_ins : pesées par utilisateur
-- ----------------------------------------------------------------------------
create table if not exists public.weigh_ins (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  client_id  bigint,
  weight     numeric not null,
  date       timestamptz not null default now(),
  notes      text,
  created_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists weigh_ins_user_date_idx on public.weigh_ins (user_id, date asc);

alter table public.weigh_ins enable row level security;

drop policy if exists "weigh_ins_all_own" on public.weigh_ins;
create policy "weigh_ins_all_own" on public.weigh_ins
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- cardio_sessions : séances de marche / vélo loggées par jour
-- type = 'walk' | 'bike' ; calories = calories dépensées
-- ----------------------------------------------------------------------------
create table if not exists public.cardio_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  client_id   bigint,
  type        text not null check (type in ('walk', 'bike')),
  date        timestamptz not null default now(),
  duration    integer,   -- minutes
  distance    numeric,   -- km
  calories    numeric,   -- calories dépensées
  notes       text,
  created_at  timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists cardio_user_date_idx on public.cardio_sessions (user_id, date desc);

alter table public.cardio_sessions enable row level security;

drop policy if exists "cardio_all_own" on public.cardio_sessions;
create policy "cardio_all_own" on public.cardio_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
