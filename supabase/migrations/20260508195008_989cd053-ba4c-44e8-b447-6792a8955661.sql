
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default 'Sparkles',
  created_at timestamptz not null default now()
);
alter table public.habits enable row level security;
create policy "habits_all_own" on public.habits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index on public.habits(user_id);

create table public.habit_checkins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);
alter table public.habit_checkins enable row level security;
create policy "checkins_all_own" on public.habit_checkins for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index on public.habit_checkins(user_id, date);

create table public.water_intake (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  amount_ml integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);
alter table public.water_intake enable row level security;
create policy "water_all_own" on public.water_intake for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.wellness_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  sleep integer not null default 7,
  productivity integer not null default 5,
  mood integer not null default 5,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);
alter table public.wellness_logs enable row level security;
create policy "wellness_all_own" on public.wellness_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql
security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end;$$;

create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_water_updated before update on public.water_intake for each row execute function public.set_updated_at();
create trigger trg_wellness_updated before update on public.wellness_logs for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end;$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
