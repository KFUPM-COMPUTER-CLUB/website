import { P as __exportAll } from "./content_cbSbtds5.mjs";
import { i as sessionClient, l as googleEnabled, s as dbReady } from "./supabase_CcU7CO77.mjs";
import { g as safeNext } from "./api_BB02cnYN.mjs";
//#region src/pages/auth/login.ts
var login_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var GET = async ({ url, request, cookies, redirect }) => {
	if (!dbReady()) return redirect("/join?setup=1");
	const provider = url.searchParams.get("provider") === "google" ? "google" : "github";
	if (provider === "google" && !googleEnabled()) return redirect("/join?google=off");
	const next = url.searchParams.get("next") || "/me";
	const safeNext$1 = safeNext(next);
	const { data, error } = await sessionClient(request, cookies).auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(safeNext$1)}`,
			skipBrowserRedirect: true
		}
	});
	if (error || !data.url) return redirect("/join?error=start");
	return redirect(data.url);
};
//#endregion
//#region \0virtual:astro:page:src/pages/auth/login@_@ts
var page = () => login_exports;
//#endregion
export { page };
