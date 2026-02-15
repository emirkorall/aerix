-- 7-day Starter trial columns on profiles
-- Run this in Supabase SQL editor

alter table profiles add column if not exists trial_started_at timestamptz;
alter table profiles add column if not exists trial_ends_at timestamptz;
alter table profiles add column if not exists trial_used boolean not null default false;
