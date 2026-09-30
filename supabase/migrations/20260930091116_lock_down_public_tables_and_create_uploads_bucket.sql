-- The app reaches Postgres only through Prisma as `postgres` (BYPASSRLS) and
-- Storage only with the service_role key (BYPASSRLS). Nothing uses the Data
-- API (PostgREST) with the anon/authenticated keys, so those roles get no
-- access at all: RLS with no policies denies everything, and the default
-- grants are revoked as a second layer.

alter table public."Nomination"  enable row level security;
alter table public."Application" enable row level security;
alter table public."JuryScore"   enable row level security;
alter table public."Winner"      enable row level security;
alter table public."Gallery"     enable row level security;
alter table public."HeroSlide"   enable row level security;
alter table public."SiteContent" enable row level security;
alter table public."User"        enable row level security;

revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- Tables that `prisma db push` creates later must not be exposed either.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;

-- Private bucket for uploads (src/lib/storage.ts); files are served through
-- the app's /uploads/[...path] route, never publicly.
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;
