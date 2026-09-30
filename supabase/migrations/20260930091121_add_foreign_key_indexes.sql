-- Same names Prisma generates for the @@index entries in prisma/schema.prisma,
-- so `prisma db push` sees no drift.
create index if not exists "Application_nominationId_idx" on public."Application" ("nominationId");
create index if not exists "Application_userId_idx"       on public."Application" ("userId");
create index if not exists "JuryScore_judgeId_idx"        on public."JuryScore"   ("judgeId");
create index if not exists "Winner_nominationId_idx"      on public."Winner"      ("nominationId");
