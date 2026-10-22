import { b as riyadhDate, n as eventEnd } from "./content_DecWaDc1.mjs";
//#region src/lib/calendar.ts
var stamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
var dateOnly = (d) => riyadhDate(d).replace(/-/g, "");
var endExclusive = (e) => {
	const end = eventEnd(e);
	const [y, m, d] = riyadhDate(end).split("-").map(Number);
	const n = new Date(Date.UTC(y, m - 1, d + 1));
	return `${n.getUTCFullYear()}${String(n.getUTCMonth() + 1).padStart(2, "0")}${String(n.getUTCDate()).padStart(2, "0")}`;
};
var details = (e, site) => [
	e.summary,
	e.xUrl,
	`${site}/timeline#ev-${e.slug}`
].filter(Boolean).join("\n");
function googleUrl(e, site = "") {
	return `https://calendar.google.com/calendar/render?${new URLSearchParams({
		action: "TEMPLATE",
		text: e.title,
		dates: e.allDay ? `${dateOnly(e.start)}/${endExclusive(e)}` : `${stamp(e.start)}/${stamp(eventEnd(e))}`,
		details: details(e, site),
		location: e.location,
		ctz: "Asia/Riyadh"
	})}`;
}
function outlookUrl(e, kind, site = "") {
	const q = new URLSearchParams({
		path: "/calendar/action/compose",
		rru: "addevent",
		subject: e.title,
		startdt: e.start.toISOString(),
		enddt: eventEnd(e).toISOString(),
		body: details(e, site),
		location: e.location
	});
	if (e.allDay) q.set("allday", "true");
	return `https://${kind === "work" ? "outlook.office.com" : "outlook.live.com"}/calendar/0/deeplink/compose?${q}`;
}
var esc = (s) => String(s ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
function vevent(e, site = "") {
	return [
		"BEGIN:VEVENT",
		`UID:${e.slug}@cckfupm`,
		`DTSTAMP:${stamp(/* @__PURE__ */ new Date())}`,
		e.allDay ? `DTSTART;VALUE=DATE:${dateOnly(e.start)}` : `DTSTART:${stamp(e.start)}`,
		e.allDay ? `DTEND;VALUE=DATE:${endExclusive(e)}` : `DTEND:${stamp(eventEnd(e))}`,
		`SUMMARY:${esc(e.title)}`,
		`DESCRIPTION:${esc(details(e, site))}`,
		`LOCATION:${esc(e.location)}`,
		e.xUrl ? `URL:${e.xUrl}` : null,
		"END:VEVENT"
	].filter(Boolean).join("\r\n");
}
function ics(events, site = "") {
	return [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//KFUPM Computer Club//Events//EN",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		"X-WR-CALNAME:KFUPM Computer Club",
		"X-WR-TIMEZONE:Asia/Riyadh",
		...events.map((e) => vevent(e, site)),
		"END:VCALENDAR"
	].join("\r\n") + "\r\n";
}
//#endregion
export { ics as n, outlookUrl as r, googleUrl as t };
