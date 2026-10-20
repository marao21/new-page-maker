-- Lovable RP: banco de dados para autenticação, área de membros e dados por usuário.
-- Execute no Supabase SQL Editor depois de reativar o projeto.
create extension if not exists pgcrypto;

create table if not exists public.lovable_rp_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'member' check (role in ('admin', 'member')),
  access_status text not null default 'pending' check (access_status in ('pending', 'approved', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lovable_rp_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  repository_full_name text,
  branch text not null default 'main',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lovable_rp_commands (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.lovable_rp_projects(id) on delete set null,
  prompt text not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  result_summary text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Preferências persistentes da conta. Tokens e chaves secretas NÃO são guardados nesta tabela.
create table if not exists public.lovable_rp_settings (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  default_provider text not null default 'gemini' check (default_provider in ('gemini', 'openai', 'openrouter')),
  default_model text,
  selected_repository text,
  selected_branch text not null default 'main',
  updated_at timestamptz not null default now()
);

create table if not exists public.lovable_rp_connections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('github', 'gemini', 'openai', 'openrouter', 'supabase')),
  connected boolean not null default false,
  account_label text,
  last_verified_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (owner_id, provider)
);

create table if not exists public.lovable_rp_activity (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  title text not null,
  detail text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.lovable_rp_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.lovable_rp_profiles
    where id = auth.uid() and role = 'admin' and access_status = 'approved'
  );
$$;

create or replace function public.lovable_rp_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists lovable_rp_profiles_touch on public.lovable_rp_profiles;
create trigger lovable_rp_profiles_touch before update on public.lovable_rp_profiles
for each row execute function public.lovable_rp_touch_updated_at();

drop trigger if exists lovable_rp_settings_touch on public.lovable_rp_settings;
create trigger lovable_rp_settings_touch before update on public.lovable_rp_settings
for each row execute function public.lovable_rp_touch_updated_at();

drop trigger if exists lovable_rp_connections_touch on public.lovable_rp_connections;
create trigger lovable_rp_connections_touch before update on public.lovable_rp_connections
for each row execute function public.lovable_rp_touch_updated_at();

create or replace function public.lovable_rp_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.lovable_rp_profiles (id, email, full_name, role, access_status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    'member',
    'pending'
  )
  on conflict (id) do update set email = excluded.email;
  insert into public.lovable_rp_settings (owner_id) values (new.id) on conflict (owner_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_lovable_rp on auth.users;
create trigger on_auth_user_created_lovable_rp
after insert on auth.users
for each row execute function public.lovable_rp_handle_new_user();

alter table public.lovable_rp_profiles enable row level security;
alter table public.lovable_rp_projects enable row level security;
alter table public.lovable_rp_commands enable row level security;
alter table public.lovable_rp_settings enable row level security;
alter table public.lovable_rp_connections enable row level security;
alter table public.lovable_rp_activity enable row level security;

drop policy if exists "profiles read own or admin" on public.lovable_rp_profiles;
create policy "profiles read own or admin" on public.lovable_rp_profiles for select to authenticated
using (id = auth.uid() or public.lovable_rp_is_admin());

drop policy if exists "profiles update own basic data or admin" on public.lovable_rp_profiles;
create policy "profiles update own basic data or admin" on public.lovable_rp_profiles for update to authenticated
using (id = auth.uid() or public.lovable_rp_is_admin())
with check (
  public.lovable_rp_is_admin()
  or (id = auth.uid() and role = 'member' and access_status = 'pending')
);

drop policy if exists "projects own or admin" on public.lovable_rp_projects;
create policy "projects own or admin" on public.lovable_rp_projects for all to authenticated
using (owner_id = auth.uid() or public.lovable_rp_is_admin())
with check (owner_id = auth.uid() or public.lovable_rp_is_admin());

drop policy if exists "commands own or admin" on public.lovable_rp_commands;
create policy "commands own or admin" on public.lovable_rp_commands for all to authenticated
using (owner_id = auth.uid() or public.lovable_rp_is_admin())
with check (owner_id = auth.uid() or public.lovable_rp_is_admin());

drop policy if exists "settings own or admin" on public.lovable_rp_settings;
create policy "settings own or admin" on public.lovable_rp_settings for all to authenticated
using (owner_id = auth.uid() or public.lovable_rp_is_admin())
with check (owner_id = auth.uid() or public.lovable_rp_is_admin());

drop policy if exists "connections own or admin" on public.lovable_rp_connections;
create policy "connections own or admin" on public.lovable_rp_connections for all to authenticated
using (owner_id = auth.uid() or public.lovable_rp_is_admin())
with check (owner_id = auth.uid() or public.lovable_rp_is_admin());

drop policy if exists "activity own or admin" on public.lovable_rp_activity;
create policy "activity own or admin" on public.lovable_rp_activity for all to authenticated
using (owner_id = auth.uid() or public.lovable_rp_is_admin())
with check (owner_id = auth.uid() or public.lovable_rp_is_admin());

grant usage on schema public to authenticated;
grant select, update on public.lovable_rp_profiles to authenticated;
grant select, insert, update, delete on public.lovable_rp_projects to authenticated;
grant select, insert, update, delete on public.lovable_rp_commands to authenticated;
grant select, insert, update, delete on public.lovable_rp_settings to authenticated;
grant select, insert, update, delete on public.lovable_rp_connections to authenticated;
grant select, insert, update, delete on public.lovable_rp_activity to authenticated;

-- Após criar sua conta, promova apenas o seu usuário administrador pelo SQL Editor:
-- update public.lovable_rp_profiles set role = 'admin', access_status = 'approved'
-- where email = 'SEU_EMAIL_DE_ADMIN';
