import { D as __exportAll, g as getSettings, r as fmtRiyadh } from "./content_Dw4BquHy.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, O as Fragment, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { o as dbReady, t as publicClient } from "./supabase_BYajXEmb.mjs";
import { g as createComponent, h as createAstro, r as $$Image } from "./_astro_assets_BiTtY4hV.mjs";
import { r as logo_color_ondark_sm_default, t as $$BaseLayout } from "./BaseLayout_CmhdDrAC.mjs";
//#region src/pages/u/[handle].astro
var _handle__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Handle,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Handle = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Handle;
	const handle = (Astro.params.handle || "").toLowerCase();
	if (!dbReady() || !/^[a-z0-9_]{3,24}$/.test(handle)) return new Response(null, { status: 404 });
	const db = publicClient();
	const { data: p } = await db.from("profiles_public").select("*").eq("handle", handle).maybeSingle();
	if (!p) return new Response(null, { status: 404 });
	const [{ data: posts }, { data: regs }, { data: officer }, { data: solved }, settings] = await Promise.all([
		db.from("posts").select("slug,title,excerpt,published_at,category").eq("author_id", p.id).eq("status", "published").order("published_at", { ascending: false }),
		db.from("registrations").select("attended,events(slug,title,starts_at)").eq("user_id", p.id).order("created_at", { ascending: false }).limit(12),
		db.from("officer_terms").select("title,committee,term,is_current").eq("user_id", p.id).order("is_current", { ascending: false }).limit(3),
		db.from("flag_solvers").select("id").eq("user_id", p.id).eq("approved", true).limit(1),
		getSettings()
	]);
	const current = (officer || []).find((o) => o.is_current);
	const badges = [
		current && `Officer · ${current.title}`,
		(officer || []).some((o) => !o.is_current) && "Past officer",
		(posts?.length || 0) > 0 && "Writer",
		(regs || []).some((r) => r.attended) && "Attended events",
		solved?.length && "Flag solver",
		`Member since ${String(p.created_at).slice(0, 4)}`
	].filter(Boolean);
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": p.name || p.handle,
		"description": p.bio || `${p.name} at the KFUPM Computer Club.`
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="page-head page-head--compact"><div class="container profile__head">${p.avatar_url ? renderTemplate`<img class="avatar avatar--lg"${addAttribute(p.avatar_url, "src")} alt="">` : renderTemplate`<span class="avatar avatar--lg person__blank" aria-hidden="true">${(p.name || "?").slice(0, 1)}</span>`}<div><span class="eyebrow">@${p.handle}</span><h1 class="h1" style="margin:0">${p.name}</h1>${(p.major || p.year) && renderTemplate`<p class="mono" style="margin:8px 0 0">${[p.major, p.year].filter(Boolean).join(" · ")}</p>`}<ul class="badges">${badges.map((b) => renderTemplate`<li class="chip">${b}</li>`)}</ul></div></div></section><section class="section"><div class="container">${p.bio && renderTemplate`<p class="lead" style="max-width:60ch">${p.bio}</p>`}<p class="links-row">${p.github && renderTemplate`<a class="link-arrow"${addAttribute(`https://github.com/${p.github}`, "href")} target="_blank" rel="noopener">GitHub ↗</a>`}${p.linkedin && renderTemplate`<a class="link-arrow"${addAttribute(p.linkedin, "href")} target="_blank" rel="noopener">LinkedIn ↗</a>`}</p>${current && renderTemplate`<article class="idcard" style="max-width:420px;margin:32px 0"><div class="idcard__top"><span class="idcard__brand">${renderComponent($$result, "Image", $$Image, {
		"src": logo_color_ondark_sm_default,
		"alt": "",
		"width": 32,
		"densities": [
			1,
			2,
			3
		]
	})} ${settings.site.name}</span><span class="mono">Officer · ${current.term}</span></div><div class="idcard__body"><div class="idcard__info"><h2>${p.name}</h2><p class="idcard__role">${current.title}</p><dl>${current.committee && renderTemplate`<div><dt>Committee</dt><dd>${current.committee}</dd></div>`}${p.major && renderTemplate`<div><dt>Major</dt><dd>${p.major}</dd></div>`}</dl></div></div><div class="idcard__strip"><span class="idcard__barcode" aria-hidden="true"></span><span class="mono">cckfupm.com</span></div></article>`}${posts?.length ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`<h2 class="h2" style="margin-top:40px">Posts</h2><div class="posts">${posts.map((x) => renderTemplate`<a class="post"${addAttribute(`/blog/${x.slug}`, "href")}><time class="post__date"${addAttribute(String(x.published_at).slice(0, 10), "datetime")}><b>${fmtRiyadh(new Date(x.published_at), { month: "short" })}</b><span>${fmtRiyadh(new Date(x.published_at), {
		day: "numeric",
		year: "numeric"
	})}</span></time><div class="post__body"><h3 class="post__title">${x.title}</h3><p class="post__excerpt">${x.excerpt}</p></div></a>`)}</div>` })}` : null}${regs?.length ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`<h2 class="h2" style="margin-top:40px">Events</h2><ul>${regs.map((r) => r.events && renderTemplate`<li><a${addAttribute(`/timeline#ev-${r.events.slug}`, "href")}>${r.events.title}</a> · <span class="mono">${fmtRiyadh(new Date(r.events.starts_at), {
		day: "numeric",
		month: "short",
		year: "numeric"
	})}</span> ${r.attended ? renderTemplate`<span class="chip chip--published">attended</span>` : renderTemplate`<span class="chip">registered</span>`}</li>`)}</ul>` })}` : null}</div></section>` })}`;
}, "/home/user/website/src/pages/u/[handle].astro", void 0);
var $$file = "/home/user/website/src/pages/u/[handle].astro";
var $$url = "/u/[handle]";
//#endregion
//#region \0virtual:astro:page:src/pages/u/[handle]@_@astro
var page = () => _handle__exports;
//#endregion
export { page };
