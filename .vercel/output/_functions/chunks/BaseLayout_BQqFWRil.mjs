import { b as riyadhDate, f as getPartners, g as getSettings, l as getImpact, n as eventEnd, o as getEvents, r as fmtRiyadh, y as getUpcomingEvents } from "./content_cbSbtds5.mjs";
import { A as renderSlot, D as renderComponent, F as renderHead, I as addAttribute, L as createRenderInstruction, N as renderTemplate, O as Fragment, P as maybeRenderHead, U as unescapeHTML } from "./sequence_CcNeFUgX.mjs";
import { g as createComponent, h as createAstro, o as createImageAsset, r as $$Image } from "./_astro_assets_BiTtY4hV.mjs";
//#region node_modules/astro/dist/runtime/server/render/script.js
/**
* Relies on the `renderScript: true` compiler option
* @experimental
*/
async function renderScript(result, id) {
	const inlined = result.inlinedScripts.get(id);
	let content = "";
	if (inlined != null) {
		if (inlined) content = `<script type="module">${inlined}<\/script>`;
	} else {
		const resolved = await result.resolve(id);
		content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"><\/script>`;
	}
	return createRenderInstruction({
		type: "script",
		id,
		content
	});
}
//#endregion
//#region src/components/Terminal.astro
var $$Terminal = createComponent(async ($$result, $$props, $$slots) => {
	const [events, impact, partners, settings] = await Promise.all([
		getEvents(),
		getImpact(),
		getPartners(),
		getSettings()
	]);
	const data = {
		events: events.map((e) => ({
			id: e.slug,
			title: e.title,
			date: riyadhDate(e.start),
			endDate: e.end ? riyadhDate(e.end) : "",
			time: e.allDay ? "" : fmtRiyadh(e.start, {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false
			}),
			location: e.location
		})),
		impact: {
			semesters: impact.map((s) => ({
				term: s.term,
				total_sar: s.totalSar,
				min: s.isMinimum
			})),
			total: impact.reduce((n, s) => n + (s.totalSar || 0), 0),
			plus: impact.some((s) => s.isMinimum)
		},
		partners: {
			companies: partners.filter((p) => p.kind === "company").map((p) => p.name),
			friends: partners.filter((p) => p.kind === "kfupm_unit" || p.kind === "student_club").map((p) => p.name)
		},
		site: {
			name: settings.site.name,
			intro: settings.site.intro,
			description: settings.site.description,
			join: settings.links.join || "/join"
		}
	};
	const json = JSON.stringify(data).replace(/</g, "\\u003c");
	return renderTemplate`${maybeRenderHead($$result)}<div class="terminal" role="dialog" aria-label="Terminal" hidden data-terminal><div class="terminal__bar"><span class="terminal__title">guest@cckfupm — terminal</span><button type="button" class="terminal__close" data-term-close aria-label="Close terminal">esc</button></div><div class="terminal__out" role="log" aria-live="polite" data-term-out></div><form class="terminal__line" data-term-form><label class="terminal__prompt" for="term-input">guest@cckfupm:~$</label><span class="terminal__field"><input id="term-input" class="terminal__input" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="off" enterkeyhint="send" data-term-input><span class="terminal__mirror" aria-hidden="true" data-term-mirror></span><span class="terminal__cursor" aria-hidden="true" data-term-cursor></span></span></form></div><script type="application/json" data-term-data>${unescapeHTML(json)}<\/script>${renderScript($$result, "/home/user/website/src/components/Terminal.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/website/src/components/Terminal.astro", void 0);
//#endregion
//#region src/assets/brand/logo-color-sm.png
var logo_color_sm_default = createImageAsset({
	"src": "/_astro/logo-color-sm.BgVzBSVQ.png",
	"width": 660,
	"height": 355,
	"format": "png"
}, "/home/user/website/src/assets/brand/logo-color-sm.png", false);
//#endregion
//#region src/assets/brand/logo-color-ondark-sm.png
var logo_color_ondark_sm_default = createImageAsset({
	"src": "/_astro/logo-color-ondark-sm.CuE4jPC2.png",
	"width": 660,
	"height": 355,
	"format": "png"
}, "/home/user/website/src/assets/brand/logo-color-ondark-sm.png", false);
//#endregion
//#region src/components/NextEvent.astro
createAstro("https://cckfupm-website.vercel.app");
var $$NextEvent = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$NextEvent;
	const { variant = "bar" } = Astro.props;
	const list = (await getUpcomingEvents()).slice(0, 5).map((e) => ({
		id: e.slug,
		t: e.title,
		s: e.start.getTime(),
		e: eventEnd(e).getTime()
	}));
	return renderTemplate`${list.length > 0 && renderTemplate`${maybeRenderHead($$result)}<a${addAttribute(`next-pill next-pill--${variant}`, "class")}${addAttribute(JSON.stringify(list), "data-next")} hidden href="/timeline"><i class="next-pill__dot" aria-hidden="true"></i><span class="next-pill__label">Next:</span><span class="next-pill__title"></span><span class="next-pill__when"></span></a>`}${renderScript($$result, "/home/user/website/src/components/NextEvent.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/website/src/components/NextEvent.astro", void 0);
//#endregion
//#region src/components/Header.astro
createAstro("https://cckfupm-website.vercel.app");
var $$Header = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Header;
	const settings = await getSettings();
	const site = {
		name: settings.site.name,
		links: settings.links
	};
	const links = [
		{
			href: "/timeline",
			label: "Timeline"
		},
		{
			href: "/blog",
			label: "Blog"
		},
		{
			href: "/community",
			label: "Community"
		},
		{
			href: "/faq",
			label: "FAQ"
		}
	];
	const joinHref = site.links.join || "/join";
	const external = joinHref.startsWith("http");
	const path = Astro.url.pathname.replace(/\/+$/, "") || "/";
	const isCurrent = (href) => path === href || path.startsWith(`${href}/`);
	return renderTemplate`${maybeRenderHead($$result)}<header class="site-header"><div class="container site-header__inner"><div class="site-header__brand"><a class="site-logo" href="/"${addAttribute(`${site.name} home`, "aria-label")}${addAttribute(path === "/" ? "page" : void 0, "aria-current")}><span class="site-logo__stack">${renderComponent($$result, "Image", $$Image, {
		"class": "site-logo__icon",
		"src": logo_color_sm_default,
		"alt": "",
		"width": 64,
		"densities": [
			1,
			2,
			3
		]
	})}${renderComponent($$result, "Image", $$Image, {
		"class": "site-logo__icon site-logo__icon--dark",
		"src": logo_color_ondark_sm_default,
		"alt": "",
		"width": 64,
		"densities": [
			1,
			2,
			3
		]
	})}</span><span class="site-logo__words"><span lang="ar" dir="rtl">نادي الحاسب الآلي</span><b>Computer Club</b></span></a>${renderComponent($$result, "NextEvent", $$NextEvent, { "variant": "bar" })}</div><div class="site-header__end"><nav id="site-nav" class="site-nav" aria-label="Main">${renderComponent($$result, "NextEvent", $$NextEvent, { "variant": "menu" })}${links.map((l) => renderTemplate`<a${addAttribute(l.href, "href")}${addAttribute(isCurrent(l.href) ? "page" : void 0, "aria-current")}>${l.label}</a>`)}<a class="btn btn--small" data-magnet${addAttribute(joinHref, "href")}${addAttribute(external ? "_blank" : void 0, "target")}${addAttribute(external ? "noopener" : void 0, "rel")} data-join>Join <span aria-hidden="true">→</span></a></nav><div class="site-header__tools"><button type="button" class="term-open" data-term-open aria-label="Open terminal" title="Terminal">&gt;_</button><button class="nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="Open menu">Menu</button></div></div></div></header>${renderScript($$result, "/home/user/website/src/components/Header.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/website/src/components/Header.astro", void 0);
//#endregion
//#region src/components/CopyEmail.astro
createAstro("https://cckfupm-website.vercel.app");
var $$CopyEmail = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$CopyEmail;
	const { email, label } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<button type="button" class="copy"${addAttribute(email, "data-copy")}${addAttribute(label ? `${label}: copy ${email}` : `Copy ${email}`, "aria-label")}><span class="copy__text">${email}</span><span class="copy__tip" aria-hidden="true">Copied ✓</span><span class="visually-hidden" aria-live="polite" data-copy-status></span></button>${renderScript($$result, "/home/user/website/src/components/CopyEmail.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/website/src/components/CopyEmail.astro", void 0);
//#endregion
//#region src/components/Footer.astro
createAstro("https://cckfupm-website.vercel.app");
var $$Footer = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Footer;
	const settings = await getSettings();
	const site = {
		name: settings.site.name,
		email: settings.site.email,
		links: settings.links,
		madeBy: settings.madeBy,
		contributorsUrl: settings.contributorsUrl
	};
	const isReal = (value) => typeof value === "string" && value.length > 0 && !value.includes("REPLACE");
	const follow = Object.entries({
		instagram: {
			label: "Instagram",
			d: "M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.3-3.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"
		},
		x: {
			label: "X",
			d: "M17.5 3h3.1l-6.8 7.8L21.8 21h-6.3l-4.9-6.4L5 21H1.9l7.3-8.3L1.5 3h6.4l4.4 5.9L17.5 3zm-1.1 16.2h1.7L6.9 4.7H5.1l11.3 14.5z"
		},
		linkedin: {
			label: "LinkedIn",
			d: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21h-4V9z"
		},
		github: {
			label: "GitHub",
			d: "M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.7-4.6 4.9.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z"
		},
		discord: {
			label: "Discord",
			d: "M19.3 5.3A16.5 16.5 0 0 0 15.2 4l-.5 1a15 15 0 0 0-5.4 0l-.5-1a16.5 16.5 0 0 0-4.1 1.3C2 9.2 1.3 13 1.6 16.7A16.6 16.6 0 0 0 6.7 19l1-1.6a10.8 10.8 0 0 1-1.7-.8l.4-.3a11.8 11.8 0 0 0 11.2 0l.4.3-1.7.8 1 1.6a16.6 16.6 0 0 0 5.1-2.3c.4-4.3-.7-8-2.9-11.4zM8.7 14.4c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"
		},
		whatsapp: {
			label: "WhatsApp",
			d: "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.3-2.9c-.2-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.6-.3z"
		}
	}).filter(([key]) => key !== "discord" && key !== "whatsapp" && isReal(site.links[key])).map(([key, i]) => ({
		href: site.links[key],
		...i
	}));
	const makers = site.madeBy ?? [];
	const path = Astro.url.pathname.replace(/\/+$/, "") || "/";
	const showCredit = !/^\/(blog|timeline|faq)(\/|$)/.test(path);
	const contributorsUrl = site.contributorsUrl || "https://github.com/KFUPM-COMPUTER-CLUB/website";
	const year = (/* @__PURE__ */ new Date()).getFullYear();
	return renderTemplate`${maybeRenderHead($$result)}<footer class="site-footer"><div class="container"><div class="site-footer__row"><a class="site-logo" href="/"${addAttribute(`${site.name} home`, "aria-label")}><span class="site-logo__stack">${renderComponent($$result, "Image", $$Image, {
		"class": "site-logo__icon",
		"src": logo_color_sm_default,
		"alt": "",
		"width": 64,
		"densities": [
			1,
			2,
			3
		]
	})}${renderComponent($$result, "Image", $$Image, {
		"class": "site-logo__icon site-logo__icon--dark",
		"src": logo_color_ondark_sm_default,
		"alt": "",
		"width": 64,
		"densities": [
			1,
			2,
			3
		]
	})}</span><span class="site-logo__words"><span lang="ar" dir="rtl">نادي الحاسب الآلي</span><b>Computer Club</b></span></a>${showCredit && makers.length > 0 && renderTemplate`<div class="made-by"><span class="made-by__label">Made by</span><p class="made-by__names">${makers.map((m, i) => renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${i > 0 && renderTemplate`<span class="made-by__dot" aria-hidden="true">·</span>`}${m.github ? renderTemplate`<a${addAttribute(`https://github.com/${m.github}`, "href")} target="_blank" rel="noopener">${m.name}</a>` : renderTemplate`<b>${m.name}</b>`}` })}`)}</p><a class="made-by__more"${addAttribute(contributorsUrl, "href")} target="_blank" rel="noopener">All contributors <span aria-hidden="true">→</span></a></div>`}<ul class="site-footer__social" aria-label="Follow the club">${follow.map((l) => renderTemplate`<li><a${addAttribute(l.href, "href")} target="_blank" rel="noopener"${addAttribute(l.label, "aria-label")}${addAttribute(l.label, "title")}><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor"${addAttribute(l.d, "d")}></path></svg></a></li>`)}</ul></div><div class="site-footer__bottom"><p>© ${year} ${site.name}. A student club at KFUPM.</p>${isReal(site.email) && renderTemplate`<p>${renderComponent($$result, "CopyEmail", $$CopyEmail, {
		"email": site.email,
		"label": "Club email"
	})}</p>`}<p><a href="https://github.com/KFUPM-COMPUTER-CLUB/website" target="_blank" rel="noopener">Source on GitHub</a></p></div></div></footer>`;
}, "/home/user/website/src/components/Footer.astro", void 0);
//#endregion
//#region node_modules/astro/components/ClientRouter.astro
createAstro("https://cckfupm-website.vercel.app");
var $$ClientRouter = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$ClientRouter;
	const { fallback = "animate" } = Astro.props;
	return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>${renderScript($$result, "/home/user/website/node_modules/astro/components/ClientRouter.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/website/node_modules/astro/components/ClientRouter.astro", void 0);
//#endregion
//#region src/layouts/BaseLayout.astro
createAstro("https://cckfupm-website.vercel.app");
var $$BaseLayout = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$BaseLayout;
	const settings = await getSettings();
	const site = settings.site;
	const { title, description = site.description, noindex = false } = Astro.props;
	return renderTemplate`<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${`${title} · ${site.name}`}</title><meta name="description"${addAttribute(description, "content")}>${noindex && renderTemplate`<meta name="robots" content="noindex, nofollow">`}<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/png" sizes="32x32" href="/favicon.png"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><meta name="theme-color" content="#0B0B0F"><meta name="site-root" content="/">${renderComponent($$result, "ClientRouter", $$ClientRouter, { "fallback": "animate" })}<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mona+Sans:wdth,wght@75..125,200..900&family=Hubot+Sans:wght@300..700&family=JetBrains+Mono:wght@400..700&family=Readex+Pro:wght@300..600&display=swap">${renderHead($$result)}</head><body><div class="scroll-progress" aria-hidden="true"><i></i></div><a class="skip-link" href="#main">Skip to content</a>${renderComponent($$result, "Header", $$Header, {})}${settings.banner && renderTemplate`<div class="banner" role="status"><div class="container">${settings.banner.url ? renderTemplate`<a${addAttribute(settings.banner.url, "href")}>${settings.banner.text}</a>` : settings.banner.text}</div></div>`}<main id="main" class="site-main bg-black" data-bg="#0B0B0F">${renderSlot($$result, $$slots["default"])}</main>${renderComponent($$result, "Footer", $$Footer, {})}${renderScript($$result, "/home/user/website/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts")}${renderComponent($$result, "Terminal", $$Terminal, {})}<!-- clue 2/3: the terminal remembers files it does not show. Press \` and ask ls the way you would ask for hidden ones. --></body></html>`;
}, "/home/user/website/src/layouts/BaseLayout.astro", void 0);
//#endregion
export { renderScript as i, $$CopyEmail as n, logo_color_ondark_sm_default as r, $$BaseLayout as t };
