import { N as render, P as __exportAll, m as getPost } from "./content_DecWaDc1.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, O as Fragment, P as maybeRenderHead, U as unescapeHTML } from "./sequence_CcNeFUgX.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { i as renderScript, t as $$BaseLayout } from "./BaseLayout_D1GVgmLe.mjs";
//#region src/pages/blog/[id].astro
var _id__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Id,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Id = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Id;
	const post = await getPost(Astro.params.id || "");
	if (!post) return new Response(null, { status: 404 });
	const Content = post.entry ? (await render(post.entry)).Content : null;
	const short = (d) => d.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC"
	});
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": post.title,
		"description": post.excerpt
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="page-head"><div class="container"${addAttribute(post.dir, "dir")}><h1 class="h1">${post.title}</h1><p class="meta" style="margin-top:18px"><span>By ${post.authorHandle ? renderTemplate`<a${addAttribute(`/u/${post.authorHandle}`, "href")}>${post.authorName}</a>` : post.authorName}</span><time${addAttribute(post.date.toISOString().slice(0, 10), "datetime")}>${short(post.date)}</time>${post.category && renderTemplate`<span>${post.category}</span>`}</p></div></section><section class="section"><div class="container"><article class="prose"${addAttribute(post.dir, "dir")} data-prose>${Content ? renderTemplate`${renderComponent($$result, "Content", Content, {})}` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": async ($$result) => renderTemplate`${unescapeHTML(post.html || "")}` })}`}</article>${post.tags.length > 0 && renderTemplate`<p class="tags">${post.tags.map((t) => renderTemplate`<a class="tag"${addAttribute(`/blog?tag=${encodeURIComponent(t)}`, "href")}>#${t}</a>`)}</p>`}<aside class="author-card">${post.authorAvatar ? renderTemplate`<img${addAttribute(post.authorAvatar, "src")} alt="" width="56" height="56" loading="lazy">` : renderTemplate`<span class="author-card__blank" aria-hidden="true">${post.authorName.slice(0, 1)}</span>`}<div><span class="mono">Written by</span><b>${post.authorHandle ? renderTemplate`<a${addAttribute(`/u/${post.authorHandle}`, "href")}>${post.authorName}</a>` : post.authorName}</b>${post.authorHandle && renderTemplate`<a class="link-arrow"${addAttribute(`/u/${post.authorHandle}`, "href")}>Profile →</a>`}</div></aside><p style="margin-top:32px"><a class="link-arrow" href="/blog">← All posts</a></p></div></section>` })}${renderScript($$result, "/home/user/website/src/pages/blog/[id].astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/website/src/pages/blog/[id].astro", void 0);
var $$file = "/home/user/website/src/pages/blog/[id].astro";
var $$url = "/blog/[id]";
//#endregion
//#region \0virtual:astro:page:src/pages/blog/[id]@_@astro
var page = () => _id__exports;
//#endregion
export { page };
