import { D as __exportAll } from "./content_Dw4BquHy.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { i as sessionClient, s as googleEnabled } from "./supabase_BYajXEmb.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { t as $$MeLayout } from "./MeLayout_RNs63oGT.mjs";
//#region src/pages/me/profile.astro
var profile_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Profile,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Profile = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Profile;
	const p = Astro.locals.profile;
	const years = [
		"Freshman",
		"Sophomore",
		"Junior",
		"Senior",
		"Graduate",
		"Alumni",
		"Other"
	];
	const { data: { user } } = await sessionClient(Astro.request, Astro.cookies).auth.getUser();
	const providers = (user?.identities || []).map((i) => i.provider);
	return renderTemplate`${renderComponent($$result, "MeLayout", $$MeLayout, {
		"title": "Profile",
		"lead": "What people see on your public profile, plus the details only admins see."
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<form class="form" method="post" action="/api/me/profile" enctype="multipart/form-data"><div class="profile__head">${p.avatar_url ? renderTemplate`<img class="avatar avatar--lg"${addAttribute(p.avatar_url, "src")} alt="">` : renderTemplate`<span class="avatar avatar--lg person__blank" aria-hidden="true">${(p.name || "?").slice(0, 1)}</span>`}<div class="field"><label for="avatar">Change photo</label><input class="input" id="avatar" name="avatar" type="file" accept="image/*"></div></div><div class="form__row"><div class="field"><label for="name">Full name</label><input class="input" id="name" name="name" required maxlength="80"${addAttribute(p.name || "", "value")}></div><div class="field"><label for="handle">Handle</label><input class="input" id="handle" name="handle" required pattern="[a-z0-9_]{3,24}"${addAttribute(p.handle || "", "value")}></div></div><div class="form__row"><div class="field"><label for="email">Email (admins only)</label><input class="input" id="email" name="email" type="email" required${addAttribute(p.email || "", "value")}></div><div class="field"><label for="phone">Phone (admins only)</label><input class="input" id="phone" name="phone" type="tel" required${addAttribute(p.phone || "", "value")}></div></div><div class="form__row"><div class="field"><label for="major">Major</label><input class="input" id="major" name="major" required${addAttribute(p.major || "", "value")}></div><div class="field"><label for="year">Year</label><select class="select" id="year" name="year">${years.map((y) => renderTemplate`<option${addAttribute(y, "value")}${addAttribute(p.year === y, "selected")}>${y}</option>`)}</select></div></div><div class="form__row"><div class="field"><label for="kfupm_email">KFUPM email</label><input class="input" id="kfupm_email" name="kfupm_email" type="email"${addAttribute(p.kfupm_email || "", "value")}></div><div class="field"><label for="github">GitHub username</label><input class="input" id="github" name="github"${addAttribute(p.github || "", "value")}></div></div><div class="field"><label for="linkedin">LinkedIn URL</label><input class="input" id="linkedin" name="linkedin" type="url"${addAttribute(p.linkedin || "", "value")}></div><div class="field"><label for="bio">Bio</label><textarea class="textarea" id="bio" name="bio" maxlength="400">${p.bio || ""}</textarea></div><label class="check"><input type="checkbox" name="show_in_contributors" value="1"${addAttribute(p.show_in_contributors, "checked")}> Show me among the top contributors on the Community page</label><div class="form__actions"><button class="btn" type="submit">Save</button></div></form><div class="card" style="margin-top:32px"><h2 class="h3">Sign-in methods</h2><p>Linked: <b>${providers.join(", ") || "none"}</b>. One account can use both GitHub and Google.</p><div class="links-row">${!providers.includes("github") && renderTemplate`<a class="btn btn--small btn--ghost" href="/auth/link?provider=github">Link GitHub</a>`}${!providers.includes("google") && (googleEnabled() ? renderTemplate`<a class="btn btn--small btn--ghost" href="/auth/link?provider=google">Link Google</a>` : renderTemplate`<span class="hint">Google linking opens once Google sign-in is switched on.</span>`)}</div></div><div class="card" style="margin-top:16px"><h2 class="h3">Delete my account</h2><p class="hint">Removes your profile, drafts, posts and reservations. Published posts are removed too. This cannot be undone.</p><form class="inline-form" method="post" action="/api/me/delete"><input class="input" name="confirm" placeholder="type &quot;delete&quot;" style="max-width:200px" required><button class="btn btn--small btn--danger" type="submit">Delete account</button></form></div><form method="post" action="/auth/logout" style="margin-top:24px"><button class="btn btn--small btn--ghost" type="submit">Sign out</button></form>` })}`;
}, "/home/user/website/src/pages/me/profile.astro", void 0);
var $$file = "/home/user/website/src/pages/me/profile.astro";
var $$url = "/me/profile";
//#endregion
//#region \0virtual:astro:page:src/pages/me/profile@_@astro
var page = () => profile_exports;
//#endregion
export { page };
