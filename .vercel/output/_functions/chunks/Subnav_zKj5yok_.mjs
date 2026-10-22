import { I as addAttribute, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
//#region src/components/Subnav.astro
createAstro("https://cckfupm-website.vercel.app");
var $$Subnav = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Subnav;
	const { items } = Astro.props;
	const path = Astro.url.pathname.replace(/\/+$/, "") || "/";
	const current = (href) => path === href || href !== "/me" && href !== "/admin" && path.startsWith(`${href}/`) || href !== "/me" && href !== "/admin" && path === href;
	return renderTemplate`${maybeRenderHead($$result)}<nav class="subnav" aria-label="Section">${items.map((i) => renderTemplate`<a${addAttribute(i.href, "href")}${addAttribute(current(i.href) ? "page" : void 0, "aria-current")}>${i.label}</a>`)}</nav>`;
}, "/home/user/website/src/components/Subnav.astro", void 0);
//#endregion
export { $$Subnav as t };
