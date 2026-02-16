-- Public profile support
-- Run this in Supabase SQL editor

-- 1) Add public profile columns
alter table profiles add column if not exists username text unique;
alter table profiles add column if not exists public_profile_enabled boolean not null default false;
alter table profiles add column if not exists current_streak int not null default 0;
alter table profiles add column if not exists packs_completed_count int not null default 0;
alter table profiles add column if not exists consistency_score int not null default 0;

-- 2) Fast lookup by username (unique constraint already creates an index,
--    but add a partial index for the view query)
create index if not exists idx_profiles_public_username
  on profiles (username)
  where public_profile_enabled = true and username is not null;

-- 3) RLS policy — users can update their own profile columns
--    (skip if a broad "users update own profile" policy already exists)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles'
      and policyname = 'Users can update own profile'
  ) then
    execute $policy$
      create policy "Users can update own profile"
        on profiles for update
        using (auth.uid() = id)
        with check (auth.uid() = id)
    $policy$;
  end if;
end$$;

-- 4) Create a safe public view (no email, user_id, stripe fields, etc.)
create or replace view public_profiles_view as
select
  username,
  focus_goal,
  focus_playlist,
  rank_tier,
  rank_division,
  weekly_goal_days,
  current_streak,
  packs_completed_count,
  consistency_score,
  created_at
from profiles
where public_profile_enabled = true
  and username is not null;

-- 5) Allow anonymous and authenticated users to read the view
grant select on public_profiles_view to anon;
grant select on public_profiles_view to authenticated;
