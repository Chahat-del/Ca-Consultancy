-- =============================================================
-- Prasad & Co — Migration v3
-- Run this in Supabase SQL Editor if you already ran schema v1 or v2.
-- This safely adds the new columns and objects without dropping anything.
-- Safe to run multiple times (idempotent).
-- =============================================================

-- ── 1. Add new columns to tasks (if they don't exist) ────────
-- These columns were added in v3 to support client_request source tracking.

alter table public.tasks
  add column if not exists source       text not null default 'manual'
                                           check (source in ('manual', 'client_request')),
  add column if not exists client_name  text,
  add column if not exists client_email text,
  add column if not exists client_phone text;

-- ── 2. Create client_requests table (if it doesn't exist) ────
create table if not exists public.client_requests (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  email      text        not null,
  phone      text,
  service    text,
  message    text        not null,
  created_at timestamptz not null default now()
);

-- ── 3. Enable RLS on client_requests ─────────────────────────
alter table public.client_requests enable row level security;

-- ── 4. RLS policies for client_requests ──────────────────────
drop policy if exists "Public insert client requests"  on public.client_requests;
drop policy if exists "Admin read client requests"     on public.client_requests;

-- Anyone (anon) can INSERT — this is the public form submission
create policy "Public insert client requests"
  on public.client_requests for insert
  with check (true);

-- Only admins can SELECT submissions
create policy "Admin read client requests"
  on public.client_requests for select
  using (public.is_admin());

-- ── 5. Auto-task trigger function ────────────────────────────
-- Recreate with SECURITY DEFINER so it can write to tasks
-- even though the anon user cannot directly insert into tasks.
create or replace function public.create_task_from_request()
returns trigger language plpgsql security definer as $$
declare
  v_title text;
  v_desc  text;
begin
  -- Title: "Service — Name" or "Client Enquiry — Name"
  v_title := coalesce(nullif(trim(new.service), ''), 'Client Enquiry')
             || ' — ' || new.name;

  -- Description: structured block with all submitted fields
  v_desc :=
    'Name: '  || new.name  || chr(10) ||
    'Email: ' || new.email || chr(10) ||
    case when new.phone   is not null and trim(new.phone)   <> ''
         then 'Phone: '   || new.phone   || chr(10) else '' end ||
    case when new.service is not null and trim(new.service) <> ''
         then 'Service: ' || new.service || chr(10) else '' end ||
    chr(10) || 'Message:' || chr(10) || new.message;

  insert into public.tasks (
    title, description, status, priority,
    source, client_name, client_email, client_phone
  ) values (
    v_title, v_desc,
    'Pending', 'Medium',
    'client_request', new.name, new.email, new.phone
  );

  return new;
end;
$$;

-- ── 6. Attach trigger to client_requests ─────────────────────
drop trigger if exists on_client_request_create_task on public.client_requests;
create trigger on_client_request_create_task
  after insert on public.client_requests
  for each row execute function public.create_task_from_request();

-- ── 7. Verify ────────────────────────────────────────────────
-- After running, test with:
--
--   insert into public.client_requests (name, email, message)
--   values ('Test User', 'test@example.com', 'Test message');
--
-- Then check: select * from public.tasks order by created_at desc limit 1;
-- You should see a new Pending task with source = 'client_request'.
