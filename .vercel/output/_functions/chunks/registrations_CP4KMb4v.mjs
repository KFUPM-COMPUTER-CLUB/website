import { D as __exportAll, r as fmtRiyadh } from "./content_BmaKDf7b.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { r as serviceClient } from "./supabase_BKsAzIKQ.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { t as atLeast } from "./types_DpuWdFt1.mjs";
import { t as $$AdminLayout } from "./AdminLayout_BC24AB2X.mjs";
import { l as isUuid } from "./api_BNUCaDnj.mjs";
//#region src/pages/admin/events/[id]/registrations.astro
var registrations_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Registrations,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Registrations = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Registrations;
	if (!atLeast(Astro.locals.role, "officer")) return new Response("Officers only", { status: 403 });
	if (!isUuid(Astro.params.id)) return new Response(null, { status: 404 });
	const sb = serviceClient();
	const [{ data: ev }, { data: regs }] = await Promise.all([sb.from("events").select("*").eq("id", Astro.params.id).maybeSingle(), sb.from("registrations").select("id,email_copy,attended,created_at, profiles(name,handle,email,phone,major)").eq("event_id", Astro.params.id).order("created_at")]);
	if (!ev) return new Response(null, { status: 404 });
	const admin = atLeast(Astro.locals.role, "admin");
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": `Registrations · ${ev.title}`,
		"lead": `${fmtRiyadh(new Date(ev.starts_at), {
			weekday: "long",
			day: "numeric",
			month: "long"
		})} · ${regs?.length || 0} reserved${ev.capacity ? ` of ${ev.capacity}` : ""} · registration ${ev.registration_open ? "open" : "closed"}`,
		"live": false
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<p class="form__actions"><a class="btn btn--small btn--ghost"${addAttribute(`/api/admin/events/${ev.id}/registrations`, "href")}>Export CSV</a> <a class="btn btn--small btn--ghost"${addAttribute(`/admin/events/${ev.id}`, "href")}>Edit event</a></p><div class="table-wrap"><table class="table"><thead><tr><th>Member</th>${admin && renderTemplate`<th>Contact</th>`}<th>Registered</th><th>Attended</th><th></th></tr></thead><tbody>${(regs || []).map((r) => renderTemplate`<tr><td>${r.profiles?.name}<br><span class="mono">@${r.profiles?.handle} · ${r.profiles?.major || ""}</span></td>${admin && renderTemplate`<td class="mono">${r.profiles?.email}<br>${r.profiles?.phone}</td>`}<td class="mono">${String(r.created_at).slice(0, 16).replace("T", " ")}${r.email_copy && " · emailed"}</td><td><form method="post"${addAttribute(`/api/admin/events/${ev.id}/registrations`, "action")}><input type="hidden" name="registration_id"${addAttribute(r.id, "value")}><button${addAttribute(`btn btn--tiny ${r.attended ? "" : "btn--ghost"}`, "class")} type="submit">${r.attended ? "✓ Attended" : "Mark attended"}</button></form></td><td><form method="post"${addAttribute(`/api/admin/events/${ev.id}/registrations`, "action")} onsubmit="return confirm('Remove this reservation?')"><input type="hidden" name="registration_id"${addAttribute(r.id, "value")}><input type="hidden" name="_action" value="remove"><button class="btn btn--tiny btn--ghost" type="submit">Remove</button></form></td></tr>`)}${!regs?.length && renderTemplate`<tr><td colspan="5" class="hint">No reservations yet.</td></tr>`}</tbody></table></div>` })}`;
}, "/home/user/website/src/pages/admin/events/[id]/registrations.astro", void 0);
var $$file = "/home/user/website/src/pages/admin/events/[id]/registrations.astro";
var $$url = "/admin/events/[id]/registrations";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/events/[id]/registrations@_@astro
var page = () => registrations_exports;
//#endregion
export { page };
