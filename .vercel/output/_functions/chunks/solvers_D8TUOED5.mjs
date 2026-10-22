import { D as __exportAll } from "./content_Dw4BquHy.mjs";
import { c as serviceReady, r as serviceClient } from "./supabase_BYajXEmb.mjs";
import { a as handle, f as ok, i as guardRate, p as readBody, t as ApiError, v as str } from "./api_L-wuzLIp.mjs";
//#region src/pages/api/flag/solvers.ts
var solvers_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var DIGEST = "ab5b2416c1919874bbfea712414a31735c66a89b31b471ffe6cc5f0606169e3a";
var sha256 = async (t) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t))), (b) => b.toString(16).padStart(2, "0")).join("");
var POST = handle(async (ctx) => {
	if (!serviceReady()) throw new ApiError("Not available.", 503);
	await guardRate(ctx.request, "flag", 5, 600);
	const b = await readBody(ctx.request);
	if (await sha256(str(b.flag, 80)) !== DIGEST) throw new ApiError("That is not the flag.", 400);
	const name = str(b.name, 40), handle = str(b.handle, 40);
	if (!name) throw new ApiError("A name is required.");
	const { error } = await serviceClient().from("flag_solvers").insert({
		name,
		handle: handle || null,
		user_id: ctx.locals.user?.id || null,
		approved: false
	});
	if (error) throw new ApiError(error.message, 500);
	return ok({ pending: true });
});
//#endregion
//#region \0virtual:astro:page:src/pages/api/flag/solvers@_@ts
var page = () => solvers_exports;
//#endregion
export { page };
