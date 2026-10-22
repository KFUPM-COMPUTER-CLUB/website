import { M as photoImg, P as __exportAll, _ as getStories, c as getHighlights, f as getPartners, g as getSettings, l as getImpact, v as getStripPhotos } from "./content_cbSbtds5.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, O as Fragment, P as maybeRenderHead, S as renderTransition, x as spreadAttributes } from "./sequence_CcNeFUgX.mjs";
import { g as createComponent, h as createAstro, o as createImageAsset, r as $$Image } from "./_astro_assets_BiTtY4hV.mjs";
import { i as renderScript, r as logo_color_ondark_sm_default, t as $$BaseLayout } from "./BaseLayout_BQqFWRil.mjs";
/* empty css                          */
//#region src/assets/brand/logo-color.png
var logo_color_default = createImageAsset({
	"src": "/_astro/logo-color.DZ2CR7QK.png",
	"width": 1748,
	"height": 940,
	"format": "png"
}, "/home/user/website/src/assets/brand/logo-color.png", false);
//#endregion
//#region src/assets/brand/kfupm-logo.png
var kfupm_logo_default = createImageAsset({
	"src": "/_astro/kfupm-logo.CwviFpAE.png",
	"width": 1284,
	"height": 211,
	"format": "png"
}, "/home/user/website/src/assets/brand/kfupm-logo.png", false);
//#endregion
//#region src/components/Collage.astro
var $$Collage = createComponent(async ($$result, $$props, $$slots) => {
	const items = await getHighlights();
	const fmt = (d) => (/* @__PURE__ */ new Date(d + "T00:00:00Z")).toLocaleDateString("en-GB", {
		month: "short",
		year: "numeric",
		timeZone: "UTC"
	});
	const seen = /* @__PURE__ */ new Set();
	const morph = (key) => {
		if (!key) return void 0;
		const n = `photo-${key.replace(/\.[a-z]+$/i, "")}`;
		if (seen.has(n)) return void 0;
		seen.add(n);
		return n;
	};
	return renderTemplate`${maybeRenderHead($$result)}<div class="collage" aria-label="Club highlights">${items.map((h, i) => renderTemplate`<a${addAttribute(renderTransition($$result, "3vhrvpzm", "", morph(h.photoKey)), "data-astro-transition-scope")}${addAttribute(`polaroid polaroid--${i + 1}`, "class")}${addAttribute(h.postUrl || "#", "href")} target="_blank" rel="noopener"><img class="polaroid__photo"${addAttribute(h.img.src, "src")}${addAttribute(h.img.srcset, "srcset")} sizes="(min-width: 1024px) 300px, 90vw"${addAttribute(h.title, "alt")} width="640" height="480"${addAttribute(i < 3 ? "eager" : "lazy", "loading")} decoding="async"><div class="polaroid__cap"><span>${fmt(h.date)}</span><b>${h.title}</b></div><div class="polaroid__card" aria-hidden="true"><span class="mono">${fmt(h.date)}</span><strong>${h.title}</strong><p>${h.line}</p><em>Open the post ↗</em></div></a>`)}</div>`;
}, "/home/user/website/src/components/Collage.astro", "self");
//#endregion
//#region src/components/PhotoStrip.astro
var $$PhotoStrip = createComponent(async ($$result, $$props, $$slots) => {
	const items = (await getStripPhotos()).map((p) => ({
		...p,
		year: p.date.slice(0, 4)
	})).sort((a, b) => a.date.localeCompare(b.date));
	const fmt = (d) => d ? (/* @__PURE__ */ new Date(d + "T00:00:00Z")).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC"
	}) : "";
	return renderTemplate`${maybeRenderHead($$result)}<div class="strip" data-strip><ul class="strip__track">${items.map((p) => renderTemplate`<li class="strip__item"${addAttribute(p.year, "data-year")} hidden><a${addAttribute(p.postUrl || "#", "href")} target="_blank" rel="noopener"><img${addAttribute(p.img.src, "src")}${addAttribute(p.img.srcset, "srcset")} sizes="360px"${addAttribute(`Club event, ${fmt(p.date)}`, "alt")} width="360" height="240" loading="lazy" decoding="async"><span class="strip__cap"><b>${p.label}</b><span>${fmt(p.date)}</span></span></a></li>`)}</ul></div>${renderScript($$result, "/home/user/website/src/components/PhotoStrip.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/website/src/components/PhotoStrip.astro", void 0);
//#endregion
//#region src/components/Partners.astro
var $$Partners = createComponent(async ($$result, $$props, $$slots) => {
	const friends = (await getPartners()).filter((c) => c.kind !== "visited");
	const href = (e) => e.sourceUrl || e.url || void 0;
	return renderTemplate`${maybeRenderHead($$result)}<section class="section partners bg-black" data-bg="#0B0B0F"><div class="container partners__inner"><span class="eyebrow reveal">Friends of the club</span><p class="partners__lead reveal">We're building a place at KFUPM where <b>curious students become builders</b>, and we're lucky to have friends whose work we really admire.</p><ul class="logo-tree reveal">${friends.map((c) => renderTemplate`<li><a${addAttribute(href(c), "href")} target="_blank" rel="noopener"${addAttribute(c.what, "title")}${addAttribute(c.what ? `${c.name}: ${c.what}` : c.name, "aria-label")}>${c.logo && c.mark ? renderTemplate`<span${addAttribute(`logo-tree__pair${c.square ? " logo-tree__pair--square" : ""}`, "class")}><img${addAttribute(c.logo.src, "src")} alt="" loading="lazy"><span class="logo-tree__text">${c.name}</span></span>` : c.logo ? renderTemplate`<img${addAttribute(c.tall ? "logo-tree__img--tall" : void 0, "class")}${addAttribute(c.logo.src, "src")}${addAttribute(c.name, "alt")} loading="lazy">` : renderTemplate`<span${addAttribute(`logo-tree__text${c.kind === "kfupm_unit" ? " logo-tree__text--kfupm" : ""}`, "class")}>${c.name}</span>`}</a></li>`)}</ul><div class="partners__ask reveal" id="partner"><a class="btn btn--light" data-magnet href="/officers">Partner with us <span aria-hidden="true">→</span></a></div></div></section>`;
}, "/home/user/website/src/components/Partners.astro", void 0);
//#endregion
//#region src/components/ShowReel.astro
var $$ShowReel = createComponent(async ($$result, $$props, $$slots) => {
	const settings = await getSettings();
	const scenes = (await getImpact()).filter((s) => s.totalSar && s.img).sort((a, b) => Number(b.term.slice(-4)) - Number(a.term.slice(-4)) || (a.term.startsWith("Fall") ? -1 : 1));
	const sar = (n) => n.toLocaleString("en-US");
	const totalNum = settings.home.totalPrizesSar;
	const stats = settings.home.stats;
	return renderTemplate`${maybeRenderHead($$result)}<section class="reel bg-black" data-bg="#0B0B0F" data-reel${addAttribute(`--n:${scenes.length}`, "style")} id="impact"><div class="reel__stage"><div class="reel__backdrops" aria-hidden="true">${scenes.map((s, i) => renderTemplate`<div class="reel__scene"${addAttribute(i, "data-scene")}${addAttribute(i === 0 ? "" : void 0, "data-active")}><img${addAttribute(s.img.src, "src")}${addAttribute(s.img.srcset, "srcset")} sizes="100vw" alt="" width="1600" height="1000"${addAttribute(i === 0 ? "eager" : "lazy", "loading")} decoding="async"></div>`)}<div class="reel__beam"></div><div class="reel__grain"></div><div class="reel__shade"></div></div><div class="reel__content">${renderComponent($$result, "Image", $$Image, {
		"class": "reel__icon",
		"src": logo_color_ondark_sm_default,
		"alt": "",
		"width": 64,
		"densities": [1, 2]
	})}<p class="reel__big"><strong${addAttribute(totalNum, "data-count")}>${sar(totalNum)}</strong>+ SAR</p><p class="reel__line">in prizes offered since 2023</p><ul class="reel__list">${scenes.map((s, i) => renderTemplate`<li><button type="button" class="reel__link"${addAttribute(i, "data-index")}${addAttribute(i === 0 ? "" : void 0, "data-active")}><span>${s.term}</span><i aria-hidden="true">·</i><span>${sar(s.totalSar)}${s.isMinimum && "+"}</span></button></li>`)}</ul><div class="reel__events">${scenes.map((s, i) => renderTemplate`<p${addAttribute(i, "data-events")}${addAttribute(i !== 0, "hidden")}>${s.items.filter((e) => e.prizeSar).map((e, k) => renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${k > 0 && renderTemplate`<span aria-hidden="true"> · </span>`}<a${addAttribute(e.sourceUrl || "#", "href")} target="_blank" rel="noopener">${e.name.replace(/\s*\(.*\)$/, "")} ${sar(e.prizeSar)} SAR</a>` })}`)}</p>`)}</div><div class="reel__stats">${stats.map((t) => renderTemplate`<div><strong>${t.v} <small>${t.u}</small></strong><span>${t.l}</span></div>`)}</div><p class="reel__print mono">Prize pools as announced in club posts.</p></div></div></section>${renderScript($$result, "/home/user/website/src/components/ShowReel.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/website/src/components/ShowReel.astro", void 0);
//#endregion
//#region src/components/Stories.astro
var $$Stories = createComponent(async ($$result, $$props, $$slots) => {
	const stories = await getStories();
	const fmt = (d) => (/* @__PURE__ */ new Date(d + "T00:00:00Z")).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC"
	});
	return renderTemplate`${maybeRenderHead($$result)}<section class="stories bg-black" data-bg="#0B0B0F" data-stories aria-roledescription="carousel" aria-label="Moments from the club">${stories.map((s, i) => renderTemplate`<article class="story"${addAttribute(i, "data-slide")}${addAttribute(i === 0 ? "" : void 0, "data-active")}${addAttribute(i !== 0, "aria-hidden")}><img class="story__photo"${addAttribute(s.img.src, "src")}${addAttribute(s.img.srcset, "srcset")} sizes="100vw" alt="" width="1800" height="1000"${addAttribute(i === 0 ? "eager" : "lazy", "loading")} decoding="async"><div class="story__card"><span class="eyebrow">${fmt(s.date)}</span><h3 class="h2">${s.title}</h3><p>${s.text}</p>${s.postUrl && renderTemplate`<a class="link-arrow"${addAttribute(s.postUrl, "href")} target="_blank" rel="noopener">Open the post ↗</a>`}</div></article>`)}<div class="story__nav"><button type="button" class="story__arrow" data-dir="-1" aria-label="Previous">‹</button><span class="story__dots">${stories.map((_, i) => renderTemplate`<button type="button"${addAttribute(i, "data-go")}${addAttribute(`Slide ${i + 1}`, "aria-label")}${addAttribute(i === 0 ? "" : void 0, "data-active")}></button>`)}</span><button type="button" class="story__arrow" data-dir="1" aria-label="Next">›</button></div></section>${renderScript($$result, "/home/user/website/src/components/Stories.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/website/src/components/Stories.astro", void 0);
//#endregion
//#region src/components/PhotoMoment.astro
createAstro("https://cckfupm-website.vercel.app");
var $$PhotoMoment = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$PhotoMoment;
	const { photoKey, line, eyebrow } = Astro.props;
	const img = await photoImg(photoKey);
	return renderTemplate`${img && renderTemplate`${maybeRenderHead($$result)}<section class="moment bg-black" data-bg="#0B0B0F"><img class="moment__photo"${addAttribute(img.src, "src")}${addAttribute(img.srcset, "srcset")} sizes="100vw" alt="" width="1800" height="1000" loading="lazy" decoding="async"><div class="moment__text">${eyebrow && renderTemplate`<span class="eyebrow">${eyebrow}</span>`}<p class="h1">${line}</p></div></section>`}`;
}, "/home/user/website/src/components/PhotoMoment.astro", void 0);
//#endregion
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => ""
});
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const settings = await getSettings();
	const site = settings.site;
	const home = settings.home;
	const joinHref = settings.links.join || "/join";
	const ext = (href) => href.startsWith("http") ? {
		target: "_blank",
		rel: "noopener"
	} : {};
	const words = home.heroLine.trim().split(/\s+/);
	const heroHead = words.slice(0, -2).join(" ");
	const heroTail = words.slice(-2).join(" ");
	const stageTabs = ["Moments", "In pictures"];
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Home" }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="screen screen--one bg-white" data-bg="#FFFFFF" data-hero><div class="hero-grid" aria-hidden="true"></div><div class="container screen__inner" data-hero-inner>${renderComponent($$result, "Image", $$Image, {
		"class": "hero__logo",
		"src": logo_color_default,
		"alt": site.name,
		"width": 1100,
		"densities": [1, 1.5],
		"loading": "eager"
	})}<h1 class="h-display hero__title">${heroHead} <span class="hl">${heroTail}</span></h1></div><div class="scroll-hint" aria-hidden="true"><span class="mono">Scroll</span><i></i></div></section><section class="screen screen--two bg-navy" data-bg="#0B1A33" data-stage>${renderComponent($$result, "Collage", $$Collage, {})}<div class="stage__anchor" aria-hidden="true"></div><div class="stage"><div class="container stage__top"><span class="ccmark reveal" aria-label="CC KFUPM"><b>CC</b>${renderComponent($$result, "Image", $$Image, {
		"src": kfupm_logo_default,
		"alt": "KFUPM",
		"height": 76,
		"densities": [1, 2]
	})}</span><p class="stage__line">${site.intro}</p><div class="stage__bar" role="tablist" aria-label="Sections">${stageTabs.map((t, i) => renderTemplate`<button class="stage__tab" role="tab" type="button"${addAttribute(i, "data-tab")}${addAttribute(i === 0 ? "true" : "false", "aria-selected")}><i aria-hidden="true"></i><span>${t}</span></button>`)}</div></div><div class="stage__panels"><div class="stage__panel stage__panel--stories" role="tabpanel" data-panel="0" data-active>${renderComponent($$result, "Stories", $$Stories, {})}</div><div class="stage__panel stage__panel--strip" role="tabpanel" data-panel="1"><div class="container stage__head"><div><span class="eyebrow">In pictures</span><h2 class="h3">Six years of building</h2></div><a class="link-arrow" href="https://x.com/KFUPM_CC" target="_blank" rel="noopener">More on X ↗</a></div>${renderComponent($$result, "PhotoStrip", $$PhotoStrip, {})}</div></div></div><div class="fade fade--to-black" aria-hidden="true"></div></section>${renderComponent($$result, "ShowReel", $$ShowReel, {})}${renderComponent($$result, "PhotoMoment", $$PhotoMoment, {
		"photoKey": home.photoMoment.photoKey,
		"eyebrow": home.photoMoment.eyebrow,
		"line": home.photoMoment.line
	})}<section class="section join bg-black" data-bg="#0B0B0F" id="join"><div class="container join__inner reveal"><h2 class="h1">${home.buildWithUs.title}</h2><p class="lead lead--muted">${home.buildWithUs.text}</p><div class="hero__actions"><a class="btn" data-magnet${addAttribute(joinHref, "href")}${spreadAttributes(ext(joinHref))}>Become a member <span aria-hidden="true">→</span></a><a class="btn btn--ghost" href="/timeline">See what's coming <span aria-hidden="true">→</span></a></div></div></section>${renderComponent($$result, "Partners", $$Partners, {})}` })}${renderScript($$result, "/home/user/website/src/pages/index.astro?astro&type=script&index=0&lang.ts")}${renderScript($$result, "/home/user/website/src/pages/index.astro?astro&type=script&index=1&lang.ts")}`;
}, "/home/user/website/src/pages/index.astro", void 0);
var $$file = "/home/user/website/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
