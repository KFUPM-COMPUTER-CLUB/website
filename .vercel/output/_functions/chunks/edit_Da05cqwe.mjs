import { P as __exportAll } from "./content_cbSbtds5.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { r as serviceClient } from "./supabase_CcU7CO77.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { i as renderScript } from "./BaseLayout_DNxJM0lr.mjs";
import { t as atLeast } from "./types_DpuWdFt1.mjs";
import { l as isUuid } from "./api_BB02cnYN.mjs";
import { t as $$MeLayout } from "./MeLayout_DNm5twX0.mjs";
//#region src/pages/me/posts/[id]/edit.astro
var edit_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Edit,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Edit = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Edit;
	const { user, role } = Astro.locals;
	if (!isUuid(Astro.params.id)) return new Response(null, { status: 404 });
	const { data: post } = await serviceClient().from("posts").select("*, post_reviews(comment,status_set,created_at)").eq("id", Astro.params.id).maybeSingle();
	if (!post || post.author_id !== user.id && !atLeast(role, "reviewer")) return new Response(null, { status: 404 });
	const locked = post.author_id === user.id && !atLeast(role, "reviewer") && !["draft", "changes_requested"].includes(post.status);
	const categories = [
		"News",
		"Event recap",
		"Tutorial",
		"Project",
		"Experience",
		"Opinion",
		"Announcement"
	];
	const notes = (post.post_reviews || []).sort((a, b) => a.created_at < b.created_at ? 1 : -1);
	return renderTemplate`${renderComponent($$result, "MeLayout", $$MeLayout, { "title": post.title }, { "default": ($$result) => renderTemplate`${locked && renderTemplate`${maybeRenderHead($$result)}<p class="flash--ok">This post is ${post.status.replace("_", " ")}. Editing reopens once a reviewer answers.</p>`}${notes.length > 0 && renderTemplate`<div class="card" style="margin-bottom:16px"><h2 class="h3">Reviewer notes</h2><ul>${notes.map((n) => renderTemplate`<li><span class="mono">${String(n.created_at).slice(0, 10)}</span> · ${n.comment}</li>`)}</ul></div>`}<form class="editor" data-editor${addAttribute(post.id, "data-post-id")}${addAttribute(post.status, "data-status")}${addAttribute(post.dir, "data-dir")} data-upload="/api/upload"${addAttribute(`/api/posts/${post.id}`, "data-save")}${addAttribute(`/me/posts/${post.id}/preview`, "data-preview")} method="post"${addAttribute(`/api/posts/${post.id}/submit`, "action")}><div class="field"><label for="title">Title</label><input class="editor__title input" id="title" name="title"${addAttribute(post.title, "value")} maxlength="140" required${addAttribute(locked, "disabled")}></div><div class="form__row"><div class="field"><label for="excerpt">Summary (shown in the list)</label><input class="input" id="excerpt" name="excerpt"${addAttribute(post.excerpt || "", "value")} maxlength="200"${addAttribute(locked, "disabled")}></div><div class="field"><label for="category">Category</label><select class="select" id="category" name="category"${addAttribute(locked, "disabled")}>${categories.map((c) => renderTemplate`<option${addAttribute(c, "value")}${addAttribute(post.category === c, "selected")}>${c}</option>`)}</select></div></div><div class="field"><label for="tags">Tags</label><input class="input" id="tags" name="tags"${addAttribute((post.tags || []).join(", "), "value")} placeholder="comma separated"${addAttribute(locked, "disabled")}></div><div class="editor__toolbar" data-editor-toolbar></div><div class="editor__surface" data-editor-surface></div><textarea name="content_html" hidden data-editor-html>${post.content_html || ""}</textarea><textarea name="content_json" hidden data-editor-json>${post.content_json ? JSON.stringify(post.content_json) : ""}</textarea><input type="hidden" name="dir"${addAttribute(post.dir, "value")} data-editor-dir><p class="editor__status" data-editor-status aria-live="polite">${locked ? "Read only" : "Saved"}</p><div class="form__actions"><button type="button" class="btn btn--ghost" data-editor-preview>Preview</button>${!locked && renderTemplate`<button type="submit" class="btn" name="action" value="submit">Submit for review <span aria-hidden="true">→</span></button>`}${post.status === "published" && renderTemplate`<span class="live">Edits go live in about a minute</span>`}</div></form>${!locked && renderTemplate`<form method="post"${addAttribute(`/api/posts/${post.id}`, "action")} style="margin-top:24px" onsubmit="return confirm('Delete this post?')"><input type="hidden" name="_method" value="DELETE"><button class="btn btn--tiny btn--danger" type="submit">Delete post</button></form>`}` })}${renderScript($$result, "/home/user/website/src/pages/me/posts/[id]/edit.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/website/src/pages/me/posts/[id]/edit.astro", void 0);
var $$file = "/home/user/website/src/pages/me/posts/[id]/edit.astro";
var $$url = "/me/posts/[id]/edit";
//#endregion
//#region \0virtual:astro:page:src/pages/me/posts/[id]/edit@_@astro
var page = () => edit_exports;
//#endregion
export { page };
