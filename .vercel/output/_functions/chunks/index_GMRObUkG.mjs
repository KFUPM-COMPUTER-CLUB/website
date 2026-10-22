import { D as __exportAll, r as fmtRiyadh } from "./content_BmaKDf7b.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, P as maybeRenderHead } from "./sequence_CcNeFUgX.mjs";
import { r as serviceClient } from "./supabase_BKsAzIKQ.mjs";
import { g as createComponent } from "./_astro_assets_BiTtY4hV.mjs";
import { t as $$AdminLayout } from "./AdminLayout_BC24AB2X.mjs";
import { t as emailQuota } from "./notify_Bx28dzpF.mjs";
//#region src/pages/admin/index.astro
var admin_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const sb = serviceClient();
	const week = (/* @__PURE__ */ new Date(Date.now() - 6048e5)).toISOString();
	const [{ count: newMembers }, { count: members }, { count: pending }, { data: upcoming }, { count: regs }, quota] = await Promise.all([
		sb.from("profiles").select("id", {
			count: "exact",
			head: true
		}).gte("created_at", week).eq("onboarded", true),
		sb.from("profiles").select("id", {
			count: "exact",
			head: true
		}).eq("onboarded", true),
		sb.from("posts").select("id", {
			count: "exact",
			head: true
		}).eq("status", "submitted"),
		sb.from("events").select("id,slug,title,starts_at,registration_open,capacity").gte("starts_at", (/* @__PURE__ */ new Date(Date.now() - 864e5)).toISOString()).order("starts_at").limit(5),
		sb.from("registrations").select("id", {
			count: "exact",
			head: true
		}).gte("created_at", week),
		emailQuota()
	]);
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Dashboard",
		"live": false
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="cards"><div class="stat"><b>${newMembers ?? 0}</b><span>new members this week</span></div><div class="stat"><b>${members ?? 0}</b><span>members</span></div><a class="stat" href="/admin/posts" style="text-decoration:none"><b>${pending ?? 0}</b><span>posts waiting for review</span></a><div class="stat"><b>${regs ?? 0}</b><span>reservations this week</span></div>${quota ? renderTemplate`<div${addAttribute(`stat${quota.warnDaily || quota.warnMonthly ? " stat--warn" : ""}`, "class")}><b>${quota.sentToday}<small style="font-size:14px;color:var(--muted)"> / ${quota.dailyLimit}</small></b><span>emails today · ${quota.sentMonth} / ${quota.monthlyLimit} this month · ${quota.queued} queued${!quota.configured && " · sending off"}</span></div>` : renderTemplate`<div class="stat"><b>—</b><span>email: not configured</span></div>`}</div>${quota && (quota.warnDaily || quota.warnMonthly) && renderTemplate`<p class="flash--error" style="margin-top:16px">Email is at 80% of its ${quota.warnDaily ? "daily" : "monthly"} limit. The rest of the queue rolls to the next day automatically.</p>`}<div class="card" style="margin-top:20px"><h2 class="h3">Upcoming events</h2>${upcoming?.length ? renderTemplate`<div class="table-wrap"><table class="table"><thead><tr><th>Event</th><th>When</th><th>Registration</th><th></th></tr></thead><tbody>${upcoming.map((e) => renderTemplate`<tr><td>${e.title}</td><td class="mono">${fmtRiyadh(new Date(e.starts_at), {
		weekday: "short",
		day: "numeric",
		month: "short"
	})}</td><td>${e.registration_open ? `open${e.capacity ? ` · ${e.capacity} spots` : ""}` : "closed"}</td><td><a class="btn btn--tiny btn--ghost"${addAttribute(`/admin/events/${e.id}`, "href")}>Edit</a> <a class="btn btn--tiny btn--ghost"${addAttribute(`/admin/events/${e.id}/registrations`, "href")}>Registrations</a></td></tr>`)}</tbody></table></div>` : renderTemplate`<p class="hint">Nothing scheduled. <a href="/admin/events/new">Add an event</a>.</p>`}</div>` })}`;
}, "/home/user/website/src/pages/admin/index.astro", void 0);
var $$file = "/home/user/website/src/pages/admin/index.astro";
var $$url = "/admin";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/index@_@astro
var page = () => admin_exports;
//#endregion
export { page };
