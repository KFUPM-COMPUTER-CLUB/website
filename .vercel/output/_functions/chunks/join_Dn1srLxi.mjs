import { C as __exportAll, h as getSettings } from "./content_DQWivrjm.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, O as Fragment, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { o as dbReady, s as googleEnabled } from "./supabase_Bb8GfBf3.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { t as $$BaseLayout } from "./BaseLayout_Bwpc_3c8.mjs";
//#region src/pages/join.astro
var join_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Join,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Join = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Join;
	const settings = await getSettings();
	const q = Astro.url.searchParams;
	const next = q.get("next") || "/me";
	const error = q.get("error");
	const google = googleEnabled();
	if (Astro.locals.user) return Astro.redirect(Astro.locals.profile?.onboarded ? next : "/onboarding");
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": "Join",
		"description": "Join the KFUPM Computer Club: sign in with GitHub or Google, tell us about yourself, and you are in."
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="page-head page-head--compact"><div class="container"><span class="eyebrow">Join the club</span><h1 class="h-display">Any major. Any year.</h1><p class="lead">${settings.site.intro} Sign in, fill in a short form, and the WhatsApp groups are yours.</p></div></section><section class="section"><div class="container" style="max-width:720px">${!dbReady() ? renderTemplate`<div class="notice"><p><b>Sign-in is being set up.</b> Membership opens as soon as the club connects its accounts. Follow <a${addAttribute(settings.links.x || "https://x.com/KFUPM_CC", "href")} target="_blank" rel="noopener">@KFUPM_CC</a> for the announcement.</p></div>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${error && renderTemplate`<p class="notice notice--warn">Sign-in did not complete (${error}). Try again.</p>`}${q.get("google") === "off" && renderTemplate`<p class="notice notice--warn">Google sign-in is not switched on yet. Use GitHub for now.</p>`}<div class="join__buttons"><a class="btn"${addAttribute(`/auth/login?provider=github&next=${encodeURIComponent(next)}`, "href")}>Continue with GitHub <span aria-hidden="true">→</span></a>${google ? renderTemplate`<a class="btn btn--ghost"${addAttribute(`/auth/login?provider=google&next=${encodeURIComponent(next)}`, "href")}>Continue with Google <span aria-hidden="true">→</span></a>` : renderTemplate`<span class="btn btn--ghost is-disabled" aria-disabled="true" title="Google sign-in is not switched on yet">Continue with Google · soon</span>`}</div><p class="lead lead--muted" style="margin-top:28px">One account per person. You can link both providers later from your dashboard. Your phone number and email are visible to the club's admins only, and you can delete your account at any time.</p>` })}`}</div></section>` })}`;
}, "/home/user/website/src/pages/join.astro", void 0);
var $$file = "/home/user/website/src/pages/join.astro";
var $$url = "/join";
//#endregion
//#region \0virtual:astro:page:src/pages/join@_@astro
var page = () => join_exports;
//#endregion
export { page };
