-- =============================================================
-- Prasad & Co — Migration v4: PDF attachments for updates
-- Run in Supabase SQL Editor. Safe to re-run (idempotent).
-- =============================================================

-- ── 1. Add pdf_url column to updates ─────────────────────────
alter table public.updates
  add column if not exists pdf_url text;   -- null = no PDF attached

-- ── 2. Create Storage bucket for PDFs ────────────────────────
-- Do this in the Supabase dashboard if the SQL approach isn't available:
--   Storage → New bucket → Name: "update-pdfs" → Public bucket: ON
--
-- Or run via the storage API. The SQL below works if pg_net is enabled:
-- (Most Supabase projects support this natively)

insert into storage.buckets (id, name, public)
values ('update-pdfs', 'update-pdfs', true)
on conflict (id) do nothing;

-- ── 3. Storage RLS policies ───────────────────────────────────
-- Anyone can read/download PDFs (public bucket, for the public website)
drop policy if exists "Public read update PDFs"  on storage.objects;
drop policy if exists "Admin upload update PDFs" on storage.objects;
drop policy if exists "Admin delete update PDFs" on storage.objects;

create policy "Public read update PDFs"
  on storage.objects for select
  using (bucket_id = 'update-pdfs');

-- Only admins can upload
create policy "Admin upload update PDFs"
  on storage.objects for insert
  with check (
    bucket_id = 'update-pdfs'
    and public.is_admin()
  );

-- Only admins can delete
create policy "Admin delete update PDFs"
  on storage.objects for delete
  using (
    bucket_id = 'update-pdfs'
    and public.is_admin()
  );

-- ── 4. Verify ────────────────────────────────────────────────
-- select column_name from information_schema.columns
-- where table_name = 'updates' and column_name = 'pdf_url';
-- Should return one row.

-- ── Allow admins to delete enquiries ─────────────────────────
-- Run this if you want the admin to be able to delete client_requests rows.
drop policy if exists "Admin delete client requests" on public.client_requests;
create policy "Admin delete client requests"
  on public.client_requests for delete
  using (public.is_admin());
