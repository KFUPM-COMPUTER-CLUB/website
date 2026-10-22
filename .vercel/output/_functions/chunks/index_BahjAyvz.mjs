import { P as __exportAll, r as fmtRiyadh } from "./content_cbSbtds5.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { r as serviceClient } from "./supabase_CcU7CO77.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { t as getWhatsappGroups } from "./whatsapp_GAvfnLdX.mjs";
import { t as $$MeLayout } from "./MeLayout_Ccj2yCcv.mjs";
//#region src/pages/me/index.astro
var me_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => "/me"
});
createAstro("https://cckfupm-website.vercel.app");
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const { user, profile, role } = Astro.locals;
	const sb = serviceClient();
	const [{ data: posts }, { data: regs }, groups] = await Promise.all([
		sb.from("posts").select("id,slug,title,status,updated_at").eq("author_id", user.id).order("updated_at", { ascending: false }).limit(5),
		sb.from("registrations").select("event_id,attended,events(slug,title,starts_at,location)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
		getWhatsappGroups()
	]);
	const welcome = Astro.url.searchParams.has("welcome");
	return renderTemplate`${renderComponent($$result, "MeLayout", $$MeLayout, {
		"title": welcome ? `Welcome, ${profile?.name?.split(" ")[0] || "member"}.` : `Hi, ${profile?.name?.split(" ")[0] || "member"}.`,
		"lead": welcome ? "You are in. The groups below are where everything happens." : void 0
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="card"><h2 class="h3">WhatsApp groups</h2>${groups.length ? renderTemplate`<div class="wa-links">${groups.map((g) => renderTemplate`<a${addAttribute(g.url, "href")} target="_blank" rel="noopener"><b>${g.label}</b><span class="mono">Open ↗</span></a>`)}</div>` : renderTemplate`<p class="hint">The group links are not set yet. An admin adds them under Settings.</p>`}<p class="hint" style="margin:12px 0 0">These links are for members only. Please do not post them publicly.</p></div><div class="cards" style="margin-top:16px"><div class="stat"><b>${posts?.length || 0}</b><span>recent posts</span></div><div class="stat"><b>${regs?.length || 0}</b><span>reservations</span></div><div class="stat"><b style="font-size:20px">${role}</b><span>role</span></div></div><div class="card" style="margin-top:16px"><h2 class="h3">My posts</h2>${posts?.length ? renderTemplate`<div class="table-wrap"><table class="table"><thead><tr><th>Title</th><th>Status</th><th>Updated</th></tr></thead><tbody>${posts.map((p) => renderTemplate`<tr><td><a${addAttribute(`/me/posts/${p.id}/edit`, "href")}>${p.title}</a></td><td><span${addAttribute(`chip chip--${p.status}`, "class")}>${p.status.replace("_", " ")}</span></td><td class="mono">${String(p.updated_at).slice(0, 10)}</td></tr>`)}</tbody></table></div>` : renderTemplate`<p class="hint">No posts yet.</p>`}<p style="margin:14px 0 0"><a class="btn btn--small" href="/me/posts/new">Write a post <span aria-hidden="true">→</span></a> <a class="btn btn--small btn--ghost" href="/me/posts">All my posts</a></p></div><div class="card" style="margin-top:16px"><h2 class="h3">My reservations</h2>${regs?.length ? renderTemplate`<ul>${regs.map((r) => renderTemplate`<li><a${addAttribute(`/timeline#ev-${r.events?.slug}`, "href")}>${r.events?.title}</a> · <span class="mono">${r.events?.starts_at ? fmtRiyadh(new Date(r.events.starts_at), {
		day: "numeric",
		month: "short"
	}) : ""}</span>${r.attended && renderTemplate`<span class="chip chip--published" style="margin-left:8px">attended</span>`}</li>`)}</ul>` : renderTemplate`<p class="hint">No reservations yet. Upcoming events are on the <a href="/timeline">timeline</a>.</p>`}</div>${profile?.handle && renderTemplate`<p style="margin-top:20px"><a class="link-arrow"${addAttribute(`/u/${profile.handle}`, "href")}>See my public profile →</a></p>`}` })}`;
}, "/home/user/website/src/pages/me/index.astro", void 0);
var $$file = "/home/user/website/src/pages/me/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/me/index@_@astro
var page = () => me_exports;
//#endregion
export { page };
