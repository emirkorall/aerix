-- Onboarding columns on profiles
-- Run this in Supabase SQL editor

alter table profiles add column if not exists onboarding_completed boolean not null default false;
alter table profiles add column if not exists focus_goal text;
alter table profiles add column if not exists focus_playlist text;
alter table profiles add column if not exists rank_tier text;
alter table profiles add column if not exists rank_division text;
