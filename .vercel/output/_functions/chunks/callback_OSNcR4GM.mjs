import { P as __exportAll } from "./content_DecWaDc1.mjs";
import { i as sessionClient, s as dbReady } from "./supabase_BOJmasnu.mjs";
import { g as safeNext } from "./api_CGwffj9f.mjs";
//#region src/pages/auth/callback.ts
var callback_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var GET = async ({ url, request, cookies, redirect }) => {
	if (!dbReady()) return redirect("/join?setup=1");
	const code = url.searchParams.get("code");
	const next = url.searchParams.get("next") || "/me";
	const safeNext$1 = safeNext(next);
	if (!code) return redirect("/join?error=" + encodeURIComponent(url.searchParams.get("error_description") || "cancelled"));
	const supabase = sessionClient(request, cookies);
	const { data, error } = await supabase.auth.exchangeCodeForSession(code);
	if (error || !data.user) return redirect("/join?error=exchange");
	cookies.set("cc_in", "1", {
		path: "/",
		maxAge: 2592e3,
		sameSite: "lax",
		httpOnly: false,
		secure: url.protocol === "https:"
	});
	const { data: profile } = await supabase.from("profiles").select("onboarded").eq("id", data.user.id).maybeSingle();
	return redirect(profile?.onboarded ? safeNext$1 : `/onboarding?next=${encodeURIComponent(safeNext$1)}`);
};
//#endregion
//#region \0virtual:astro:page:src/pages/auth/callback@_@ts
var page = () => callback_exports;
//#endregion
export { page };
