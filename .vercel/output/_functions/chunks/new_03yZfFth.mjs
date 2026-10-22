import { D as __exportAll } from "./content_BmaKDf7b.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { g as createComponent } from "./_astro_assets_BiTtY4hV.mjs";
import { t as $$MeLayout } from "./MeLayout_CzP4ugyj.mjs";
//#region src/pages/me/posts/new.astro
var new_exports = /* @__PURE__ */ __exportAll({
	default: () => $$New,
	file: () => $$file,
	url: () => $$url
});
var $$New = createComponent(($$result, $$props, $$slots) => {
	const categories = [
		"News",
		"Event recap",
		"Tutorial",
		"Project",
		"Experience",
		"Opinion",
		"Announcement"
	];
	return renderTemplate`${renderComponent($$result, "MeLayout", $$MeLayout, {
		"title": "New post",
		"lead": "Give it a title; you can change everything in the editor."
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<form class="form" method="post" action="/api/posts"><div class="field"><label for="title">Title</label><input class="input" id="title" name="title" required maxlength="140" autofocus></div><div class="form__row"><div class="field"><label for="category">Category</label><select class="select" id="category" name="category">${categories.map((c) => renderTemplate`<option${addAttribute(c, "value")}>${c}</option>`)}</select></div><div class="field"><label for="dir">Language direction</label><select class="select" id="dir" name="dir"><option value="ltr">English (left to right)</option><option value="rtl">العربية (right to left)</option></select></div></div><div class="form__actions"><button class="btn" type="submit">Open the editor <span aria-hidden="true">→</span></button></div></form>` })}`;
}, "/home/user/website/src/pages/me/posts/new.astro", void 0);
var $$file = "/home/user/website/src/pages/me/posts/new.astro";
var $$url = "/me/posts/new";
//#endregion
//#region \0virtual:astro:page:src/pages/me/posts/new@_@astro
var page = () => new_exports;
//#endregion
export { page };
