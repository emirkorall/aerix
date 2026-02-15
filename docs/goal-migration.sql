-- Weekly goal column on profiles
-- Run this in Supabase SQL editor

alter table profiles add column if not exists weekly_goal_days int not null default 3;
