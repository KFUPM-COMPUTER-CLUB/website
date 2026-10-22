import { P as __exportAll, h as getPosts } from "./content_DecWaDc1.mjs";
//#region src/pages/rss.xml.ts
var rss_xml_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var esc = (s) => s.replace(/[<>&"]/g, (c) => ({
	"<": "&lt;",
	">": "&gt;",
	"&": "&amp;",
	"\"": "&quot;"
})[c]);
var GET = async ({ site }) => {
	const origin = site?.origin || "";
	const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>KFUPM Computer Club</title><link>${origin}/blog</link><description>Written by members of the KFUPM Computer Club.</description>${(await getPosts()).map((p) => `<item><title>${esc(p.title)}</title><link>${origin}/blog/${p.slug}</link><guid>${origin}/blog/${p.slug}</guid><pubDate>${p.date.toUTCString()}</pubDate><description>${esc(p.excerpt)}</description><author>${esc(p.authorName)}</author>${p.category ? `<category>${esc(p.category)}</category>` : ""}</item>`).join("")}</channel></rss>`;
	return new Response(xml, { headers: {
		"Content-Type": "application/rss+xml; charset=utf-8",
		"Cache-Control": "public, max-age=300"
	} });
};
//#endregion
//#region \0virtual:astro:page:src/pages/rss.xml@_@ts
var page = () => rss_xml_exports;
//#endregion
export { page };
