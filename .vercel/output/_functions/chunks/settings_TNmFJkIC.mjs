import { P as __exportAll } from "./content_DecWaDc1.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, O as Fragment, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { r as serviceClient } from "./supabase_BOJmasnu.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { t as $$AdminLayout } from "./AdminLayout_F876dUNq.mjs";
//#region src/pages/admin/settings.astro
var settings_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Settings,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Settings = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Settings;
	if (Astro.locals.role !== "admin") return new Response("Admins only", { status: 403 });
	const { data } = await serviceClient().from("settings").select("key,value");
	const v = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
	const site = v.site || {}, links = v.links || {}, banner = v.banner || {}, groups = Array.isArray(v.whatsapp_groups) ? v.whatsapp_groups : [], tpl = v.email_templates || {}, made = Array.isArray(v.made_by) ? v.made_by : [];
	const LINKS = [
		["join", "Join form (optional, overrides the built-in join page)"],
		["instagram", "Instagram"],
		["x", "X"],
		["linkedin", "LinkedIn"],
		["github", "GitHub"],
		["solvers", "Flag solvers endpoint (optional)"]
	];
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Settings" }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<form class="form card" id="site" method="post" action="/api/admin/settings"><input type="hidden" name="key" value="site"><h2 class="h3">Club</h2><div class="form__row"><div class="field"><label for="name">Name</label><input class="input" id="name" name="name"${addAttribute(site.name || "KFUPM Computer Club", "value")}></div><div class="field"><label for="short">Short name</label><input class="input" id="short" name="short"${addAttribute(site.short || "CCKFUPM", "value")}></div></div><div class="field"><label for="tagline">Tagline</label><input class="input" id="tagline" name="tagline"${addAttribute(site.tagline || "", "value")}></div><div class="field"><label for="intro">Intro (under CC | KFUPM)</label><input class="input" id="intro" name="intro"${addAttribute(site.intro || "", "value")} maxlength="240"></div><div class="field"><label for="description">Description (search engines)</label><textarea class="textarea" id="description" name="description" maxlength="300">${site.description || ""}</textarea></div><div class="form__row"><div class="field"><label for="email">Club email</label><input class="input" id="email" name="email" type="email"${addAttribute(site.email || "", "value")}></div><div class="field"><label for="missionAr">Mission (Arabic)</label><input class="input" id="missionAr" name="missionAr" dir="rtl"${addAttribute(site.missionAr || "", "value")}></div></div><button class="btn btn--small" type="submit">Save club</button></form><form class="form card" id="links" method="post" action="/api/admin/settings" style="margin-top:16px"><input type="hidden" name="key" value="links"><h2 class="h3">Links</h2>${LINKS.map(([k, label]) => renderTemplate`<div class="field"><label${addAttribute(`l-${k}`, "for")}>${label}</label><input class="input"${addAttribute(`l-${k}`, "id")}${addAttribute(k, "name")} type="url"${addAttribute(links[k] || "", "value")} placeholder="https://…"></div>`)}<button class="btn btn--small" type="submit">Save links</button></form><form class="form card" id="whatsapp_groups" method="post" action="/api/admin/settings" style="margin-top:16px"><input type="hidden" name="key" value="whatsapp_groups"><h2 class="h3">Members-only group links</h2><p class="hint">WhatsApp, Discord or any invite link. Shown to members right after onboarding, on their dashboard and in the welcome email. Never public: the database refuses invite links under any public setting.</p>${[
		...groups,
		{},
		{}
	].slice(0, Math.max(groups.length + 1, 2)).map((g) => renderTemplate`<div class="form__row"><div class="field"><label>Label</label><input class="input" name="label[]"${addAttribute(g.label || "", "value")} placeholder="General"></div><div class="field"><label>Invite link</label><input class="input" name="url[]" type="url"${addAttribute(g.url || "", "value")} placeholder="https://chat.whatsapp.com/…"></div></div>`)}<button class="btn btn--small" type="submit">Save groups</button></form><form class="form card" id="banner" method="post" action="/api/admin/settings" style="margin-top:16px"><input type="hidden" name="key" value="banner"><h2 class="h3">Announcement banner</h2><div class="field"><label for="b-text">Text</label><input class="input" id="b-text" name="text"${addAttribute(banner.text || "", "value")} maxlength="160"></div><div class="field"><label for="b-url">Link (optional)</label><input class="input" id="b-url" name="url" type="url"${addAttribute(banner.url || "", "value")}></div><label class="check"><input type="checkbox" name="visible" value="1"${addAttribute(!!banner.visible, "checked")}> Show the banner</label><button class="btn btn--small" type="submit">Save banner</button></form><form class="form card" id="email_templates" method="post" action="/api/admin/settings" style="margin-top:16px"><input type="hidden" name="key" value="email_templates"><h2 class="h3">Email templates</h2><p class="hint">Leave a field empty to use the built-in text. Placeholders: ${"{{name}} {{siteUrl}} {{whatsappLinks}} {{postTitle}} {{status}} {{comment}} {{eventTitle}} {{eventWhen}} {{eventLocation}} {{calendarLinks}}"}</p>${[
		["welcome", "Welcome"],
		["status", "Post status change"],
		["registration", "Reservation copy"]
	].map(([k, label]) => renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`<div class="field"><label${addAttribute(`${k}_subject`, "for")}>${label}: subject</label><input class="input"${addAttribute(`${k}_subject`, "id")}${addAttribute(`${k}_subject`, "name")}${addAttribute(tpl[k]?.subject || "", "value")}></div><div class="field"><label${addAttribute(`${k}_html`, "for")}>${label}: body (HTML allowed)</label><textarea class="textarea"${addAttribute(`${k}_html`, "id")}${addAttribute(`${k}_html`, "name")}>${tpl[k]?.html || ""}</textarea></div>` })}`)}<button class="btn btn--small" type="submit">Save templates</button></form><form class="form card" id="made_by" method="post" action="/api/admin/settings" style="margin-top:16px"><input type="hidden" name="key" value="made_by"><h2 class="h3">Made by (footer credit)</h2>${[...made, {}].map((m) => renderTemplate`<div class="form__row"><div class="field"><label>Name</label><input class="input" name="name[]"${addAttribute(m.name || "", "value")}></div><div class="field"><label>GitHub username</label><input class="input" name="github[]"${addAttribute(m.github || "", "value")}></div></div>`)}<button class="btn btn--small" type="submit">Save credit</button></form>` })}`;
}, "/home/user/website/src/pages/admin/settings.astro", void 0);
var $$file = "/home/user/website/src/pages/admin/settings.astro";
var $$url = "/admin/settings";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/settings@_@astro
var page = () => settings_exports;
//#endregion
export { page };
