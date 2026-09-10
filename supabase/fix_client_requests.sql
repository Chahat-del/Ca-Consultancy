-- =============================================================
-- FULL FIX: client_requests table + trigger + RLS
-- Run this in Supabase SQL Editor to fix the contact form.
-- Safe to re-run multiple times.
-- =============================================================

-- 1. Add missing columns to tasks table (if migration v3/v5 were not run)
alter table public.tasks
  add column if not exists source       text not null default 'manual'
                                          check (source in ('manual', 'client_request')),
  add column if not exists client_name  text,
  add column if not exists client_email text,
  add column if not exists client_phone text,
  add column if not exists start_date   date;

-- 2. Create client_requests table
create table if not exists public.client_requests (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  email      text        not null,
  phone      text,
  service    text,
  message    text        not null,
  created_at timestamptz not null default now()
);

-- 3. Enable RLS on client_requests
alter table public.client_requests enable row level security;

-- 4. RLS policies — drop first so this is idempotent
drop policy if exists "Public insert client requests"  on public.client_requests;
drop policy if exists "Admin read client requests"     on public.client_requests;
drop policy if exists "Admin delete client requests"   on public.client_requests;

-- Anyone (unauthenticated/anon) can INSERT — this is the public contact form
create policy "Public insert client requests"
  on public.client_requests for insert
  with check (true);

-- Only admins can read submissions
create policy "Admin read client requests"
  on public.client_requests for select
  using (public.is_admin());

-- Only admins can delete submissions
create policy "Admin delete client requests"
  on public.client_requests for delete
  using (public.is_admin());

-- 5. Recreate the trigger function (security definer so it can write to tasks)
create or replace function public.create_task_from_request()
returns trigger language plpgsql security definer as $$
declare
  v_title text;
  v_desc  text;
begin
  v_title := coalesce(nullif(trim(new.service), ''), 'Client Enquiry')
             || ' — ' || new.name;

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

-- 6. Attach trigger to client_requests
drop trigger if exists on_client_request_create_task on public.client_requests;
create trigger on_client_request_create_task
  after insert on public.client_requests
  for each row execute function public.create_task_from_request();

-- 7. Quick test — run this separately AFTER the above to verify it works:
-- insert into public.client_requests (name, email, message)
-- values ('Test', 'test@test.com', 'Test message');
-- select * from public.client_requests order by created_at desc limit 1;
-- select * from public.tasks where source = 'client_request' order by created_at desc limit 1;
