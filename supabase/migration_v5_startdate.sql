-- =============================================================
-- Prasad & Co — Migration v5: Add start_date to tasks
-- Run in Supabase SQL Editor. Safe to re-run (idempotent).
-- =============================================================

alter table public.tasks
  add column if not exists start_date date;
