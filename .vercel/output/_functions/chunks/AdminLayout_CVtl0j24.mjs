import { A as renderSlot, D as renderComponent, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { t as $$BaseLayout } from "./BaseLayout_CmhdDrAC.mjs";
import { t as atLeast } from "./types_DpuWdFt1.mjs";
import { t as $$Subnav } from "./Subnav_zKj5yok_.mjs";
/* empty css              */
//#region src/components/AdminLayout.astro
createAstro("https://cckfupm-website.vercel.app");
var $$AdminLayout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$AdminLayout;
	const { title, lead, live = true } = Astro.props;
	const role = Astro.locals.role;
	const items = [
		{
			href: "/admin",
			label: "Dashboard",
			min: "editor"
		},
		{
			href: "/admin/members",
			label: "Members",
			min: "admin"
		},
		{
			href: "/admin/posts",
			label: "Blog review",
			min: "reviewer"
		},
		{
			href: "/admin/events",
			label: "Events",
			min: "officer"
		},
		{
			href: "/admin/board",
			label: "Community board",
			min: "admin"
		},
		{
			href: "/admin/faq",
			label: "FAQ",
			min: "officer"
		},
		{
			href: "/admin/home",
			label: "Home page",
			min: "officer"
		},
		{
			href: "/admin/partners",
			label: "Partners",
			min: "officer"
		},
		{
			href: "/admin/media",
			label: "Media library",
			min: "officer"
		},
		{
			href: "/admin/solvers",
			label: "Flag solvers",
			min: "admin"
		},
		{
			href: "/admin/settings",
			label: "Settings",
			min: "admin"
		},
		{
			href: "/admin/audit",
			label: "Audit log",
			min: "admin"
		}
	].filter((i) => atLeast(role, i.min)).map(({ href, label }) => ({
		href,
		label
	}));
	const flash = Astro.url.searchParams.get("ok");
	const error = Astro.url.searchParams.get("error");
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": `${title} · Admin`,
		"noindex": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="page-head page-head--compact"><div class="container app__head"><div><span class="eyebrow">Admin</span><h1 class="h1">${title}</h1>${lead && renderTemplate`<p class="lead" style="margin-top:10px">${lead}</p>`}</div>${live && renderTemplate`<span class="live">Saves go live in about a minute</span>`}</div></section><section class="section" style="padding-top:32px"><div class="container app">${renderComponent($$result, "Subnav", $$Subnav, { "items": items })}<div>${flash && renderTemplate`<p class="flash--ok">${flash}</p>`}${error && renderTemplate`<p class="flash--error">${error}</p>`}${renderSlot($$result, $$slots["default"])}</div></div></section>` })}`;
}, "/home/user/website/src/components/AdminLayout.astro", void 0);
//#endregion
export { $$AdminLayout as t };
