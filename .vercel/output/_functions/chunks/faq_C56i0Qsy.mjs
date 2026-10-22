import { D as __exportAll, g as getSettings, s as getFaq } from "./content_BmaKDf7b.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { g as createComponent } from "./_astro_assets_BiTtY4hV.mjs";
import { i as renderScript, n as $$CopyEmail, t as $$BaseLayout } from "./BaseLayout_CR5R09AB.mjs";
//#region src/pages/faq.astro
var faq_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Faq,
	file: () => $$file,
	url: () => $$url
});
var $$Faq = createComponent(async ($$result, $$props, $$slots) => {
	const [faq, settings] = await Promise.all([getFaq(), getSettings()]);
	const email = settings.site.email;
	const hasArabic = faq.some((f) => f.qAr && f.aAr);
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": "Questions",
		"description": "Common questions about joining and taking part in the KFUPM Computer Club."
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="page-head"><div class="container"><span class="eyebrow">Frequently asked questions</span><h1 class="h-display">Questions people ask us.</h1><p class="lead">Short answers. If yours is not here, ask on X or at any event.</p>${hasArabic && renderTemplate`<p class="faq__lang"><button type="button" class="btn btn--ghost btn--small" data-faq-lang="en" aria-pressed="true">English</button> <button type="button" class="btn btn--ghost btn--small" data-faq-lang="ar" aria-pressed="false">العربية</button></p>`}</div></section><section class="section"><div class="container" style="max-width:860px"><div class="faq reveal" data-faq>${faq.map((f, i) => renderTemplate`<details${addAttribute(i === 0, "open")}><summary><span data-lang="en">${f.q}</span>${f.qAr && renderTemplate`<span data-lang="ar" lang="ar" dir="rtl" hidden>${f.qAr}</span>`}</summary><div class="faq__a"><p data-lang="en">${f.a}</p>${f.aAr && renderTemplate`<p data-lang="ar" lang="ar" dir="rtl" hidden>${f.aAr}</p>`}</div></details>`)}</div><div class="hero__actions" style="margin-top:40px"><a class="btn" href="/join">Join the club <span aria-hidden="true">→</span></a>${email && renderTemplate`<a class="btn btn--ghost"${addAttribute(`mailto:${email}`, "href")}>Email us</a>`}${email && renderTemplate`${renderComponent($$result, "CopyEmail", $$CopyEmail, {
		"email": email,
		"label": "Club email"
	})}`}</div></div></section>` })}${renderScript($$result, "/home/user/website/src/pages/faq.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/website/src/pages/faq.astro", void 0);
var $$file = "/home/user/website/src/pages/faq.astro";
var $$url = "/faq";
//#endregion
//#region \0virtual:astro:page:src/pages/faq@_@astro
var page = () => faq_exports;
//#endregion
export { page };
