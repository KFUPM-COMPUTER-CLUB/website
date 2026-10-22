import { D as __exportAll, t as bust } from "./content_Dw4BquHy.mjs";
import { l as supabaseUrl, r as serviceClient } from "./supabase_BYajXEmb.mjs";
import { t as atLeast } from "./types_DpuWdFt1.mjs";
import { a as handle, f as ok, h as requireUser, i as guardRate, l as isUuid, n as audit, p as readBody, t as ApiError, v as str } from "./api_L-wuzLIp.mjs";
import sanitizeHtml from "sanitize-html";
//#region src/lib/sanitize.ts
var storage = supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/` : null;
var isStorageUrl = (u) => !!storage && u.startsWith(storage);
function sanitizePost(html) {
	return sanitizeHtml(html || "", {
		allowedTags: [
			"p",
			"br",
			"h2",
			"h3",
			"h4",
			"strong",
			"b",
			"em",
			"i",
			"s",
			"u",
			"code",
			"pre",
			"blockquote",
			"ul",
			"ol",
			"li",
			"a",
			"img",
			"figure",
			"figcaption",
			"table",
			"thead",
			"tbody",
			"tr",
			"th",
			"td",
			"hr",
			"iframe",
			"small",
			"span"
		],
		allowedAttributes: {
			a: [
				"href",
				"title",
				"target",
				"rel",
				"class",
				"download"
			],
			img: [
				"src",
				"alt",
				"width",
				"height",
				"loading"
			],
			code: ["class"],
			pre: ["class"],
			span: ["class"],
			iframe: [
				"src",
				"title",
				"class"
			],
			figure: ["class", "data-pdf"],
			td: ["colspan", "rowspan"],
			th: ["colspan", "rowspan"],
			"*": ["dir"]
		},
		allowedSchemes: [
			"http",
			"https",
			"mailto"
		],
		allowedSchemesByTag: {
			img: ["https"],
			iframe: ["https"]
		},
		allowedClasses: {
			code: [/^language-/],
			pre: [/^language-/],
			a: ["pdf-card"],
			figure: ["pdf"],
			iframe: ["pdf-frame"],
			span: [/^hljs-/]
		},
		exclusiveFilter: (frame) => frame.tag === "iframe" && !isStorageUrl(frame.attribs.src || "") || frame.tag === "img" && !frame.attribs.alt,
		transformTags: { a: (tag, attribs) => {
			const href = attribs.href || "";
			const external = /^https?:/i.test(href);
			return {
				tagName: "a",
				attribs: {
					...attribs,
					...external ? {
						target: "_blank",
						rel: "noopener"
					} : {}
				}
			};
		} },
		disallowedTagsMode: "discard"
	});
}
var plainText = (html, max = 200) => sanitizeHtml(html || "", {
	allowedTags: [],
	allowedAttributes: {}
}).replace(/\s+/g, " ").trim().slice(0, max);
//#endregion
//#region src/pages/api/posts/[id]/index.ts
var _id__exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	PATCH: () => PATCH,
	POST: () => POST,
	prerender: () => false
});
var CATEGORIES = [
	"News",
	"Event recap",
	"Tutorial",
	"Project",
	"Experience",
	"Opinion",
	"Announcement"
];
async function load(ctx) {
	const user = requireUser(ctx);
	if (!isUuid(ctx.params.id)) throw new ApiError("Not found.", 404);
	const { data: post } = await serviceClient().from("posts").select("*").eq("id", ctx.params.id).maybeSingle();
	if (!post) throw new ApiError("Not found.", 404);
	const own = post.author_id === user.id;
	const reviewer = atLeast(ctx.locals.role, "reviewer");
	if (!own && !reviewer) throw new ApiError("Not your post.", 403);
	return {
		user,
		post,
		own,
		reviewer
	};
}
var PATCH = handle(async (ctx) => {
	const { user, post, own, reviewer } = await load(ctx);
	if (own && !reviewer && !["draft", "changes_requested"].includes(post.status)) throw new ApiError("This post is under review or published; ask a reviewer to reopen it.", 409);
	await guardRate(ctx.request, "post-save", 120, 60);
	const b = await readBody(ctx.request);
	const patch = {};
	if ("title" in b) patch.title = str(b.title, 140) || "Untitled";
	if ("excerpt" in b) patch.excerpt = str(b.excerpt, 200);
	if ("category" in b) patch.category = CATEGORIES.includes(String(b.category)) ? b.category : "News";
	if ("tags" in b) patch.tags = (Array.isArray(b.tags) ? b.tags : String(b.tags || "").split(",")).map((t) => str(t, 30).toLowerCase().replace(/^#/, "")).filter(Boolean).slice(0, 8);
	if ("dir" in b) patch.dir = b.dir === "rtl" ? "rtl" : "ltr";
	if ("content_html" in b) {
		patch.content_html = sanitizePost(String(b.content_html || ""));
		if (!("excerpt" in b) || !patch.excerpt) patch.excerpt = post.excerpt || plainText(patch.content_html, 180);
	}
	if ("content_json" in b) patch.content_json = typeof b.content_json === "string" ? (() => {
		try {
			return JSON.parse(b.content_json);
		} catch {
			return null;
		}
	})() : b.content_json;
	const { data, error } = await serviceClient().from("posts").update(patch).eq("id", post.id).select("id,title,excerpt,status,updated_at").single();
	if (error) throw new ApiError(error.message, 500);
	if (post.status === "published") {
		bust();
		await audit(user.id, "update", "posts", post.id, {
			title: post.title,
			content_html: post.content_html
		}, { title: data.title });
	}
	return ok({ post: data });
});
var DELETE = handle(async (ctx) => {
	const { user, post, own, reviewer } = await load(ctx);
	if (!(atLeast(ctx.locals.role, "admin") || own && ["draft", "changes_requested"].includes(post.status))) throw new ApiError("Only drafts can be deleted.", 403);
	await serviceClient().from("posts").delete().eq("id", post.id);
	await audit(user.id, "delete", "posts", post.id, post, null);
	if (post.status === "published") bust();
	return ok();
});
var POST = async (ctx) => String((await ctx.request.clone().formData().catch(() => new FormData())).get("_method") || "").toUpperCase() === "DELETE" ? DELETE(ctx) : PATCH(ctx);
//#endregion
//#region \0virtual:astro:page:src/pages/api/posts/[id]/index@_@ts
var page = () => _id__exports;
//#endregion
export { page };
