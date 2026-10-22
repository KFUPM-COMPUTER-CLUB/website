import { P as __exportAll, b as riyadhDate, p as getPastEvents, r as fmtRiyadh, x as termOf, y as getUpcomingEvents } from "./content_DecWaDc1.mjs";
import { D as renderComponent, I as addAttribute, N as renderTemplate, P as maybeRenderHead, S as renderTransition } from "./sequence_CcNeFUgX.mjs";
import { s as dbReady, t as publicClient } from "./supabase_BOJmasnu.mjs";
import { g as createComponent, h as createAstro } from "./_astro_assets_BiTtY4hV.mjs";
import { i as renderScript, t as $$BaseLayout } from "./BaseLayout_D1GVgmLe.mjs";
import { r as outlookUrl, t as googleUrl } from "./calendar_DZdNxh2k.mjs";
/* empty css                          */
//#region src/pages/timeline.astro
var timeline_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Timeline,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://cckfupm-website.vercel.app");
var $$Timeline = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Timeline;
	const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()]);
	const site = Astro.site?.origin || "";
	const counts = /* @__PURE__ */ new Map();
	const open = upcoming.filter((e) => e.registrationOpen);
	if (dbReady() && open.length) {
		const { data } = await publicClient().rpc("registration_counts", { p_event_ids: open.map((e) => e.id) });
		for (const r of data || []) counts.set(r.event_id, Number(r.count) || 0);
	}
	const groups = (list) => {
		const out = [];
		for (const e of list) {
			const t = termOf(e.start);
			const g = out.find((x) => x.term === t);
			g ? g.items.push(e) : out.push({
				term: t,
				items: [e]
			});
		}
		return out;
	};
	const day = (d) => fmtRiyadh(d, {
		month: "short",
		day: "numeric"
	});
	const when = (e) => (e.end && riyadhDate(e.end) !== riyadhDate(e.start) ? `${day(e.start)} – ${day(e.end)}` : day(e.start)) + (e.allDay ? "" : ` · ${fmtRiyadh(e.start, {
		hour: "numeric",
		minute: "2-digit"
	})}`);
	const calData = JSON.stringify([...upcoming, ...past].map((e) => ({
		d: riyadhDate(e.start),
		e: e.end ? riyadhDate(e.end) : void 0,
		t: e.title,
		id: e.slug
	})));
	const seen = /* @__PURE__ */ new Set();
	const morph = (key) => {
		if (!key) return void 0;
		const n = `photo-${key.replace(/\.[a-z]+$/i, "")}`;
		if (seen.has(n)) return void 0;
		seen.add(n);
		return n;
	};
	const spots = (e) => e.capacity ? `${Math.min(counts.get(e.id) || 0, e.capacity)} of ${e.capacity} spots taken` : `${counts.get(e.id) || 0} going`;
	const full = (e) => !!e.capacity && (counts.get(e.id) || 0) >= e.capacity;
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": "Timeline",
		"description": "Every KFUPM Computer Club event, upcoming and past, with one-click calendar links."
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="page-head page-head--compact"><div class="container"><h1 class="ccmark ccmark--text" aria-label="CC Events"><b>CC</b><span>Events</span></h1><p class="lead">What's coming and what happened. One click puts an event in your calendar.</p></div></section><section class="section events"><div class="container events__grid"><div class="events__list">${[{
		title: "Upcoming",
		list: upcoming,
		up: true
	}, {
		title: "Past",
		list: past,
		up: false
	}].map((sec) => renderTemplate`<div class="events__section" data-section><h2 class="h2">${sec.title}</h2>${sec.list.length === 0 && renderTemplate`<p class="lead lead--muted">Nothing scheduled yet. Follow the club on X for the next announcement.</p>`}${groups(sec.list).map((g) => renderTemplate`<div class="term" data-term><div class="term__label mono"><i aria-hidden="true"></i>${g.term}</div>${g.items.map((e) => renderTemplate`<article class="ev"${addAttribute(`ev-${e.slug}`, "id")}${addAttribute(e.type, "data-type")}>${e.cover ? e.xUrl ? renderTemplate`<a${addAttribute(renderTransition($$result, "5bbswalt", "", morph(e.coverKey)), "data-astro-transition-scope")} class="ev__thumb-link"${addAttribute(e.xUrl, "href")} target="_blank" rel="noopener"${addAttribute(`${e.title} on X`, "aria-label")}><img class="ev__thumb"${addAttribute(e.cover.src, "src")}${addAttribute(e.cover.srcset, "srcset")} sizes="168px" alt="" width="168" height="168" loading="lazy" decoding="async"></a>` : renderTemplate`<img class="ev__thumb"${addAttribute(e.cover.src, "src")} alt="" width="168" height="168" loading="lazy">` : renderTemplate`<span class="ev__thumb ev__thumb--empty" aria-hidden="true">CC</span>`}<div class="ev__body"><p class="ev__when mono"><time${addAttribute(e.start.toISOString(), "datetime")}>${when(e)}</time></p><h3 class="ev__title">${e.xUrl ? renderTemplate`<a${addAttribute(e.xUrl, "href")} target="_blank" rel="noopener">${e.title}</a>` : e.title}</h3><p class="ev__where mono">${e.location}</p><p class="ev__summary">${e.summary}</p>${sec.up && renderTemplate`<p class="ev__cal">${e.registerUrl && renderTemplate`<a class="ev__register"${addAttribute(e.registerUrl, "href")} target="_blank" rel="noopener">Register ↗</a>`}<span class="mono">Add to</span><a${addAttribute(googleUrl(e, site), "href")} target="_blank" rel="noopener">Google</a><a${addAttribute(outlookUrl(e, "work", site), "href")} target="_blank" rel="noopener" title="Outlook for KFUPM and work accounts">Outlook</a><a${addAttribute(outlookUrl(e, "personal", site), "href")} target="_blank" rel="noopener" title="Outlook.com personal accounts">Outlook.com</a><a${addAttribute(`/api/events/${e.slug}.ics`, "href")}${addAttribute(`${e.slug}.ics`, "download")}>.ics</a></p>`}${sec.up && e.registrationOpen && renderTemplate`<div class="ev__rsvp"><form method="post"${addAttribute(`/api/events/${e.id}/register`, "action")} data-signed-in hidden><input type="hidden" name="next"${addAttribute(`/timeline#ev-${e.slug}`, "value")}><label class="ev__copy"><input type="checkbox" name="email_copy" value="1"> email me a copy</label><button class="btn btn--small" type="submit"${addAttribute(full(e), "disabled")}>${full(e) ? "Full" : "Reserve a spot"} <span aria-hidden="true">→</span></button></form><a class="btn btn--small btn--ghost" data-signed-out${addAttribute(`/join?next=${encodeURIComponent(`/timeline#ev-${e.slug}`)}`, "href")}>Sign in to reserve a spot</a><span class="mono ev__spots">${spots(e)}</span></div>`}</div><span class="tag ev__tag">${e.type}</span></article>`)}</div>`)}</div>`)}</div><aside class="events__side"><div class="cal"${addAttribute(calData, "data-events")}><div class="cal__head"><span class="mono">Calendar</span><a class="cal__ics" href="/calendar.ics" download="kfupm-computer-club.ics">Add iCal</a></div><div class="cal__nav"><strong class="cal__month"></strong><span><button type="button" class="cal__prev" aria-label="Previous month">‹</button><button type="button" class="cal__next" aria-label="Next month">›</button></span></div><div class="cal__grid" role="grid"></div><p class="cal__hint mono">Highlighted days have events. Click one to jump to it. Subscribe to the feed to get every upcoming event in your calendar.</p></div></aside></div></section>` })}${renderScript($$result, "/home/user/website/src/pages/timeline.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/website/src/pages/timeline.astro", "self");
var $$file = "/home/user/website/src/pages/timeline.astro";
var $$url = "/timeline";
//#endregion
//#region \0virtual:astro:page:src/pages/timeline@_@astro
var page = () => timeline_exports;
//#endregion
export { page };
