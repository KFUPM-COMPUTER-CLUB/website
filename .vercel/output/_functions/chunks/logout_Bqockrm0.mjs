import { P as __exportAll } from "./content_DecWaDc1.mjs";
import { i as sessionClient, s as dbReady } from "./supabase_BOJmasnu.mjs";
//#region src/pages/auth/logout.ts
var logout_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = async ({ request, cookies, redirect }) => {
	if (dbReady()) await sessionClient(request, cookies).auth.signOut();
	cookies.delete("cc_in", { path: "/" });
	return redirect("/");
};
//#endregion
//#region \0virtual:astro:page:src/pages/auth/logout@_@ts
var page = () => logout_exports;
//#endregion
export { page };
