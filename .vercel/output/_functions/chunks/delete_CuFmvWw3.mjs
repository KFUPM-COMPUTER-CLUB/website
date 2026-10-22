import { P as __exportAll } from "./content_DecWaDc1.mjs";
import { i as sessionClient, r as serviceClient } from "./supabase_BOJmasnu.mjs";
import { a as handle, h as requireUser, p as readBody, t as ApiError } from "./api_CGwffj9f.mjs";
//#region src/pages/api/me/delete.ts
var delete_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = handle(async (ctx) => {
	const user = requireUser(ctx);
	const b = await readBody(ctx.request);
	if (String(b.confirm || "").trim().toLowerCase() !== "delete") throw new ApiError("Type \"delete\" to confirm.");
	const sb = serviceClient();
	await sb.from("audit_log").insert({
		actor_id: null,
		action: "delete",
		table_name: "profiles",
		row_id: user.id,
		before: {
			id: user.id,
			email: user.email
		},
		after: null
	});
	const { error } = await sb.auth.admin.deleteUser(user.id);
	if (error) throw new ApiError(`Could not delete the account: ${error.message}`, 500);
	await sessionClient(ctx.request, ctx.cookies).auth.signOut();
	ctx.cookies.delete("cc_in", { path: "/" });
	return ctx.redirect("/?deleted=1", 303);
});
//#endregion
//#region \0virtual:astro:page:src/pages/api/me/delete@_@ts
var page = () => delete_exports;
//#endregion
export { page };
