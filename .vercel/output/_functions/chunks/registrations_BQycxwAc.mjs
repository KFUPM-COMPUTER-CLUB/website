import { D as __exportAll, r as fmtRiyadh } from "./content_BmaKDf7b.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { r as serviceClient } from "./supabase_BKsAzIKQ.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { t as $$MeLayout } from "./MeLayout_CzP4ugyj.mjs";
//#region src/pages/me/registrations.astro
var registrations_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Registrations,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Registrations = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Registrations;
	const { user } = Astro.locals;
	const { data: regs } = await serviceClient().from("registrations").select("id,event_id,email_copy,attended,created_at,events(id,slug,title,starts_at,ends_at,location,x_url)").eq("user_id", user.id).order("created_at", { ascending: false });
	const upcoming = (regs || []).filter((r) => r.events && new Date(r.events.ends_at || r.events.starts_at).valueOf() >= Date.now() - 864e5);
	const past = (regs || []).filter((r) => !upcoming.includes(r));
	const when = (e) => fmtRiyadh(new Date(e.starts_at), {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric"
	});
	return renderTemplate`${renderComponent($$result, "MeLayout", $$MeLayout, {
		"title": "My events",
		"lead": "Spots you reserved. Cancel any time before the event."
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="card"><h2 class="h3">Upcoming</h2>${upcoming.length ? renderTemplate`<div class="table-wrap"><table class="table"><thead><tr><th>Event</th><th>When</th><th>Where</th><th></th></tr></thead><tbody>${upcoming.map((r) => renderTemplate`<tr><td><a${addAttribute(`/timeline#ev-${r.events.slug}`, "href")}>${r.events.title}</a></td><td class="mono">${when(r.events)}</td><td>${r.events.location}</td><td><form method="post"${addAttribute(`/api/events/${r.events.id}/register`, "action")}><input type="hidden" name="cancel" value="1"><button class="btn btn--tiny btn--ghost" type="submit">Cancel</button></form> <a class="btn btn--tiny btn--ghost"${addAttribute(`/api/events/${r.events.slug}.ics`, "href")}>.ics</a></td></tr>`)}</tbody></table></div>` : renderTemplate`<p class="hint">Nothing reserved. Open events are on the <a href="/timeline">timeline</a>.</p>`}</div><div class="card"><h2 class="h3">Past</h2>${past.length ? renderTemplate`<ul>${past.map((r) => renderTemplate`<li>${r.events?.title} · <span class="mono">${r.events ? when(r.events) : ""}</span> ${r.attended && renderTemplate`<span class="chip chip--published">attended</span>`}</li>`)}</ul>` : renderTemplate`<p class="hint">No past events yet.</p>`}</div>` })}`;
}, "/home/user/website/src/pages/me/registrations.astro", void 0);
var $$file = "/home/user/website/src/pages/me/registrations.astro";
var $$url = "/me/registrations";
//#endregion
//#region \0virtual:astro:page:src/pages/me/registrations@_@astro
var page = () => registrations_exports;
//#endregion
export { page };
