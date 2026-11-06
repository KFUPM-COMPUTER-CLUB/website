/* What deleting an account removes before the auth user goes, shared by self-service deletion
 * (/api/me/delete) and the admin delete on /admin/members. /me/profile and /privacy promise the
 * member's profile, drafts, posts (published ones too), reservations and uploads; the database cascade
 * from auth.users only covers the profile, roles and registrations, and would otherwise keep posts under
 * the author_name snapshot, orphan drafts and their private files, keep the profile photo in Storage and
 * leave the name on /flag. So this removes, in order:
 *   - every post the member wrote, row first and then its files (as deleting one post does);
 *   - their profile photos (media rows tagged "avatar" that they uploaded) and the files behind them;
 *   - their flag solver rows.
 * Media they uploaded to the club's library as an officer stays: it belongs to events and pages.
 * Throws on a database error so the account is not deleted with its content half removed. */
import { serviceClient } from './supabase';
import { deletePostMedia, removeStoredFiles } from './upload';

export async function removeMemberContent(userId: string) {
  const sb = serviceClient();
  const { data: posts, error: postsError } = await sb.from('posts').select('id').eq('author_id', userId);
  if (postsError) throw new Error(postsError.message);
  for (const p of posts || []) {
    const { error } = await sb.from('posts').delete().eq('id', p.id);
    if (error) throw new Error(error.message);
    await deletePostMedia(p.id);
  }
  const { data: avatars, error: avatarError } = await sb
    .from('media')
    .select('key,sizes,bucket,kind,path')
    .eq('uploaded_by', userId)
    .contains('tags', ['avatar']);
  if (avatarError) throw new Error(avatarError.message);
  if (avatars?.length) {
    await removeStoredFiles(avatars);
    const { error } = await sb
      .from('media')
      .delete()
      .in(
        'key',
        avatars.map((a) => a.key),
      );
    if (error) throw new Error(error.message);
  }
  const { error: flagError } = await sb.from('flag_solvers').delete().eq('user_id', userId);
  if (flagError) throw new Error(flagError.message);
  return { posts: posts?.length || 0, photos: avatars?.length || 0 };
}
