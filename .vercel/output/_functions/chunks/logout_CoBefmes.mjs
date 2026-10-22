import { D as __exportAll } from "./content_Dw4BquHy.mjs";
import { i as sessionClient, o as dbReady } from "./supabase_BYajXEmb.mjs";
//#region src/pages/auth/logout.ts
var logout_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
var POST = async ({ request, cookies, redirect }) => {
	if (dbReady()) await sessionClient(request, cookies).auth.signOut();
	cookies.delete("cc_in", { path: "/" });
	return redirect("/");
};
var GET = POST;
//#endregion
//#region \0virtual:astro:page:src/pages/auth/logout@_@ts
var page = () => logout_exports;
//#endregion
export { page };
