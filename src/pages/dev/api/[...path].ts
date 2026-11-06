import type { APIRoute } from 'astro';
import { devOnly, devStore } from '../../../lib/dev';
import { nameColumns, readNameParts } from '../../../lib/names';

export const prerender = false;
/* Stand-in endpoints for the test pages (src/lib/dev.ts): the same requests the real forms and editor.js
 * make, answered from the dev server's memory. 404 outside npm run dev.
 *   POST profile  the profile form; DELETE-style actions are refused, as nothing real can be deleted here
 *   PATCH post    editor autosave;  POST post with _method=DELETE: delete, which resets the sample
 *   POST upload   an image or PDF from the editor, returned as a data: URL so it shows without Storage
 *   POST submit   "Submit for review", which locks the sample post */
const back = (to: string, key: 'ok' | 'error', msg: string) =>
  new Response(null, { status: 303, headers: { Location: `${to}?${key}=${encodeURIComponent(msg)}` } });
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
const text = (v: FormDataEntryValue | null, max = 400) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const run: APIRoute = async ({ params, request }) => {
  if (!devOnly()) return new Response(null, { status: 404 });
  const store = devStore();
  switch (params.path) {
    case 'profile': {
      const f = await request.formData();
      try {
        Object.assign(store.profile, nameColumns(readNameParts(Object.fromEntries(f))));
      } catch (e) {
        return back('/dev/profile', 'error', (e as Error).message);
      }
      for (const k of [
        'handle',
        'email',
        'phone',
        'major',
        'year',
        'kfupm_email',
        'github',
        'linkedin',
        'bio',
      ] as const)
        (store.profile as Record<string, unknown>)[k] = text(f.get(k)) || null;
      for (const k of ['show_in_contributors', 'show_on_leaderboard', 'show_badges', 'digest_opt_in'] as const)
        (store.profile as Record<string, unknown>)[k] = f.get(k) === '1';
      return back('/dev/profile', 'ok', 'Saved (test page: only in the dev server).');
    }
    case 'delete':
      return back('/dev/profile', 'error', 'Account deletion is off on test pages.');
    case 'logout':
      return back('/dev', 'ok', 'Signed out (test page: nothing changed).');
    case 'link':
      return back('/dev/profile', 'ok', 'Linking a provider needs Supabase; nothing happened.');
    case 'post': {
      if (request.method === 'POST') {
        const f = await request.formData();
        if (f.get('_method') === 'DELETE') {
          store.post.content_html = '';
          store.post.content_json = null;
          return back('/dev', 'ok', 'Post deleted (test page). Open the editor again to start a new one.');
        }
      }
      const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      for (const k of ['title', 'excerpt', 'category', 'dir', 'content_html'] as const)
        if (typeof b[k] === 'string') (store.post as Record<string, unknown>)[k] = b[k];
      if (Array.isArray(b.tags)) store.post.tags = b.tags.map(String);
      if ('content_json' in b) store.post.content_json = b.content_json;
      return json({ ok: true, post: store.post });
    }
    case 'upload': {
      const f = await request.formData();
      const file = f.get('file');
      if (!(file instanceof File)) return json({ ok: false, error: 'No file.' }, 400);
      const url = `data:${file.type || 'application/octet-stream'};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`;
      return json({ ok: true, url, alt: text(f.get('alt')), name: file.name, bytes: file.size });
    }
    case 'submit':
      store.post.status = 'submitted';
      return back('/dev/editor', 'ok', 'Submitted for review (test page). The editor is now locked.');
    default:
      return json({ ok: false, error: 'Unknown test endpoint.' }, 404);
  }
};
export const GET: APIRoute = async () => new Response(null, { status: 404 });
export const POST = run;
export const PATCH = run;
