import { D as __exportAll, g as getSettings } from "./content_Dw4BquHy.mjs";
import { D as renderComponent, N as renderTemplate, P as maybeRenderHead, U as unescapeHTML } from "./sequence_CcNeFUgX.mjs";
import { c as serviceReady, o as dbReady, t as publicClient } from "./supabase_BYajXEmb.mjs";
import { g as createComponent } from "./_astro_assets_BiTtY4hV.mjs";
import { i as renderScript, t as $$BaseLayout } from "./BaseLayout_CmhdDrAC.mjs";
//#region src/data/solvers.json
var solvers_default = [];
//#endregion
//#region src/pages/flag.astro
var flag_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Flag,
	file: () => $$file,
	url: () => $$url
});
var $$Flag = createComponent(async ($$result, $$props, $$slots) => {
	const settings = await getSettings();
	const solvers = dbReady() ? ((await publicClient().from("flag_solvers").select("name,handle,created_at").eq("approved", true).order("created_at")).data || []).map((r) => ({
		name: r.name,
		handle: r.handle,
		date: String(r.created_at).slice(0, 10)
	})) : solvers_default;
	const repo = (settings.links.github || "https://github.com/KFUPM-COMPUTER-CLUB/website").replace(/\/+$/, "");
	const cfg = JSON.stringify({
		endpoint: serviceReady() ? "/api/flag/solvers" : "",
		issue: `${repo}/issues/new`
	}).replace(/</g, "\\u003c");
	const fmt = (iso) => {
		const [y, m, d] = String(iso).split("-").map(Number);
		return y && m && d ? new Date(y, m - 1, d).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "short",
			year: "numeric"
		}) : "";
	};
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": "Flag",
		"description": "A door for people who read the console, the source and the terminal.",
		"noindex": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="flag" data-bg="#0B1A33" data-flag><div class="container flag__inner"><span class="eyebrow">Capture the flag</span><div data-flag-gate><h1 class="h1">You found the door.</h1><p class="lead">Paste the flag to open it.</p><form class="flag__form" data-flag-form><label class="flag__label" for="flag-key">Flag</label><input id="flag-key" class="flag__input" type="text" required autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="80" data-flag-input><button class="btn" type="submit">Check</button></form><p class="flag__result" aria-live="polite" data-flag-result></p></div><div data-flag-won hidden><h1 class="h1" tabindex="-1" data-flag-title>Congratulations, solver.</h1><p class="lead">You read the console, the source and the terminal. That is exactly how we like it.</p><h2 class="flag__h">Solvers</h2>${solvers.length ? renderTemplate`<ol class="flag__solvers">${solvers.map((s) => renderTemplate`<li><span class="flag__name">${s.name}</span><span class="flag__meta">${[s.handle, fmt(s.date)].filter(Boolean).join(" · ")}</span></li>`)}</ol>` : renderTemplate`<p class="flag__empty">No solvers yet. Be the first.</p>`}<h2 class="flag__h">Add your name</h2><form class="flag__form flag__form--solver" data-solver-form><div class="flag__field"><label class="flag__label" for="solver-name">Name</label><input id="solver-name" class="flag__input" type="text" required maxlength="40" autocomplete="name" data-solver-name></div><div class="flag__field"><label class="flag__label" for="solver-handle">Handle, optional</label><input id="solver-handle" class="flag__input" type="text" maxlength="40" placeholder="X or GitHub" autocomplete="off" autocapitalize="off" spellcheck="false" data-solver-handle></div><button class="btn" type="submit" data-solver-submit>Add your name</button></form><p class="flag__result" aria-live="polite" data-solver-result></p></div></div><script type="application/json" data-flag-cfg>${unescapeHTML(cfg)}<\/script></section>` })}${renderScript($$result, "/home/user/website/src/pages/flag.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/website/src/pages/flag.astro", void 0);
var $$file = "/home/user/website/src/pages/flag.astro";
var $$url = "/flag";
//#endregion
//#region \0virtual:astro:page:src/pages/flag@_@astro
var page = () => flag_exports;
//#endregion
export { page };
