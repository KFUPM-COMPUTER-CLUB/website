import { f as serviceReady, r as serviceClient } from "./supabase_CcU7CO77.mjs";
//#region src/lib/whatsapp.ts
async function getWhatsappGroups() {
	if (!serviceReady()) return [];
	const { data } = await serviceClient().from("settings").select("value").eq("key", "whatsapp_groups").maybeSingle();
	return Array.isArray(data?.value) ? data.value.filter((g) => g && g.url) : [];
}
//#endregion
export { getWhatsappGroups as t };
