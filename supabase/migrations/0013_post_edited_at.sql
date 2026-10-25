-- 0013: posts.edited_at, when a post's content last changed, for the "Updated" line on /blog/<slug>.
-- updated_at moves on every change to the row (a status change, a review decision, being featured), so
-- it cannot tell an edit from a republish; edited_at moves only when the title, excerpt, body, category,
-- tags, direction or cover change. Existing posts start without it, so no post shows an edit it may not
-- have had. Safe to run again.

alter table public.posts add column if not exists edited_at timestamptz;

create or replace function public.touch_post_edited() returns trigger language plpgsql as $$
begin
  if (new.title, new.excerpt, new.content_html, new.content_json, new.category, new.tags, new.dir, new.cover_key)
    is distinct from (old.title, old.excerpt, old.content_html, old.content_json, old.category, old.tags, old.dir, old.cover_key)
  then
    new.edited_at = now();
  end if;
  return new;
end $$;
drop trigger if exists touch_post_edited on public.posts;
create trigger touch_post_edited before update on public.posts for each row execute function public.touch_post_edited();
