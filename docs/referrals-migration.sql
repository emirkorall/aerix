-- Referral / invite system
-- Run this in Supabase SQL editor

-- 1) Add referral columns to profiles
alter table profiles add column if not exists referral_code text unique;
alter table profiles add column if not exists referred_by uuid null references auth.users(id);
alter table profiles add column if not exists referral_redeemed_at timestamptz null;

-- 2) Referrals log table
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referee_id uuid not null references auth.users(id) on delete cascade,
  unique(referee_id)
);

-- 3) RLS
alter table referrals enable row level security;

create policy "Users can read own referrals"
  on referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referee_id);

-- No insert policy needed — server route uses service role.
