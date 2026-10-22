import { P as __exportAll, h as getPosts } from "./content_cbSbtds5.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { t as $$BaseLayout } from "./BaseLayout_DNxJM0lr.mjs";
//#region src/pages/blog/index.astro
var blog_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const posts = await getPosts();
	const iso = (d) => d.toISOString().slice(0, 10);
	const mon = (d) => d.toLocaleDateString("en-GB", {
		month: "short",
		timeZone: "UTC"
	});
	const dayYear = (d) => `${d.getUTCDate()}, ${d.getUTCFullYear()}`;
	const tag = Astro.url.searchParams.get("tag");
	const category = Astro.url.searchParams.get("category");
	const shown = posts.filter((p) => (!tag || p.tags.includes(tag)) && (!category || p.category === category));
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": "Blog",
		"description": "Written by members of the KFUPM Computer Club: what we did, what we taught, and what we learned."
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="page-head"><div class="container"><h1 class="ccmark ccmark--text" aria-label="CC Blogs"><b>CC</b><span>Blogs</span></h1><p class="lead">Event recaps, tutorials and what we learned. <a href="/rss.xml">RSS</a></p>${(tag || category) && renderTemplate`<p class="mono">Showing ${tag ? `#${tag}` : category} · <a href="/blog">all posts</a></p>`}</div></section><section class="section"><div class="container"><div class="posts">${shown.map((p) => renderTemplate`<a class="post reveal"${addAttribute(`/blog/${p.slug}`, "href")}${addAttribute(p.dir, "dir")}><time class="post__date"${addAttribute(iso(p.date), "datetime")}><b>${mon(p.date)}</b><span>${dayYear(p.date)}</span></time><div class="post__body"><h2 class="post__title">${p.title}</h2><p class="post__author">${p.authorName}${p.category && ` · ${p.category}`}</p><p class="post__excerpt">${p.excerpt}</p></div></a>`)}${shown.length === 0 && renderTemplate`<p class="lead lead--muted">Nothing here yet.</p>`}</div><p style="margin-top:40px"><a class="btn btn--ghost" href="/me/posts/new">Write a post <span aria-hidden="true">→</span></a></p></div></section>` })}`;
}, "/home/user/website/src/pages/blog/index.astro", void 0);
var $$file = "/home/user/website/src/pages/blog/index.astro";
var $$url = "/blog";
//#endregion
//#region \0virtual:astro:page:src/pages/blog/index@_@astro
var page = () => blog_exports;
//#endregion
export { page };
