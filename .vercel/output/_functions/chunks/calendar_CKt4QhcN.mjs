import { C as __exportAll, v as getUpcomingEvents } from "./content_DQWivrjm.mjs";
import { n as ics } from "./calendar_j6Emk0XI.mjs";
//#region src/pages/calendar.ics.ts
var calendar_ics_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async ({ site }) => new Response(ics(await getUpcomingEvents(), site?.origin || ""), { headers: {
	"Content-Type": "text/calendar; charset=utf-8",
	"Cache-Control": "public, max-age=300"
} });
//#endregion
//#region \0virtual:astro:page:src/pages/calendar.ics@_@ts
var page = () => calendar_ics_exports;
//#endregion
export { page };
