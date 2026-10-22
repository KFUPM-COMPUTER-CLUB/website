/* WhatsApp group links: admin-only setting, shown to onboarded members on screen and in the welcome email. */
import { serviceReady } from './env';
import { serviceClient } from './supabase';
export type Group = { label: string; url: string };
export async function getWhatsappGroups(): Promise<Group[]> {
  if (!serviceReady()) return [];
  const { data } = await serviceClient().from('settings').select('value').eq('key', 'whatsapp_groups').maybeSingle();
  return Array.isArray(data?.value) ? data!.value.filter((g: any) => g && g.url) : [];
}
