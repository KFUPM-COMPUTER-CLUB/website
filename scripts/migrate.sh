#!/usr/bin/env bash
# Applies the SQL files in supabase/migrations that the database has not seen yet, in file-name
# order, and records each one in public.schema_migrations. The migrate workflow runs this on every
# merge to main; by hand:  SUPABASE_DB_URL='postgresql://...' scripts/migrate.sh
#
# The connection string is the "Session pooler" one from Supabase -> Connect (the direct host is
# IPv6 only, which GitHub runners cannot reach). Each file runs in one transaction, so a failing
# migration leaves nothing half-applied and is retried on the next run.
#
# Baseline: a database that already has the schema from 0001 but no schema_migrations table gets
# 0001 recorded without re-running it. Re-running 0001 after later migrations would fail, because
# "create or replace view" cannot drop the columns that 0003 added to profiles_public.
set -euo pipefail
: "${SUPABASE_DB_URL:?Set SUPABASE_DB_URL to the Postgres connection string (Supabase -> Connect -> Session pooler).}"
cd "$(dirname "$0")/.."

psql_() { psql "$SUPABASE_DB_URL" -X -q -v ON_ERROR_STOP=1 "$@"; }

psql_ -c "create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz not null default now());
          alter table public.schema_migrations enable row level security;"

if [ "$(psql_ -tAc "select count(*) from public.schema_migrations")" = "0" ] \
   && [ "$(psql_ -tAc "select to_regclass('public.profiles') is not null")" = "t" ]; then
  psql_ -c "insert into public.schema_migrations (name) values ('0001_init.sql') on conflict do nothing;"
  echo "baseline  0001_init.sql recorded as already applied"
fi

applied=0
for f in supabase/migrations/*.sql; do
  name=$(basename "$f")
  if [ "$(psql_ -tAc "select count(*) from public.schema_migrations where name = '$name'")" != "0" ]; then
    echo "skip      $name"
    continue
  fi
  echo "apply     $name"
  psql_ --single-transaction -f "$f" >/dev/null
  psql_ -c "insert into public.schema_migrations (name) values ('$name');"
  applied=$((applied + 1))
done
# The Data API (PostgREST) serves from a cached copy of the schema, so a new function or column can
# answer "not found" until that cache reloads. Ask for the reload after every run; it is harmless when
# nothing changed.
psql_ -c "notify pgrst, 'reload schema';"
echo "done      $applied applied, API schema reloaded"
