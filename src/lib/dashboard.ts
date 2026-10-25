/* The /me stat tiles' numbers: one call to member_stats() with the member alone, which covers all time
 * (0015_member_dashboard.sql). Server only: the function is for the service key, and /me calls it for
 * the signed-in member's own id. Returns null instead of throwing, so /me still renders without them. */
import { serviceReady } from './env';
import { serviceClient } from './supabase';
import type { Dashboard } from './stats';

export async function getDashboard(userId: string): Promise<Dashboard | null> {
  if (!serviceReady()) return null;
  try {
    const { data, error } = await serviceClient().rpc('member_stats', { p_user: userId });
    if (error) throw new Error(error.message);
    const r: any = Array.isArray(data) ? data[0] : data;
    if (!r) return null;
    return {
      events: Number(r.events) || 0,
      posts: Number(r.posts) || 0,
      points: Number(r.points) || 0,
      rank: r.rank == null ? null : Number(r.rank),
      streak: Number(r.streak) || 0,
    };
  } catch (e) {
    console.error('dashboard stats', e);
    return null;
  }
}
