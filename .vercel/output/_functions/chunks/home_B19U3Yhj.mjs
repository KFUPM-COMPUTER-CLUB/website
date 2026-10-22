import { D as __exportAll, g as getSettings, w as mediaMap } from "./content_BmaKDf7b.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { t as atLeast } from "./types_DpuWdFt1.mjs";
import { t as $$AdminLayout } from "./AdminLayout_BC24AB2X.mjs";
//#region src/pages/admin/home.astro
var home_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Home,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Home = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Home;
	if (!atLeast(Astro.locals.role, "officer")) return new Response("Officers only", { status: 403 });
	const s = await getSettings();
	const images = [...(await mediaMap()).values()].filter((m) => m.kind === "image");
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Home page",
		"lead": "Everything on the home page that is content. Photos and slides have their own lists."
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="cards" style="margin-bottom:20px"><a class="stat" href="/admin/highlights" style="text-decoration:none"><b>7</b><span>polaroids</span></a><a class="stat" href="/admin/stories" style="text-decoration:none"><b>Moments</b><span>the slides under CC | KFUPM</span></a><a class="stat" href="/admin/strip" style="text-decoration:none"><b>Strip</b><span>photo pool for "In pictures"</span></a><a class="stat" href="/admin/impact" style="text-decoration:none"><b>Impact</b><span>semesters and prizes</span></a></div><form class="form" method="post" action="/api/admin/settings"><input type="hidden" name="key" value="home"><div class="field"><label for="heroLine">Hero line</label><input class="input" id="heroLine" name="heroLine"${addAttribute(s.home.heroLine, "value")} maxlength="120" required><small>The last two words are highlighted in blue.</small></div><h2 class="h3">Headline stats (impact reel)</h2><div class="field"><label for="totalPrizesSar">Total prizes since 2023 (SAR)</label><input class="input" id="totalPrizesSar" name="totalPrizesSar" inputmode="numeric"${addAttribute(s.home.totalPrizesSar, "value")}></div>${[
		0,
		1,
		2
	].map((i) => renderTemplate`<div class="form__row"><div class="field"><label>Stat ${i + 1} value</label><input class="input"${addAttribute(`stat_v_${i}`, "name")}${addAttribute(s.home.stats[i]?.v || "", "value")}></div><div class="field"><label>Unit</label><input class="input"${addAttribute(`stat_u_${i}`, "name")}${addAttribute(s.home.stats[i]?.u || "", "value")}></div><div class="field"><label>Label</label><input class="input"${addAttribute(`stat_l_${i}`, "name")}${addAttribute(s.home.stats[i]?.l || "", "value")}></div></div>`)}<h2 class="h3">Photo moment</h2><div class="field"><label for="moment_photo">Photo</label><input class="input" id="moment_photo" name="moment_photo" list="media-keys"${addAttribute(s.home.photoMoment.photoKey, "value")}><datalist id="media-keys">${images.map((m) => renderTemplate`<option${addAttribute(m.key, "value")}>${m.alt || m.key}</option>`)}</datalist></div><div class="form__row"><div class="field"><label for="moment_eyebrow">Small line</label><input class="input" id="moment_eyebrow" name="moment_eyebrow"${addAttribute(s.home.photoMoment.eyebrow, "value")}></div><div class="field"><label for="moment_line">Big line</label><input class="input" id="moment_line" name="moment_line"${addAttribute(s.home.photoMoment.line, "value")}></div></div><h2 class="h3">Build with us</h2><div class="field"><label for="build_title">Title</label><input class="input" id="build_title" name="build_title"${addAttribute(s.home.buildWithUs.title, "value")}></div><div class="field"><label for="build_text">Text</label><textarea class="textarea" id="build_text" name="build_text" maxlength="240">${s.home.buildWithUs.text}</textarea></div><div class="form__actions"><button class="btn" type="submit">Save</button><a class="btn btn--ghost" href="/" target="_blank" rel="noopener">View home ↗</a></div></form>` })}`;
}, "/home/user/website/src/pages/admin/home.astro", void 0);
var $$file = "/home/user/website/src/pages/admin/home.astro";
var $$url = "/admin/home";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/home@_@astro
var page = () => home_exports;
//#endregion
export { page };
