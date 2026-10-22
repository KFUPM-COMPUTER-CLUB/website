import { P as __exportAll } from "./content_DecWaDc1.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { r as serviceClient } from "./supabase_BOJmasnu.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { t as $$AdminLayout } from "./AdminLayout_F876dUNq.mjs";
//#region src/pages/admin/members.astro
var members_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Members,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Members = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Members;
	if (Astro.locals.role !== "admin") return new Response("Admins only", { status: 403 });
	const q = (Astro.url.searchParams.get("q") || "").trim();
	const roleFilter = Astro.url.searchParams.get("role") || "";
	let query = serviceClient().from("profiles").select("id,handle,name,email,phone,major,year,onboarded,suspended,created_at, user_roles(role)").order("created_at", { ascending: false }).limit(200);
	const term = q.replace(/[,()"\\%]/g, "");
	if (term) query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,handle.ilike.%${term}%,phone.ilike.%${term}%`);
	const { data } = await query;
	const rows = (data || []).map((p) => ({
		...p,
		role: p.user_roles?.role || "member"
	})).filter((p) => !roleFilter || p.role === roleFilter);
	const ROLES = [
		"member",
		"editor",
		"reviewer",
		"officer",
		"admin"
	];
	const detail = Astro.url.searchParams.get("id");
	const one = detail ? rows.find((r) => r.id === detail) : null;
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Members",
		"lead": "Search, roles, suspension and export. Phone and email are visible here only.",
		"live": false
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<form class="inline-form" method="get" style="margin-bottom:16px"><input class="input" name="q"${addAttribute(q, "value")} placeholder="name, email, handle or phone" style="max-width:320px"><select class="select" name="role" style="max-width:160px"><option value="">any role</option>${ROLES.map((r) => renderTemplate`<option${addAttribute(r, "value")}${addAttribute(roleFilter === r, "selected")}>${r}</option>`)}</select><button class="btn btn--small" type="submit">Search</button><a class="btn btn--small btn--ghost" href="/api/admin/members">Export CSV</a></form>${one && renderTemplate`<div class="card" style="margin-bottom:16px"><h2 class="h3">${one.name} <span class="mono">@${one.handle}</span></h2><dl class="form__row"><div><dt class="field__label">Email</dt><dd>${one.email}</dd></div><div><dt class="field__label">Phone</dt><dd>${one.phone}</dd></div><div><dt class="field__label">Major · year</dt><dd>${one.major} · ${one.year}</dd></div><div><dt class="field__label">Joined</dt><dd>${String(one.created_at).slice(0, 10)}</dd></div></dl><p><a class="link-arrow"${addAttribute(`/u/${one.handle}`, "href")}>Public profile →</a> · <a class="link-arrow"${addAttribute(`/admin/board/new`, "href")}>Make officer (add to board) →</a></p></div>`}<div class="table-wrap"><table class="table"><thead><tr><th>Member</th><th>Contact</th><th>Role</th><th>Status</th><th></th></tr></thead><tbody>${rows.map((p) => renderTemplate`<tr><td><a${addAttribute(`?q=${encodeURIComponent(q)}&id=${p.id}`, "href")}>${p.name || "(no name)"}</a><br><span class="mono">@${p.handle || "—"} · ${p.major || ""}</span></td><td class="mono">${p.email}<br>${p.phone}</td><td><form class="inline-form" method="post" action="/api/admin/members"><input type="hidden" name="_action" value="role"><input type="hidden" name="user_id"${addAttribute(p.id, "value")}><input type="hidden" name="q"${addAttribute(q, "value")}><select class="select" name="role" style="max-width:130px;padding:6px 30px 6px 10px;font-size:13px">${ROLES.map((r) => renderTemplate`<option${addAttribute(r, "value")}${addAttribute(p.role === r, "selected")}>${r}</option>`)}</select><button class="btn btn--tiny" type="submit">Set</button></form></td><td>${p.suspended ? renderTemplate`<span class="chip chip--changes_requested">suspended</span>` : p.onboarded ? renderTemplate`<span class="chip chip--published">active</span>` : renderTemplate`<span class="chip">not onboarded</span>`}</td><td style="white-space:nowrap"><form method="post" action="/api/admin/members"><input type="hidden" name="_action" value="suspend"><input type="hidden" name="user_id"${addAttribute(p.id, "value")}><input type="hidden" name="q"${addAttribute(q, "value")}><button class="btn btn--tiny btn--ghost" type="submit">${p.suspended ? "Reinstate" : "Suspend"}</button></form><form method="post" action="/api/admin/members" onsubmit="return confirm('Delete this account and all its data?')"><input type="hidden" name="_action" value="delete"><input type="hidden" name="user_id"${addAttribute(p.id, "value")}><input type="hidden" name="q"${addAttribute(q, "value")}><button class="btn btn--tiny btn--danger" type="submit">Delete</button></form></td></tr>`)}${!rows.length && renderTemplate`<tr><td colspan="5" class="hint">No members match.</td></tr>`}</tbody></table></div>` })}`;
}, "/home/user/website/src/pages/admin/members.astro", void 0);
var $$file = "/home/user/website/src/pages/admin/members.astro";
var $$url = "/admin/members";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/members@_@astro
var page = () => members_exports;
//#endregion
export { page };
