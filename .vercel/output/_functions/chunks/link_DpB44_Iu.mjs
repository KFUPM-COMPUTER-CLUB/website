import { D as __exportAll } from "./content_BmaKDf7b.mjs";
import { i as sessionClient, o as dbReady, s as googleEnabled } from "./supabase_BKsAzIKQ.mjs";
//#region src/pages/auth/link.ts
var link_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var GET = async ({ url, request, cookies, redirect, locals }) => {
	if (!dbReady() || !locals.user) return redirect("/join");
	const provider = url.searchParams.get("provider") === "google" ? "google" : "github";
	if (provider === "google" && !googleEnabled()) return redirect("/me/profile?error=Google+sign-in+is+not+switched+on+yet.");
	const { data, error } = await sessionClient(request, cookies).auth.linkIdentity({
		provider,
		options: {
			redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent("/me/profile?ok=Linked.")}`,
			skipBrowserRedirect: true
		}
	});
	if (error || !data.url) return redirect(`/me/profile?error=${encodeURIComponent(error?.message || "Could not start linking.")}`);
	return redirect(data.url);
};
//#endregion
//#region \0virtual:astro:page:src/pages/auth/link@_@ts
var page = () => link_exports;
//#endregion
export { page };
