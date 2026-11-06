-- 0019: extra mail headers per queued message. The weekly digest carries the RFC 8058 one-click
-- unsubscribe headers (List-Unsubscribe and List-Unsubscribe-Post), which Gmail and Yahoo expect on bulk
-- mail; they hold the member's own signed link, so they are stored with the row (src/lib/email.ts) and
-- sent as they are. Null for every other kind of mail. Safe to run again.

alter table public.email_queue add column if not exists headers jsonb;
