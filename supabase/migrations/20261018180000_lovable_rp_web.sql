-- Lovable RP Web: schema inicial de usuários, projetos, comandos e atividade.
-- O acesso ao painel é aberto apenas para a prévia visual; as tabelas abaixo exigem
-- autenticação e aprovação antes de permitir leitura ou gravação.

create extension if not exists pgcrypto;

create table if not exists public.lovable_rp_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
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
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lovable_rp_commands (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.lovable_rp_projects(id) on delete set null,
  prompt text not null check (char_length(prompt) between 1 and 12000),
  status text not null default 'draft' check (status in ('draft', 'queued', 'running', 'completed', 'failed')),
  result text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lovable_rp_activity (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.lovable_rp_projects(id) on delete set null,
  command_id uuid references public.lovable_rp_commands(id) on delete set null,
  event_type text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.lovable_rp_connections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('github', 'supabase', 'chatgpt', 'lovable')),
  display_name text not null,
  status text not null default 'disconnected' check (status in ('connected', 'disconnected', 'needs_attention')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, provider)
);

create index if not exists lovable_rp_projects_owner_created_idx
  on public.lovable_rp_projects (owner_id, created_at desc);
create index if not exists lovable_rp_commands_owner_created_idx
  on public.lovable_rp_commands (owner_id, created_at desc);
create index if not exists lovable_rp_activity_owner_created_idx
  on public.lovable_rp_activity (owner_id, created_at desc);
create index if not exists lovable_rp_connections_owner_idx
  on public.lovable_rp_connections (owner_id);

create or replace function public.lovable_rp_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.lovable_rp_profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.access_status = 'approved'
  );
$$;

create or replace function public.lovable_rp_is_approved()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.lovable_rp_is_admin() or exists (
    select 1 from public.lovable_rp_profiles p
    where p.id = auth.uid()
      and p.access_status = 'approved'
  );
$$;

create or replace function public.lovable_rp_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.lovable_rp_create_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.lovable_rp_profiles (id, email, full_name, access_status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'pending'
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists lovable_rp_auth_user_created on auth.users;
create trigger lovable_rp_auth_user_created
after insert on auth.users
for each row execute function public.lovable_rp_create_profile();

drop trigger if exists lovable_rp_profiles_touch on public.lovable_rp_profiles;
create trigger lovable_rp_profiles_touch before update on public.lovable_rp_profiles
for each row execute function public.lovable_rp_touch_updated_at();
drop trigger if exists lovable_rp_projects_touch on public.lovable_rp_projects;
create trigger lovable_rp_projects_touch before update on public.lovable_rp_projects
for each row execute function public.lovable_rp_touch_updated_at();
drop trigger if exists lovable_rp_commands_touch on public.lovable_rp_commands;
create trigger lovable_rp_commands_touch before update on public.lovable_rp_commands
for each row execute function public.lovable_rp_touch_updated_at();
drop trigger if exists lovable_rp_connections_touch on public.lovable_rp_connections;
create trigger lovable_rp_connections_touch before update on public.lovable_rp_connections
for each row execute function public.lovable_rp_touch_updated_at();

alter table public.lovable_rp_profiles enable row level security;
alter table public.lovable_rp_projects enable row level security;
alter table public.lovable_rp_commands enable row level security;
alter table public.lovable_rp_activity enable row level security;
alter table public.lovable_rp_connections enable row level security;

drop policy if exists "Lovable RP users read own profile" on public.lovable_rp_profiles;
create policy "Lovable RP users read own profile"
on public.lovable_rp_profiles for select to authenticated
using (id = auth.uid() or public.lovable_rp_is_admin());

drop policy if exists "Lovable RP admins manage profiles" on public.lovable_rp_profiles;
create policy "Lovable RP admins manage profiles"
on public.lovable_rp_profiles for all to authenticated
using (public.lovable_rp_is_admin())
with check (public.lovable_rp_is_admin());

drop policy if exists "Lovable RP approved users manage own projects" on public.lovable_rp_projects;
create policy "Lovable RP approved users manage own projects"
on public.lovable_rp_projects for all to authenticated
using ((owner_id = auth.uid() and public.lovable_rp_is_approved()) or public.lovable_rp_is_admin())
with check ((owner_id = auth.uid() and public.lovable_rp_is_approved()) or public.lovable_rp_is_admin());

drop policy if exists "Lovable RP approved users manage own commands" on public.lovable_rp_commands;
create policy "Lovable RP approved users manage own commands"
on public.lovable_rp_commands for all to authenticated
using ((owner_id = auth.uid() and public.lovable_rp_is_approved()) or public.lovable_rp_is_admin())
with check ((owner_id = auth.uid() and public.lovable_rp_is_approved()) or public.lovable_rp_is_admin());

drop policy if exists "Lovable RP approved users manage own activity" on public.lovable_rp_activity;
create policy "Lovable RP approved users manage own activity"
on public.lovable_rp_activity for all to authenticated
using ((owner_id = auth.uid() and public.lovable_rp_is_approved()) or public.lovable_rp_is_admin())
with check ((owner_id = auth.uid() and public.lovable_rp_is_approved()) or public.lovable_rp_is_admin());

drop policy if exists "Lovable RP approved users manage own connections" on public.lovable_rp_connections;
create policy "Lovable RP approved users manage own connections"
on public.lovable_rp_connections for all to authenticated
using ((owner_id = auth.uid() and public.lovable_rp_is_approved()) or public.lovable_rp_is_admin())
with check ((owner_id = auth.uid() and public.lovable_rp_is_approved()) or public.lovable_rp_is_admin());

grant select on public.lovable_rp_profiles to authenticated;
grant select, insert, update, delete on public.lovable_rp_projects to authenticated;
grant select, insert, update, delete on public.lovable_rp_commands to authenticated;
grant select, insert, update, delete on public.lovable_rp_activity to authenticated;
grant select, insert, update, delete on public.lovable_rp_connections to authenticated;

-- Bootstrap do administrador principal será feito de forma controlada após criar a conta,
-- alterando role='admin' e access_status='approved' apenas para o ID autorizado.
