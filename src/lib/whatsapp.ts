/* The members-only group links. They live under the private "whatsapp_groups" setting, which the
 * settings_read policy shows to admins only, so a member's token cannot read it: the server reads
 * it with the service key, and /me and the welcome email decide who gets it (onboarded members).
 * A database trigger refuses invite links under any public setting key, so they cannot leak by mistake. */
import { serviceReady } from './env';
import { serviceClient } from './supabase';
export type Group = { label: string; url: string };
export async function getWhatsappGroups(): Promise<Group[]> {
  if (!serviceReady()) return [];
  const { data } = await serviceClient().from('settings').select('value').eq('key', 'whatsapp_groups').maybeSingle();
  return Array.isArray(data?.value) ? data!.value.filter((g: any) => g && g.url) : [];
}
