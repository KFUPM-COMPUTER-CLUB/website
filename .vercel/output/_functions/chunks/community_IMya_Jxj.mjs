import { D as __exportAll, d as getOfficers, g as getSettings, i as getContributors, u as getMemberCount } from "./content_BmaKDf7b.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { g as createComponent, r as $$Image } from "./_astro_assets_BiTtY4hV.mjs";
import { r as logo_color_ondark_sm_default, t as $$BaseLayout } from "./BaseLayout_CR5R09AB.mjs";
//#region src/pages/community.astro
var community_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Community,
	file: () => $$file,
	url: () => $$url
});
var $$Community = createComponent(async ($$result, $$props, $$slots) => {
	const [officers, memberCount, contributors, settings] = await Promise.all([
		getOfficers(),
		getMemberCount(),
		getContributors(),
		getSettings()
	]);
	const current = officers.filter((o) => o.isCurrent).sort((a, b) => a.sort - b.sort);
	const committees = [...new Set(current.map((o) => o.committee || "Board"))];
	const past = officers.filter((o) => !o.isCurrent);
	const terms = [...new Set(past.map((o) => o.term))].sort().reverse();
	const pad = (n) => String(n).padStart(3, "0");
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": "Community",
		"description": "The people of the KFUPM Computer Club: the board, the members, and the ones who write."
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="page-head"><div class="container"><h1 class="ccmark ccmark--text" aria-label="CC Community"><b>CC</b><span>Community</span></h1><p class="lead">${memberCount !== null ? `${memberCount.toLocaleString("en-US")} members and growing.` : "Students, like you."} Here is who runs it, and who writes.</p></div></section><section class="section" id="board"><div class="container"><span class="eyebrow">The board</span>${current.length === 0 && renderTemplate`<p class="lead lead--muted">The board for this term is being added.</p>`}${committees.map((c) => renderTemplate`<div class="board__group"><h2 class="h2">${c}</h2><div class="idcards">${current.filter((o) => (o.committee || "Board") === c).map((m, i) => renderTemplate`<article class="idcard reveal"><div class="idcard__top"><span class="idcard__brand">${renderComponent($$result, "Image", $$Image, {
		"src": logo_color_ondark_sm_default,
		"alt": "",
		"width": 32,
		"densities": [
			1,
			2,
			3
		]
	})} ${settings.site.name}</span><span class="mono">Officer${m.term && ` · ${m.term}`}</span></div><div class="idcard__body">${m.photo ? renderTemplate`<img class="idcard__photo"${addAttribute(m.photo, "src")}${addAttribute(m.name, "alt")} width="320" height="400" loading="lazy">` : renderTemplate`<span class="idcard__photo idcard__photo--empty" aria-hidden="true">CC</span>`}<div class="idcard__info"><h3>${m.handle ? renderTemplate`<a${addAttribute(`/u/${m.handle}`, "href")}>${m.name}</a>` : m.name}</h3><p class="idcard__role">${m.title}</p><dl>${m.committee && renderTemplate`<div><dt>Committee</dt><dd>${m.committee}</dd></div>`}${m.major && renderTemplate`<div><dt>Major</dt><dd>${m.major}</dd></div>`}<div><dt>ID</dt><dd>CC-${pad(m.sort || i + 1)}</dd></div></dl>${m.linkedin && renderTemplate`<a class="link-arrow"${addAttribute(m.linkedin, "href")} target="_blank" rel="noopener">LinkedIn ↗</a>`}</div></div><div class="idcard__strip"><span class="idcard__barcode" aria-hidden="true"></span><span class="mono">cckfupm.com</span></div></article>`)}</div></div>`)}</div></section>${contributors.length > 0 && renderTemplate`<section class="section section--lined" id="writers"><div class="container"><span class="eyebrow">Members who write</span><h2 class="h2">Top contributors</h2><ul class="people">${contributors.map((c) => renderTemplate`<li><a class="person"${addAttribute(`/u/${c.handle}`, "href")}>${c.avatar_url ? renderTemplate`<img${addAttribute(c.avatar_url, "src")} alt="" width="48" height="48" loading="lazy">` : renderTemplate`<span class="person__blank" aria-hidden="true">${(c.name || "?").slice(0, 1)}</span>`}<span><b>${c.name}</b><small>${c.posts} ${c.posts === 1 ? "post" : "posts"}</small></span></a></li>`)}</ul></div></section>`}${terms.length > 0 && renderTemplate`<section class="section section--lined" id="alumni"><div class="container"><span class="eyebrow">Past boards</span><h2 class="h2">Alumni</h2>${terms.map((t) => renderTemplate`<div class="alumni__term"><h3 class="h3">${t}</h3><ul class="alumni__list">${past.filter((o) => o.term === t).sort((a, b) => a.sort - b.sort).map((o) => renderTemplate`<li><b>${o.name}</b><span>${o.title}${o.committee && ` · ${o.committee}`}</span></li>`)}</ul></div>`)}</div></section>`}<section class="section"><div class="container join__inner"><h2 class="h1">${settings.home.buildWithUs.title}</h2><p class="lead lead--muted">${settings.home.buildWithUs.text}</p><div class="hero__actions"><a class="btn" data-magnet href="/join">Become a member <span aria-hidden="true">→</span></a></div></div></section>` })}`;
}, "/home/user/website/src/pages/community.astro", void 0);
var $$file = "/home/user/website/src/pages/community.astro";
var $$url = "/community";
//#endregion
//#region \0virtual:astro:page:src/pages/community@_@astro
var page = () => community_exports;
//#endregion
export { page };
