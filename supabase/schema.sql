-- =============================================================
-- Prasad & Co — Supabase schema  (v3 — adds client_requests)
-- Paste this entire file into the Supabase SQL Editor and run it.
-- Fully idempotent — safe to re-run at any time.
-- =============================================================

-- ── 1. updates table ─────────────────────────────────────────
create table if not exists public.updates (
  id           uuid        primary key default gen_random_uuid(),
  title        text        not null,
  description  text        not null,
  date         date        not null default current_date,
  published    boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── 2. tasks table ───────────────────────────────────────────
-- Admin-only. Never directly writable by the public.
create table if not exists public.tasks (
  id           uuid        primary key default gen_random_uuid(),
  title        text        not null,
  description  text        not null default '',
  status       text        not null default 'Pending'
                 check (status in ('Pending', 'In Progress', 'Completed')),
  priority     text        not null default 'Medium'
                 check (priority in ('Low', 'Medium', 'High')),
  deadline     date,
  -- Source tracking: 'manual' (admin created) or 'client_request' (from public form)
  source       text        not null default 'manual'
                 check (source in ('manual', 'client_request')),
  -- Denormalised client info for tasks that originated from a form submission
  client_name  text,
  client_email text,
  client_phone text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── 3. client_requests table ─────────────────────────────────
-- Public visitors INSERT here (anon key, no auth required).
-- They can NEVER read, update, or delete rows — not even their own.
-- A trigger automatically creates a task row when a row is inserted here.
create table if not exists public.client_requests (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  email       text        not null,
  phone       text,
  service     text,
  message     text        not null,
  created_at  timestamptz not null default now()
);

-- ── 4. updated_at trigger function ───────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists updates_set_updated_at on public.updates;
create trigger updates_set_updated_at
  before update on public.updates
  for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ── 5. Auto-task trigger ─────────────────────────────────────
-- When a row is inserted into client_requests, this function
-- immediately creates a Pending task in the tasks table.
-- Runs as SECURITY DEFINER so it can bypass RLS on tasks
-- (the public user only inserted into client_requests).
create or replace function public.create_task_from_request()
returns trigger language plpgsql security definer as $$
declare
  task_title text;
  task_desc  text;
begin
  -- Build a readable task title from the service + name
  task_title := coalesce(
    nullif(trim(new.service), ''),
    'Client Enquiry'
  ) || ' — ' || new.name;

  -- Build description with all submitted details
  task_desc :=
    'Name: '    || new.name    || E'\n' ||
    'Email: '   || new.email   || E'\n' ||
    coalesce('Phone: ' || new.phone || E'\n', '') ||
    coalesce('Service: ' || new.service || E'\n', '') ||
    E'\nMessage:\n' || new.message;

  insert into public.tasks (
    title, description, status, priority, source,
    client_name, client_email, client_phone
  ) values (
    task_title,
    task_desc,
    'Pending',
    'Medium',
    'client_request',
    new.name,
    new.email,
    new.phone
  );

  return new;
end;
$$;

drop trigger if exists on_client_request_create_task on public.client_requests;
create trigger on_client_request_create_task
  after insert on public.client_requests
  for each row execute function public.create_task_from_request();

-- ── 6. admin_roles table ─────────────────────────────────────
create table if not exists public.admin_roles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'admin',
  created_at timestamptz not null default now()
);

-- ── 7. is_admin() helper ─────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.admin_roles
    where user_id = auth.uid()
  );
$$;

-- ── 8. Row Level Security ────────────────────────────────────
alter table public.updates         enable row level security;
alter table public.tasks           enable row level security;
alter table public.client_requests enable row level security;
alter table public.admin_roles     enable row level security;

-- Drop all existing policies (idempotent)
drop policy if exists "Public read published updates"     on public.updates;
drop policy if exists "Admin read all updates"            on public.updates;
drop policy if exists "Admin insert updates"              on public.updates;
drop policy if exists "Admin update updates"              on public.updates;
drop policy if exists "Admin delete updates"              on public.updates;
drop policy if exists "Admin read tasks"                  on public.tasks;
drop policy if exists "Admin insert tasks"                on public.tasks;
drop policy if exists "Admin update tasks"                on public.tasks;
drop policy if exists "Admin delete tasks"                on public.tasks;
drop policy if exists "Public insert client requests"     on public.client_requests;
drop policy if exists "Admin read client requests"        on public.client_requests;
drop policy if exists "Admin read own role"               on public.admin_roles;

-- updates ── public read published only
create policy "Public read published updates"
  on public.updates for select
  using (published = true);

-- updates ── admins full access
create policy "Admin read all updates"
  on public.updates for select
  using (public.is_admin());

create policy "Admin insert updates"
  on public.updates for insert
  with check (public.is_admin());

create policy "Admin update updates"
  on public.updates for update
  using  (public.is_admin())
  with check (public.is_admin());

create policy "Admin delete updates"
  on public.updates for delete
  using (public.is_admin());

-- tasks ── admin only, zero public access
create policy "Admin read tasks"
  on public.tasks for select
  using (public.is_admin());

create policy "Admin insert tasks"
  on public.tasks for insert
  with check (public.is_admin());

create policy "Admin update tasks"
  on public.tasks for update
  using  (public.is_admin())
  with check (public.is_admin());

create policy "Admin delete tasks"
  on public.tasks for delete
  using (public.is_admin());

-- client_requests ── anyone can INSERT (submit a form), nobody can SELECT
-- The trigger runs as security definer so it bypasses this restriction.
create policy "Public insert client requests"
  on public.client_requests for insert
  with check (true);

-- Admins can read submissions directly if needed
create policy "Admin read client requests"
  on public.client_requests for select
  using (public.is_admin());

-- admin_roles ── own row only
create policy "Admin read own role"
  on public.admin_roles for select
  using (user_id = auth.uid());

-- ── 9. First admin setup ─────────────────────────────────────
-- 1. Supabase dashboard → Authentication → Users → Add User
-- 2. Copy the new user's UUID
-- 3. Run: insert into public.admin_roles (user_id) values ('<uuid>');
