import { A as renderSlot, D as renderComponent, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { t as $$BaseLayout } from "./BaseLayout_CmhdDrAC.mjs";
import { t as $$Subnav } from "./Subnav_zKj5yok_.mjs";
/* empty css              */
//#region src/components/MeLayout.astro
createAstro("https://cckfupm-website.vercel.app");
var $$MeLayout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$MeLayout;
	const { title, lead } = Astro.props;
	const items = [
		{
			href: "/me",
			label: "Overview"
		},
		{
			href: "/me/profile",
			label: "Profile"
		},
		{
			href: "/me/posts",
			label: "My posts"
		},
		{
			href: "/me/registrations",
			label: "Events"
		}
	];
	const flash = Astro.url.searchParams.get("ok");
	const error = Astro.url.searchParams.get("error");
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": title,
		"noindex": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="page-head page-head--compact"><div class="container"><span class="eyebrow">My account</span><h1 class="h1">${title}</h1>${lead && renderTemplate`<p class="lead">${lead}</p>`}</div></section><section class="section"><div class="container app">${renderComponent($$result, "Subnav", $$Subnav, { "items": items })}<div>${flash && renderTemplate`<p class="flash--ok">${flash}</p>`}${error && renderTemplate`<p class="flash--error">${error}</p>`}${renderSlot($$result, $$slots["default"])}</div></div></section>` })}`;
}, "/home/user/website/src/components/MeLayout.astro", void 0);
//#endregion
export { $$MeLayout as t };
