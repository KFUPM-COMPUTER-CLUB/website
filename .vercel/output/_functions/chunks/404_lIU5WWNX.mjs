import { C as __exportAll } from "./content_DQWivrjm.mjs";
import { D as renderComponent, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { g as createComponent } from "./_astro_assets_BiTtY4hV.mjs";
import { i as renderScript, t as $$BaseLayout } from "./BaseLayout_Bwpc_3c8.mjs";
//#region src/pages/404.astro
var _404_exports = /* @__PURE__ */ __exportAll({
	default: () => $$404,
	file: () => $$file,
	url: () => $$url
});
var $$404 = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": "404",
		"description": "That page does not exist. Play a round of Snake, then head home.",
		"noindex": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="section snake" data-snake><div class="container"><span class="mono">Error 404</span><h1 class="h1 snake__title">404: segfault in the matrix</h1><p class="lead snake__lead">That page was never allocated. While you are here, the snake is.</p><div class="snake__game"><div class="snake__meta"><span class="mono">Score <b data-snake-score>0</b></span><span class="mono">Best <b data-snake-best>0</b></span></div><div class="snake__board" tabindex="0" role="application" aria-label="Snake. Arrow keys or W A S D to steer, Space to start or pause, swipe on touch screens." data-snake-board><canvas class="snake__canvas" width="400" height="400" data-snake-canvas>Snake needs a browser with canvas support.</canvas></div><div class="snake__pad" aria-label="Steer"><button class="btn btn--ghost" type="button" data-dir="up" aria-label="Up">↑</button><button class="btn btn--ghost" type="button" data-dir="left" aria-label="Left">←</button><button class="btn btn--ghost" type="button" data-dir="down" aria-label="Down">↓</button><button class="btn btn--ghost" type="button" data-dir="right" aria-label="Right">→</button></div><p class="visually-hidden" aria-live="polite" data-snake-status></p></div><div class="snake__actions"><a class="btn" href="/">Take me home</a><a class="btn btn--ghost" href="/timeline">See the timeline</a></div></div></section>${renderScript($$result, "/home/user/website/src/pages/404.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "/home/user/website/src/pages/404.astro", void 0);
var $$file = "/home/user/website/src/pages/404.astro";
var $$url = "/404";
//#endregion
//#region \0virtual:astro:page:src/pages/404@_@astro
var page = () => _404_exports;
//#endregion
export { page };
