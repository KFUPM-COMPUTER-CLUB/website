import { P as __exportAll } from "./content_DecWaDc1.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { t as $$BaseLayout } from "./BaseLayout_D1GVgmLe.mjs";
/* empty css              */
//#region src/pages/onboarding.astro
var onboarding_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Onboarding,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Onboarding = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Onboarding;
	const p = Astro.locals.profile;
	const next = Astro.url.searchParams.get("next") || "/me";
	const error = Astro.url.searchParams.get("error");
	const years = [
		"Freshman",
		"Sophomore",
		"Junior",
		"Senior",
		"Graduate",
		"Alumni",
		"Other"
	];
	const suggested = (p?.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 20);
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": "Welcome",
		"noindex": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="page-head page-head--compact"><div class="container"><span class="eyebrow">One last step</span><h1 class="h1">Tell us who you are.</h1><p class="lead">Takes a minute. The WhatsApp groups appear right after. Your phone and email stay visible to the club's admins only.</p></div></section><section class="section"><div class="container">${error && renderTemplate`<p class="flash--error" style="margin-bottom:20px">${error}</p>`}<form class="form" method="post" action="/api/me/onboard" enctype="multipart/form-data"><input type="hidden" name="next"${addAttribute(next, "value")}><div class="form__row"><div class="field"><label for="name">Full name</label><input class="input" id="name" name="name" required maxlength="80"${addAttribute(p?.name || "", "value")}></div><div class="field"><label for="handle">Public handle</label><input class="input" id="handle" name="handle" required pattern="[a-z0-9_]{3,24}" maxlength="24"${addAttribute(p?.handle || suggested, "value")}><small>3 to 24 characters: letters, digits, underscore. Your profile lives at /u/handle.</small></div></div><div class="form__row"><div class="field"><label for="email">Email</label><input class="input" id="email" name="email" type="email" required maxlength="120"${addAttribute(p?.email || Astro.locals.user?.email || "", "value")}></div><div class="field"><label for="phone">Phone (Saudi)</label><input class="input" id="phone" name="phone" type="tel" required inputmode="tel" placeholder="05xxxxxxxx"${addAttribute(p?.phone || "", "value")}><small>05xxxxxxxx or +9665xxxxxxxx. Admins only.</small></div></div><div class="form__row"><div class="field"><label for="major">Major</label><input class="input" id="major" name="major" required maxlength="80"${addAttribute(p?.major || "", "value")}></div><div class="field"><label for="year">Year</label><select class="select" id="year" name="year" required>${years.map((y) => renderTemplate`<option${addAttribute(y, "value")}${addAttribute(p?.year === y, "selected")}>${y}</option>`)}</select></div></div><details><summary class="field__label" style="cursor:pointer">Optional: KFUPM email, GitHub, LinkedIn, bio, photo</summary><div class="form" style="margin-top:16px"><div class="form__row"><div class="field"><label for="kfupm_email">KFUPM email</label><input class="input" id="kfupm_email" name="kfupm_email" type="email" maxlength="120"${addAttribute(p?.kfupm_email || "", "value")}></div><div class="field"><label for="github">GitHub username</label><input class="input" id="github" name="github" maxlength="60"${addAttribute(p?.github || "", "value")}></div></div><div class="field"><label for="linkedin">LinkedIn URL</label><input class="input" id="linkedin" name="linkedin" type="url" maxlength="200"${addAttribute(p?.linkedin || "", "value")}></div><div class="field"><label for="bio">Bio</label><textarea class="textarea" id="bio" name="bio" maxlength="400">${p?.bio || ""}</textarea></div><div class="field"><label for="avatar">Photo</label><input class="input" id="avatar" name="avatar" type="file" accept="image/*"><small>JPEG, PNG or WebP under 8 MB. Without one we use your sign-in avatar.</small></div></div></details><label class="check"><input type="checkbox" name="show_in_contributors" value="1" checked> Show me on the Community page when I publish posts</label><div class="form__actions"><button class="btn" type="submit">Join the club <span aria-hidden="true">→</span></button><span class="hint">You can edit all of this later. By joining you accept the <a href="/terms">terms</a> and the <a href="/privacy">privacy page</a>.</span></div></form></div></section>` })}`;
}, "/home/user/website/src/pages/onboarding.astro", void 0);
var $$file = "/home/user/website/src/pages/onboarding.astro";
var $$url = "/onboarding";
//#endregion
//#region \0virtual:astro:page:src/pages/onboarding@_@astro
var page = () => onboarding_exports;
//#endregion
export { page };
