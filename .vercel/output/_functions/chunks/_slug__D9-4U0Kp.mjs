import { C as __exportAll, i as getEvent } from "./content_DQWivrjm.mjs";
import { n as ics } from "./calendar_j6Emk0XI.mjs";
//#region src/pages/api/events/[slug].ics.ts
var _slug__ics_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async ({ params, site }) => {
	const e = await getEvent(params.slug || "");
	if (!e) return new Response("Not found", { status: 404 });
	return new Response(ics([e], site?.origin || ""), { headers: {
		"Content-Type": "text/calendar; charset=utf-8",
		"Content-Disposition": `attachment; filename="${e.slug}.ics"`,
		"Cache-Control": "public, max-age=300"
	} });
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/events/[slug].ics@_@ts
var page = () => _slug__ics_exports;
//#endregion
export { page };
