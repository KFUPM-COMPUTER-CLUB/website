import { P as __exportAll, k as invalidateMedia, t as bust } from "./content_cbSbtds5.mjs";
import { a as handle, m as requireRole, n as audit, p as readBody, r as bool, u as json } from "./api_BB02cnYN.mjs";
import { t as runStep } from "./importer_9IwkuZSX.mjs";
//#region src/pages/api/admin/import.ts
var import_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = handle(async (ctx) => {
	const admin = requireRole(ctx, "admin");
	const b = await readBody(ctx.request);
	const step = {
		step: [
			"photos",
			"logos",
			"data"
		].includes(b.step) ? b.step : "photos",
		offset: Math.max(0, parseInt(String(b.offset || 0), 10) || 0)
	};
	const r = await runStep(step, bool(b.force));
	if (!r.next) {
		bust();
		invalidateMedia();
		await audit(admin.id, "other", "import", null, null, { force: bool(b.force) });
	}
	return json({
		ok: true,
		...r
	});
});
//#endregion
//#region \0virtual:astro:page:src/pages/api/admin/import@_@ts
var page = () => import_exports;
//#endregion
export { page };
