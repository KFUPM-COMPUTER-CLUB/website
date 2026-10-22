import { P as __exportAll } from "./content_cbSbtds5.mjs";
import { D as renderComponent, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { g as createComponent } from "./_astro_assets_BiTtY4hV.mjs";
import { t as $$BaseLayout } from "./BaseLayout_BQqFWRil.mjs";
//#region src/pages/about.astro
var about_exports = /* @__PURE__ */ __exportAll({
	default: () => $$About,
	file: () => $$file,
	url: () => $$url
});
var $$About = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": "About",
		"description": "About the KFUPM Computer Club and the team behind this website."
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="page-head"><div class="container"><span class="eyebrow">About</span><h1 class="h-display">The club, the team, and where to find us.</h1><p class="lead">This page is being built. Check back soon.</p></div></section>` })}`;
}, "/home/user/website/src/pages/about.astro", void 0);
var $$file = "/home/user/website/src/pages/about.astro";
var $$url = "/about";
//#endregion
//#region \0virtual:astro:page:src/pages/about@_@astro
var page = () => about_exports;
//#endregion
export { page };
