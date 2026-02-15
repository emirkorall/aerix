-- Training reminders columns on profiles
-- Run this in Supabase SQL editor

alter table profiles add column if not exists reminder_enabled boolean not null default false;
alter table profiles add column if not exists reminder_days text[] null;
alter table profiles add column if not exists reminder_time text null;
