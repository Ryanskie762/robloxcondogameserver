-- Roles
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Admins can view roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Games
create table public.community_games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  link text not null default '',
  players int not null default 0,
  online boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.community_games enable row level security;

create policy "Anyone can view games"
  on public.community_games for select
  to anon, authenticated
  using (true);

create policy "Admins can insert games"
  on public.community_games for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update games"
  on public.community_games for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete games"
  on public.community_games for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_games_updated
before update on public.community_games
for each row execute function public.touch_updated_at();

-- Seed
insert into public.community_games (name, link, players, online, sort_order) values
  ('Sword Arena 7738', 'https://example.com/sword-arena', 209, true, 1),
  ('Anni''s Place', 'https://example.com/annis-place', 230, true, 2),
  ('Slap Royale', 'https://example.com/slap-royale', 191, true, 3),
  ('V4 Duo Mode', 'https://example.com/v4-duo', 217, true, 4),
  ('Sentinel Console', 'https://example.com/sentinel', 206, true, 5),
  ('RO-63 Classic', '', 0, false, 6),
  ('Meet Neko [Solo]', '', 0, false, 7),
  ('Cabin Photography [2P]', '', 0, false, 8);
